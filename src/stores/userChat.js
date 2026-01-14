import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from "axios";
import { userStore } from "@/stores/UserStore.js";

export const userChat = defineStore('userChat', () => {
    const friendList = ref([]);
    const agreeingList = ref([]);

    function getFriendList(){ return friendList; }
    function getAgreeingList(){ return agreeingList; }

    async function updateFriendList(){
        const res = await axios.post('/api/chat/sessions/list', {});
        friendList.value = res.data.data.sessions;
    }
    async function updateAgreeingList(){
        const res = await axios.post('/api/chat/friends/request/list', {});
        agreeingList.value = res.data.data.items;
    }
    function setFriendOnline(userId, online) {
        const f = friendList.value.find(x => Number(x.sessionTargetId) === Number(userId));
        if (f) f.online = !!online;
    }

    const me = userStore();
    const selectedConversation = ref(null);
    const messages = ref({});

    function getSelectedConversation(){ return selectedConversation; }
    function resetForLogout() { selectedConversation.value = null; messages.value = {}; }

    function getMessagesForSelected(){
        const conv = selectedConversation.value;
        if (!conv) return [];
        const key = `user_${String(conv.id)}`;
        messages.value[key] = messages.value[key] || [];
        return messages.value[key];
    }

    // 追加私聊消息
    function appendPrivateMessage(fromUserId, toUserId, msg) {
        const myId = String(me.getUserId());
        const from = String(fromUserId);
        const to   = String(toUserId);
        const otherId = (from === myId) ? to : from;
        const key = `user_${otherId}`;
        messages.value[key] = messages.value[key] || [];

        if (msg && msg.logicMessageId == null) {
            msg.logicMessageId = msg.id;
        }
        if (String(msg?.fromUserId) === myId) {
            if (typeof msg._read === 'undefined') msg._read = !!msg.isRead; // 若后端含 isRead，可初始化
        }

        messages.value[key].push(msg);

        const sel = selectedConversation.value;
        if (sel && String(sel.id) === otherId) {
            // 当前会话：可在此发送已读回执（按需）
        }
    }

    function appendMessageByKey(key, msg) {
        messages.value[key] = messages.value[key] || [];
        messages.value[key].push(msg);
    }

    async function loadAllFriendHistories(page = 0) {
        if (!friendList.value || friendList.value.length === 0) return;

        const requests = friendList.value.map(f =>
            axios.post('/api/chat/messages/private/getMessage', {
                friendId: f.sessionTargetId,
                page
            }).catch(err => ({ __err: err }))
        );

        const results = await Promise.all(requests);

        results.forEach((res, idx) => {
            const friend = friendList.value[idx];
            if (!res || res.__err) {
                console.warn('[loadAllFriendHistories] 请求失败 friendId=', friend?.sessionTargetId, res && res.__err);
                return;
            }
            const msgs = res.data?.data?.messages || res.data?.messages || [];
            if (Array.isArray(msgs) && msgs.length > 1) {
                msgs.reverse();
            }

            msgs.forEach(p => {
                let created = p.createdAt || p.created_at || null;
                if (created && typeof created === 'string') {
                    created = created.replace(/(\.\d{3})\d+/, '$1');
                }
                const timestamp = created ? new Date(created).getTime() : (p.timestamp || Date.now());

                // 若后端未返回 isRead，在后续显示逻辑中默认 false/true 按 fromUserId 判断
                const msg = {
                    id: p.id,
                    logicMessageId:
                        p.logicMessageId ??
                        p.logic_message_id ??
                        p.logicId ??
                        p.logic_id ??
                        p.id,
                    conversationType: p.conversationType,
                    fromUserId: p.fromUserId,
                    toUserId: p.toUserId,
                    groupId: p.groupId || null,
                    messageType: p.messageType,
                    content: p.content,
                    imageUrl: p.imageUrl || p.fileUrl || null,
                    timestamp,
                    isRead: p.isRead, // 新增：用于初始化气泡的读回执（仅对我发出的消息有意义）
                };

                appendPrivateMessage(p.fromUserId, p.toUserId, msg);
            });
        });
    }

    function getConversationBoardId(otherId) {
        const key = `user_${String(otherId)}`;
        const obj = messages.value[key] || {};
        return obj._boardId || null;
    }
    function setConversationBoardId(otherId, boardId) {
        const key = `user_${String(otherId)}`;
        messages.value[key] = messages.value[key] || [];
        messages.value[key]._boardId = boardId;
    }

    function selectConversation(user) {
        selectedConversation.value = user;
        if (user === null) return;
        const key = `user_${String(user.id)}`;
        messages.value[key] = messages.value[key] || [];
        markConversationRead(user.id);
    }

    function buildPreview(messageType, content) {
        const t = String(messageType || '').toUpperCase();
        if (t === 'IMAGE') return '[图片]';
        if (t === 'FILE')  return '[文件]';
        if (t === 'VIDEO') return '[视频]';
        if (t === 'AUDIO') return '[音频]';
        if (!content) return '';
        const s = String(content);
        return s.length <= 10 ? s : s.slice(0, 10) + '...';
    }

    function ensureSessionItemForFriend(otherId) {
        const idNum = Number(otherId);
        let item = friendList.value.find(x => Number(x.sessionTargetId) === idNum);
        if (!item) {
            item = {
                sessionType: 'PRIVATE',
                sessionTargetId: idNum,
                title: String(idNum),
                lastMessagePreview: '',
                lastMessageTime: null,
                unreadCount: 0,
                signature: '',
                avatarUrl: null,
                online: false
            };
            friendList.value.push(item);
        }
        return item;
    }

    function updateSessionOnNewPrivateMessage(fromUserId, toUserId, msg) {
        const myId = String(me.getUserId());
        const from = String(fromUserId);
        const to   = String(toUserId);
        const otherId = (from === myId) ? to : from;
        const item = ensureSessionItemForFriend(otherId);

        item.lastMessageTime = msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString();
        item.lastMessagePreview = buildPreview(msg.messageType, msg.content);

        const isIncoming = (to === myId);
        const isActive = (selectedConversation.value && String(selectedConversation.value.id) === String(otherId));
        if (isIncoming && !isActive) {
            item.unreadCount = (item.unreadCount || 0) + 1;
        }

        friendList.value.sort((a, b) => {
            const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return tb - ta;
        });
    }

    async function markConversationRead(otherId) {
        const idNum = Number(otherId);
        const item = friendList.value.find(x => Number(x.sessionTargetId) === idNum);
        if (item) item.unreadCount = 0;
        try {
            await axios.post('/api/chat/messages/private/markRead', { friendId: idNum });
        } catch (e) {
            console.warn('[markConversationRead] api failed', e?.message);
        }
    }

    function getPendingRequestsCount() {
        return (agreeingList.value || []).length;
    }

    function recallMessageByLogicId(logicId) {
        if (logicId === undefined || logicId === null) return;
        const logicStr = String(logicId);
        Object.keys(messages.value).forEach(k => {
            const arr = messages.value[k];
            if (!Array.isArray(arr) || arr.length === 0) return;
            const filtered = arr.filter(m => {
                const mid = String(m.id);
                const lid = m.logicMessageId != null ? String(m.logicMessageId) : '';
                return mid !== logicStr && lid !== logicStr;
            });
            if (filtered.length !== arr.length) {
                messages.value[k].splice(0, arr.length, ...filtered);
            }
        });
    }

    function markMyMessagesReadByReader(readerId) {
        const key = `user_${String(readerId)}`;
        const arr = messages.value[key] || [];
        const myId = String(me.getUserId());
        arr.forEach(m => {
            if (String(m.fromUserId) === myId) m._read = true;
        });
    }

    // Typing indicator state per conversation
    const peerTypingMap = ref({}); // { otherId: boolean }
    const peerTypingTimers = {};   // { otherId: timeoutId }

    function setPeerTyping(otherId, isTyping) {
        const oid = String(otherId);
        peerTypingMap.value[oid] = !!isTyping;
        // Auto clear after 5s if no subsequent typing
        if (peerTypingTimers[oid]) {
            clearTimeout(peerTypingTimers[oid]);
            peerTypingTimers[oid] = null;
        }
        if (isTyping) {
            peerTypingTimers[oid] = setTimeout(() => {
                peerTypingMap.value[oid] = false;
                peerTypingTimers[oid] = null;
            }, 5000);
        }
    }
    function isPeerTyping(otherId) {
        return !!peerTypingMap.value[String(otherId)];
    }

    return {
        getAgreeingList,
        getFriendList,
        updateFriendList,
        updateAgreeingList,
        setFriendOnline,
        resetForLogout,
        getSelectedConversation,
        getMessagesForSelected,
        selectConversation,
        appendMessageByKey,
        loadAllFriendHistories,
        appendPrivateMessage,
        getConversationBoardId,
        setConversationBoardId,
        updateSessionOnNewPrivateMessage,
        markConversationRead,
        getPendingRequestsCount,
        recallMessageByLogicId,
        markMyMessagesReadByReader,
        // typing
        setPeerTyping,
        isPeerTyping,
    };
});