import { defineStore } from 'pinia';
import { ref } from 'vue';
import {userStore} from "@/stores/UserStore.js";

export const realTime = defineStore('realTime', () => {
    let ws=null;
    let connected = ref(false);
    const user=userStore();

    function initWs(wsBase = 'wss://10.206.43.151:8443') {
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
            let data;
            try {
                data = JSON.parse(ev.data);
            } catch (e) {
                console.warn('[WS] onmessage - 非 JSON 收到', ev.data);
                return;
            }
            console.log('[WS] onmessage', data);
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
        sendPrivateText
    };
});