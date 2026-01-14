// RealTime.js — handle PRIVATE_MESSAGES_READ and MESSAGE_RECALLED, plus normal routing
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userStore } from "@/stores/UserStore.js";
import { userChat } from "@/stores/userChat.js";

export const realTime = defineStore('realTime', () => {
    let ws = null;
    const connected = ref(false);
    const user = userStore();
    const uc = userChat();

    // lightweight pub/sub for WebRTC and whiteboard signals
    const listeners = new Map();
    function onSignal(type, handler) {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(handler);
    }
    function offSignal(type, handler) {
        const arr = listeners.get(type) || [];
        listeners.set(type, arr.filter(h => h !== handler));
    }
    function emitSignal(type, payload) {
        const arr = listeners.get(type) || [];
        arr.forEach(h => { try { h(payload); } catch (e) { console.error('[onSignal] error', e); } });
    }

    function initWs(wsBase = 'wss://localhost:8443') {
        const token = user.getToken();
        if (!token) {
            console.warn('[RT] initWs: no token, skip');
            return;
        }
        const base = wsBase.replace(/\/+$/, '');
        const url = `${base}/ws/chat?token=${encodeURIComponent(token)}`;

        // reuse if same URL
        if (ws && ws.readyState === WebSocket.OPEN && ws._url === url) return;

        // close previous
        if (ws) {
            try { ws.close(); } catch {}
            ws = null;
        }
        try {
            ws = new WebSocket(url);
            ws._url = url;
        } catch (e) {
            console.error('[RT] new WebSocket failed', e);
            return;
        }

        ws.onopen = () => {
            connected.value = true;
            console.log('[WS] open');
        };
        ws.onmessage = (ev) => {
            let env;
            try { env = JSON.parse(ev.data); } catch {
                console.warn('[WS] non-JSON message', ev.data);
                return;
            }
            handleEnvelope(env);
        };
        ws.onclose = (ev) => {
            connected.value = false;
            console.warn('[WS] close', ev.code, ev.reason);
        };
        ws.onerror = (ev) => {
            console.error('[WS] error', ev);
        };
    }

    function closeWs() {
        if (ws) try { ws.close(); } catch {}
    }

    function handleEnvelope(env) {
        const type = String(env?.type ?? '').trim();
        const p = env?.payload || {};
        console.debug('[WS] envelope', p);
        switch (type) {
            // WebRTC signaling
            case 'CALL_INVITE':
            case 'CALL_ANSWER':
            case 'CALL_ICE':
            case 'CALL_HANGUP':
            case 'CALL_REJECT':
            case 'CALL_FAILED':
                emitSignal(type, p);
                break;

            // Whiteboard events
            case 'WHITEBOARD_OPENED':
            case 'WHITEBOARD_INIT':
            case 'WHITEBOARD_EVENT':
            case 'WHITEBOARD_CLEAR':
            case 'WHITEBOARD_ERROR':
                emitSignal(type, p);
                break;

            // Friends
            case 'NEW_FRIEND_REQUEST':
                uc.updateAgreeingList();
                break;
            case 'ACCEPT_FRIEND_REQUEST':
                uc.updateFriendList();
                uc.updateAgreeingList();
                break;
            case 'REJECT_FRIEND_REQUEST':
                uc.updateAgreeingList();
                break;

            // Chat messages
            case 'NEW_PRIVATE_MESSAGE':
            case 'NEW_MESSAGE': {
                try {
                    let created = p.createdAt || null;
                    if (created && typeof created === 'string') {
                        created = created.replace(/(\.\d{3})\d+/, '$1');
                    }
                    const timestamp = created ? new Date(created).getTime() : Date.now();

                    const logicMessageId =
                        p.logicMessageId ??
                        p.logic_message_id ??
                        p.logicId ??
                        p.logic_id ??
                        p.id;

                    const msg = {
                        id: logicMessageId,                       // use logic id for cross-user matching
                        logicMessageId,
                        conversationType: p.conversationType,
                        fromUserId: p.fromUserId,
                        toUserId: p.toUserId,
                        groupId: p.groupId || null,
                        messageType: p.messageType,
                        content: p.content,
                        imageUrl: p.imageUrl || p.fileUrl || null,
                        timestamp
                    };

                    uc.appendPrivateMessage(p.fromUserId, p.toUserId, msg);

                    if (String(p.conversationType).toUpperCase() === 'PRIVATE') {
                        uc.updateSessionOnNewPrivateMessage(p.fromUserId, p.toUserId, msg);
                    }
                } catch (e) {
                    console.error('[WS] NEW_MESSAGE handling failed', e, p);
                }
                break;
            }

            // Recall events sent to all affected users: { logicMessageId, conversationType, senderId }
            case 'MESSAGE_RECALLED': {
                const logicId =
                    p.logicMessageId ??
                    p.logic_message_id ??
                    p.logicId ??
                    p.logic_id ??
                    null;
                if (logicId == null) {
                    console.warn('[WS] MESSAGE_RECALLED missing logicMessageId', p);
                    break;
                }
                uc.recallMessageByLogicId(String(logicId));
                break;
            }

            // Peer read receipts: sent to the sender when the other party marks PRIVATE messages read
            // payload: { conversationType:"PRIVATE", readerId, friendId, lastReadMessageId }
            case 'PRIVATE_MESSAGES_READ': {
                try {
                    console.error('[WS] PRIVATE_MESSAGES_READ');
                    uc.markMyMessagesReadByReader(p.readerId);
                } catch (e) {
                    console.error('[WS] PRIVATE_MESSAGES_READ handling failed', e, p);
                }
                break;
            }

            // presence
            case 'USER_ONLINE': {
                const uid = Number(p.userId);
                if (!isNaN(uid)) uc.setFriendOnline(uid, true);
                break;
            }
            case 'USER_OFFLINE': {
                const uid = Number(p.userId);
                if (!isNaN(uid)) uc.setFriendOnline(uid, false);
                break;
            }

            default:
                console.debug('Unhandled WS event', type, p);
        }
    }

    function sendWsEnvelope(type, payload) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('[WS SEND] not connected', { type, payload });
            return;
        }
        try {
            ws.send(JSON.stringify({ type, payload }));
        } catch (e) {
            console.error('[WS SEND] send failed', e);
        }
    }

    function sendPrivateText(targetUserId, content) {
        const payload = {
            conversationType: 'PRIVATE',
            targetUserId: Number(targetUserId),
            groupId: null,
            messageType: 'TEXT',
            content: String(content),
            attachmentId: null
        };
        sendWsEnvelope('SEND_MESSAGE', payload);
    }

    return {
        initWs,
        closeWs,
        sendWsEnvelope,
        sendPrivateText,
        onSignal,
        offSignal,
        connected,
    };
});