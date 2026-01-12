import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from "axios";
import {userStore} from "@/stores/UserStore.js";

export const userChat = defineStore('userChat', () => {
    const friendList = ref([]);
    const agreeingList = ref([]);

    function getFriendList(){
        return friendList;
    }
    function getAgreeingList(){
        return agreeingList;
    }

    async function updateFriendList(){
        const res = await axios.post('/api/chat/sessions/list', {
        });
        friendList.value=res.data.data.sessions;
    }
    async function updateAgreeingList(){
        const res = await axios.post('/api/chat/friends/request/list', {
        });
        console.log(res);
        agreeingList.value=res.data.data.items;
    }
    // 最小实现：根据 userId 设置在线状态（保持响应式）
    function setFriendOnline(userId, online) {
        const f = friendList.value.find(x => Number(x.sessionTargetId) === Number(userId));
        if (f) {
            f.online = !!online;
        }
    }


    const me = userStore();
    // 当前会话
    const selectedConversation = ref(null);
    // 按 conversation key 存的消息数组（key 格式： user_<otherId>）
    const messages = ref({});

    /*设置当前会话*/
/*    userchat.selectConversation({
        id: item.sessionTargetId,
        name: item.title,
        avatarUrl: item.avatarUrl,     // 与 ChatHeader 里使用的字段名对应
        signature: item.signature,
    });*/
    function selectConversation(user) {
        selectedConversation.value = user;
        if(user===null)return;
        const key = `user_${String(user.id)}`;
        messages.value[key] = messages.value[key] || [];
    }
    function getSelectedConversation(){
        return selectedConversation;
    }
    function resetForLogout() {
        selectedConversation.value = null;
        messages.value = {};
        // 可选： friendList.value = []; agreeingList.value = [];
    }
    // 返回当前选中会话的消息数组（保证返回的是响应式数组引用）
    function getMessagesForSelected(){
        const conv = selectedConversation.value;
        if (!conv) return [];
        const key = `user_${String(conv.id)}`;
        messages.value[key] = messages.value[key] || [];
        return messages.value[key];
    }

    // 追加私聊消息：把消息放到 otherId 的会话数组里
    function appendPrivateMessage(fromUserId, toUserId, msg) {
        const myId = String(me.getUserId()); // 确保 userStore.getUserId() 返回 value
        const from = String(fromUserId);
        const to = String(toUserId);
        const otherId = (from === myId) ? to : from;
        const key = `user_${otherId}`;
        messages.value[key] = messages.value[key] || [];
        messages.value[key].push(msg);

        // 如果当前打开的是这个会话，可以在这里做额外处理（例如：发送已读回执 / 标记为已读）
        const sel = selectedConversation.value;
        if (sel && String(sel.id) === otherId) {
            // 当前会话就是这个 otherId
            // e.g. send read receipt (通过 RealTime) 或触发 UI 滚动（ChatWindow 也会监测 messages）
            // sendReadReceipt(otherId)  // 按需实现
        } else {
            // 非当前会话：可以增加 friendList 中对应项的 unreadCount（按需实现）
        }
    }

    // 以 key 追加消息（提供给其它逻辑使用）
    function appendMessageByKey(key, msg) {
        messages.value[key] = messages.value[key] || [];
        messages.value[key].push(msg);
    }

    async function loadAllFriendHistories(page = 0) {
        if (!friendList.value || friendList.value.length === 0) return;

        // 并行请求每个好友的记录（失败不会中断其它请求）
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
            // 常见后端结构： res.data.data.messages
            const msgs = res.data?.data?.messages || res.data?.messages || [];
            // 后端返回 0 是最新 -> 逆序为从旧到新，便于按顺序 push
            if (Array.isArray(msgs) && msgs.length > 1) {
                msgs.reverse();
            }

            msgs.forEach(p => {
                // 规范化时间到 timestamp（毫秒）
                let created = p.createdAt || p.created_at || null;
                if (created && typeof created === 'string') {
                    created = created.replace(/(\.\d{3})\d+/, '$1'); // 保留到毫秒
                }
                const timestamp = created ? new Date(created).getTime() : (p.timestamp || Date.now());

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

                // 使用现有的 appendPrivateMessage 将消息放入对应会话数组
                appendPrivateMessage(p.fromUserId, p.toUserId, msg);
            });
        });
    }
    return {
        getAgreeingList,
        getFriendList,
        updateFriendList,
        updateAgreeingList,
        setFriendOnline,
        resetForLogout,
        // 新增导出
        getSelectedConversation,
        getMessagesForSelected,
        selectConversation,
        appendMessageByKey,
        loadAllFriendHistories,
        appendPrivateMessage
    };
});