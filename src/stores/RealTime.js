import { defineStore } from 'pinia';
import { ref } from 'vue';
import {userStore} from "@/stores/UserStore.js";
import {userChat} from "@/stores/userChat.js";

export const realTime = defineStore('realTime', () => {
    let ws=null;
    let connected = ref(false);
    const user=userStore();

    /*视频通话部分*/
// 简单的信令事件发布/订阅（最小实现）
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


    function initWs(wsBase = 'wss://localhost:8443') {
        const token = user.getToken();
        if (!token) {
            console.warn('[initWs] no token available yet');
            return;
        }
        const base = wsBase.replace(/\/+$/, '');
        const url = `${base}/ws/chat?token=${encodeURIComponent(token)}`;
        console.log('[initWs] ws url =', url);
        //防止重复创建
        if (ws && ws.readyState === WebSocket.OPEN && ws._url === url) {
            console.log('[initWs] already connected to same url, skip');
            return;
        }
        //关闭旧连接
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
                console.log('[WS] onmessage');
                const env = JSON.parse(ev.data);
                handleEnvelope(env);
            } catch (e) {
                console.warn('[WS] onmessage -111 非 JSON 收到', ev.data);
                return;
            }
            console.log('[WS] onmessage');
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
        if (ws) {
            ws.close();
        }
    }

/*处理后端给我的消息*/
    const userchat=userChat()
    function handleEnvelope(env) {
        const rawType = env && env.type;
        console.log('[WS] envelope type raw:', JSON.stringify(rawType)); // 调试用，能显示隐藏字符
        const type = (rawType === null || rawType === undefined) ? '' : String(rawType).trim();
        const p = env.payload || {};
        switch(type) {
            case 'CALL_INVITE':
            case 'CALL_ANSWER':
            case 'CALL_ICE':
            case 'CALL_HANGUP':
            case 'CALL_REJECT':
            case 'CALL_FAILED': {
                // 最小化：把 payload 广播给订阅者，业务方（组件）来处理具体逻辑
                console.log('[WS] signaling event', type, p);
                _emitSignal(type, p);
                break;
            }
            case 'NEW_FRIEND_REQUEST':
                userchat.updateAgreeingList();
                break;
            case 'ACCEPT_FRIEND_REQUEST':
                userchat.updateFriendList();
                break;
            case 'NEW_PRIVATE_MESSAGE':
                break;
            case 'NEW_MESSAGE':
                try {
                    console.log("处理接收到的消息","其ev的payload值为",p)
                    // 有些后端会返回高精度的 fractional seconds（超过 3 位），
                    // 先把小数秒裁到毫秒精度再交给 Date 解析，避免部分环境解析失败
                    let created = p.createdAt || null;
                    if (created && typeof created === 'string') {
                        created = created.replace(/(\.\d{3})\d+/, '$1'); // 保留到毫秒
                    }
                    const timestamp = created ? new Date(created).getTime() : Date.now();

                    const msg = {
                        id: p.id,
                        conversationType: p.conversationType,
                        fromUserId: p.fromUserId,
                        toUserId: p.toUserId,
                        groupId: p.groupId || null,
                        messageType: p.messageType,
                        content: p.content,
                        // 优先使用后端可能的 imageUrl，若没有再使用 fileUrl（后端示例里是 fileUrl）
                        imageUrl: p.imageUrl || p.fileUrl || null,
                        timestamp: timestamp
                    };
                    userchat.appendPrivateMessage(p.fromUserId, p.toUserId, msg);
                } catch (e) {
                    console.error('[WS] 处理 NEW_MESSAGE/NEW_PRIVATE_MESSAGE 出错', e, p);
                }
                break;
            case 'USER_ONLINE': {
                const uid = Number(p.userId);
                if (!isNaN(uid)) {
                    // 将该好友标为在线
                    userchat.setFriendOnline(uid, true);
                }
                break;
            }
            case 'USER_OFFLINE': {
                const uid = Number(p.userId);
                if (!isNaN(uid)) {
                    // 将该好友标为离线
                    userchat.setFriendOnline(uid, false);
                }
                break;
            }
            default:
                console.debug('Unhandled WS event', type, p);
        }
    }

/*发送消息*/
    function sendWsEnvelope(type, payload) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('[WS SEND] WebSocket 未连接，无法发送', { type, payload });
            return;
        }
        const msg = { type, payload };
        console.log('WS SEND', msg);
        try {
            ws.send(JSON.stringify(msg));
        } catch (e) {
            console.error('[WS SEND] send 出错', e);
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
    };
});