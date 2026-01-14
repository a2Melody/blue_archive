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
    const messages = ref({}); // key: user_<otherId> -> array of msgs

    function getSelectedConversation(){ return selectedConversation; }
    function resetForLogout() { selectedConversation.value = null; messages.value = {}; }

    function getMessagesForSelected(){
        const conv = selectedConversation.value;
        if (!conv) return [];
        const key = `user_${String(conv.id)}`;
        messages.value[key] = messages.value[key] || [];
        return messages.value[key];
    }

    // append a private message to conversation with otherId
    function appendPrivateMessage(fromUserId, toUserId, msg) {
        const myId = String(me.getUserId());
        const otherId = (String(fromUserId) === myId) ? String(toUserId) : String(fromUserId);
        const key = `user_${otherId}`;
        messages.value[key] = messages.value[key] || [];

        // ensure logic id present (front-end uses it for recall/delete cross-user sync)
        if (msg && msg.logicMessageId == null) {
            msg.logicMessageId = msg.id;
        }
        // my-sent messages carry read receipt flag (default false)
        if (String(msg?.fromUserId) === myId && typeof msg._read === 'undefined') {
            msg._read = false;
        }

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
                console.warn('[loadAllFriendHistories] failed friendId=', friend?.sessionTargetId, res && res.__err);
                return;
            }
            const msgs = res.data?.data?.messages || res.data?.messages || [];
            if (Array.isArray(msgs) && msgs.length > 1) msgs.reverse();

            msgs.forEach(p => {
                let created = p.createdAt || p.created_at || null;
                if (created && typeof created === 'string') {
                    created = created.replace(/(\.\d{3})\d+/, '$1');
                }
                const timestamp = created ? new Date(created).getTime() : (p.timestamp || Date.now());
                const logicMessageId =
                    p.logicMessageId ??
                    p.logic_message_id ??
                    p.logicId ??
                    p.logic_id ??
                    p.id;

                const msg = {
                    id: logicMessageId,                 // keep logic id for cross-user consistency
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

                appendPrivateMessage(p.fromUserId, p.toUserId, msg);
            });
        });
    }

    function selectConversation(user) {
        selectedConversation.value = user;
        if (!user) return;
        const key = `user_${String(user.id)}`;
        messages.value[key] = messages.value[key] || [];
        // 不在此立即标记已读；改为由 ChatWindow 在“滚动到底部且窗口激活”时触发
    }

    // session preview helpers
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
        const otherId = (String(fromUserId) === myId) ? String(toUserId) : String(fromUserId);
        const item = ensureSessionItemForFriend(otherId);

        item.lastMessageTime = msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString();
        item.lastMessagePreview = buildPreview(msg.messageType, msg.content);

        const isIncoming = (String(toUserId) === myId);
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

    // 后端“标记已读”接口：把对方发给我的未读全部标记为已读
    async function markConversationRead(otherId) {
        const idNum = Number(otherId);
        // 左侧会话未读清零（本地）
        const item = friendList.value.find(x => Number(x.sessionTargetId) === idNum);
        if (item) item.unreadCount = 0;
        // 后端持久化（避免多次重复调用，具体节流在调用方做）
        try {
            await axios.post('/api/chat/messages/private/markRead', { friendId: idNum });
        } catch (e) {
            console.warn('[markConversationRead] api failed', e?.message);
        }
    }

    function getPendingRequestsCount() {
        return (agreeingList.value || []).length;
    }

    // 撤回：按 logicMessageId 移除所有会话里的该条消息（A/B 两端皆适用）
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

    // 已读回执：对方 readerId 读取了我的消息 -> 标记“我发给 readerId 的消息”为已读
    function markMyMessagesReadByReader(readerId) {
        console.log('read' + readerId);
        const myId = String(me.getUserId());
        const key = `user_${String(readerId)}`;
        const arr = messages.value[key] || [];
        arr.forEach(m => {
            if (String(m.fromUserId) === myId) m._read = true;
        });
    }

    return {
        // lists
        getAgreeingList,
        getFriendList,
        updateFriendList,
        updateAgreeingList,
        setFriendOnline,

        // conv/messages
        resetForLogout,
        getSelectedConversation,
        getMessagesForSelected,
        selectConversation,
        loadAllFriendHistories,
        appendPrivateMessage,
        updateSessionOnNewPrivateMessage,

        // read/unread + receipts
        markConversationRead,
        markMyMessagesReadByReader,

        // misc
        getPendingRequestsCount,
        recallMessageByLogicId,
    };
});