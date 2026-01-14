// RealTime.js - 使用基于 location 的 websocket URL（支持通过 Vite proxy 转发 /ws）
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userStore } from "@/stores/UserStore.js";
import { userChat } from "@/stores/userChat.js";

export const realTime = defineStore('realTime', () => {
    let ws = null;
    let connected = ref(false);
    const user = userStore();

    const _signalListeners = new Map();
    function onSignal(type, handler) {
        if (!_signalListeners.has(type)) _signalListeners.set(type, []);
        _signalListeners.get(type).push(handler);
    }
    function offSignal(type, handler) {
        const arr = _signalListeners.get(type) || [];
        _signalListeners.set(type, arr.filter(h => h !== handler));
    }
    function _emitSignal(type, payload) {
        const arr = _signalListeners.get(type) || [];
        arr.forEach(h => {
            try { h(payload); } catch (e) { console.error('[onSignal handler] error', e); }
        });
    }

    /**
     * initWs:
     * - 如果传入 wsBase（显式基础 URL），使用它（保持向后兼容）
     * - 否则根据当前页面 location 自动构造 websocket URL（便于在局域网通过 Vite proxy 使用）
     *
     * 使用示例：
     *   rt.initWs(); // 自动使用 location.host -> ws://<host>:<port>/ws/chat?token=...
     *   rt.initWs('wss://your-backend:8443'); // 强制某个 backend url
     */
    function initWs(wsBase) {
        const token = user.getToken();
        if (!token) {
            console.warn('[initWs] no token available yet');
            return;
        }

        let url;
        if (wsBase && typeof wsBase === 'string' && wsBase.trim() !== '') {
            const base = wsBase.replace(/\/+$/, '');
            url = `${base}/ws/chat?token=${encodeURIComponent(token)}`;
        } else {
            // 根据当前页面协议和 host 构造。使用 /ws 路径（与 vite.proxy '/ws' 对应）
            const proto = (window.location.protocol === 'https:') ? 'wss' : 'ws';
            const host = window.location.host; // 包含 hostname:port
            url = `${proto}://${host}/ws/chat?token=${encodeURIComponent(token)}`;
        }

        console.log('[initWs] ws url =', url);

        // 防止重复创建连接到相同 url
        if (ws && ws.readyState === WebSocket.OPEN && ws._url === url) {
            console.log('[initWs] already connected to same url, skip');
            return;
        }
        if (ws) {
            try { ws.close(); } catch (e) { /* ignore */ }
            ws = null;
        }

        try {
            ws = new WebSocket(url);
            ws._url = url;
        } catch (e) {
            console.error('[initWs] new WebSocket throw', e);
            return;
        }

        ws.onopen = () => {
            connected.value = true;
            console.log('[WS] onopen - connected = true');
        };
        ws.onmessage = (ev) => {
            try {
                const env = JSON.parse(ev.data);
                handleEnvelope(env);
            } catch (e) {
                console.warn('[WS] onmessage - 非 JSON 收到', ev.data);
            }
        };
        ws.onclose = (ev) => {
            connected.value = false;
            console.warn('[WS] onclose', ev.code, ev.reason, 'wasClean=', ev.wasClean);
        };
        ws.onerror = (ev) => {
            console.error('[WS] onerror', ev);
        };
    }

    function closeWs() {
        if (ws) ws.close();
    }

    const userchat = userChat();
    function handleEnvelope(env) {
        const rawType = env && env.type;
        const type = (rawType === null || rawType === undefined) ? '' : String(rawType).trim();
        const p = env.payload || {};
        switch (type) {
            case 'CALL_INVITE':
            case 'CALL_ANSWER':
            case 'CALL_ICE':
            case 'CALL_HANGUP':
            case 'CALL_REJECT':
            case 'CALL_FAILED':
                _emitSignal(type, p);
                break;

            case 'WHITEBOARD_OPENED':
            case 'WHITEBOARD_INIT':
            case 'WHITEBOARD_EVENT':
            case 'WHITEBOARD_CLEAR':
            case 'WHITEBOARD_ERROR':
                _emitSignal(type, p);
                break;

            case 'NEW_FRIEND_REQUEST':
                userchat.updateAgreeingList();
                break;
            case 'ACCEPT_FRIEND_REQUEST':
                userchat.updateFriendList();
                userchat.updateAgreeingList();
                break;

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
                        id: p.id,
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

                    userchat.appendPrivateMessage(p.fromUserId, p.toUserId, msg);

                    if (String(p.conversationType).toUpperCase() === 'PRIVATE') {
                        userchat.updateSessionOnNewPrivateMessage(p.fromUserId, p.toUserId, msg);
                    }
                } catch (e) {
                    console.error('[WS] 处理 NEW_MESSAGE 出错', e, p);
                }
                break;
            }

            case 'MESSAGE_RECALLED': {
                try {
                    const logicId =
                        p.logicMessageId ??
                        p.logic_message_id ??
                        p.logicId ??
                        p.logic_id ??
                        null;
                    if (logicId == null) {
                        console.warn('[WS] MESSAGE_RECALLED 缺少 logicMessageId', p);
                        break;
                    }
                    userchat.recallMessageByLogicId(String(logicId));
                } catch (e) {
                    console.error('[WS] 处理 MESSAGE_RECALLED 出错', e, p);
                }
                break;
            }

            case 'PRIVATE_MESSAGES_READ': {
                try {
                    const readerId = Number(p.readerId);
                    const friendId = Number(p.friendId);
                    if (!Number.isNaN(readerId)) {
                        userchat.markMyMessagesReadByReader(readerId);
                    } else if (!Number.isNaN(friendId)) {
                        userchat.markMyMessagesReadByReader(friendId);
                    }
                } catch (e) {
                    console.error('[WS] 处理 PRIVATE_MESSAGES_READ 出错', e, p);
                }
                break;
            }

            case 'PEER_TYPING': {
                try {
                    const otherId = Number(p.fromUserId);
                    const isTyping = !!p.isTyping;
                    if (!Number.isNaN(otherId)) {
                        userchat.setPeerTyping(otherId, isTyping);
                    }
                } catch (e) {
                    console.error('[WS] 处理 PEER_TYPING 出错', e, p);
                }
                break;
            }

            case 'USER_ONLINE': {
                const uid = Number(p.userId);
                if (!isNaN(uid)) userchat.setFriendOnline(uid, true);
                break;
            }

            case 'USER_OFFLINE': {
                const uid = Number(p.userId);
                if (!isNaN(uid)) userchat.setFriendOnline(uid, false);
                break;
            }

            case 'REJECT_FRIEND_REQUEST':
                userchat.updateAgreeingList();
                break;

            default:
                console.debug('Unhandled WS event', type, p);
        }
    }

    function sendWsEnvelope(type, payload) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('[WS SEND] WebSocket 未连接，无法发送', { type, payload });
            return;
        }
        try {
            ws.send(JSON.stringify({ type, payload }));
        } catch (e) {
            console.error('[WS SEND] send 出错', e);
        }
    }

    function sendPrivateText(targetUserId, content) {
        sendWsEnvelope('SEND_MESSAGE', {
            conversationType: 'PRIVATE',
            targetUserId: Number(targetUserId),
            groupId: null,
            messageType: 'TEXT',
            content: String(content),
            attachmentId: null
        });
    }

    // Typing indicator
    function startTyping(targetUserId) { sendWsEnvelope('TYPING_START', { targetUserId: Number(targetUserId) }); }
    function stopTyping(targetUserId) { sendWsEnvelope('TYPING_STOP', { targetUserId: Number(targetUserId) }); }

    return {
        initWs,
        closeWs,
        sendWsEnvelope,
        sendPrivateText,
        onSignal,
        offSignal,
        startTyping,
        stopTyping,
    };
});