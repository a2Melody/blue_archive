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
        console.log("拉取好友列表:  ",res)
        friendList.value=res.data.data.sessions;

    }
    async function updateAgreeingList(){
        const res = await axios.post('/api/chat/friends/request/list', {
        });
        console.log("拉取待同意列表:  ",res);
        agreeingList.value=res.data.data.items;
    }

/*ai紧急敲的  */
    const me = userStore();
    // 当前会话
    const selectedConversation = ref(null);
    // 按 conversation key 存的消息数组（key 格式： user_<otherId>）
    const messages = ref({});

    /*设置当前会话*/
    function selectConversation(user) {
        selectedConversation.value = user;
        if(user===null)return;
        const key = `user_${String(user.id)}`;
        messages.value[key] = messages.value[key] || [];
    }
    function getSelectedConversation(){
        return selectedConversation;
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


    return {
        getAgreeingList,
        getFriendList,
        updateFriendList,
        updateAgreeingList,
        // 新增导出
        getSelectedConversation,
        getMessagesForSelected,
        selectConversation,
        appendMessageByKey,
        appendPrivateMessage
    };
});