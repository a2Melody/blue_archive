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

    // 新增：当前选中的会话（user 对象或 null）
    const selectedConversation = ref(null);
    // 新增：按 conversation key 存的消息数组（key 格式： user_<otherId>）
    const messages = ref({});

    function getSelectedConversation(){
        return selectedConversation;
    }
    // 返回当前选中会话的消息数组（若未初始化则返回空数组）
    function getMessagesForSelected(){
        const conv = selectedConversation.value;
        if (!conv) return [];
        const key = convKey(conv);
        messages.value[key] = messages.value[key] || [];
        return messages.value[key];
    }
// 选中会话（例如在用户列表点击时调用）
    function selectConversation(user) {
        selectedConversation.value = user;
        const key = convKey(user);
        messages.value[key] = messages.value[key] || [];
    }

    // 以 key 追加消息
    function appendMessageByKey(key, msg) {
        messages.value[key] = messages.value[key] || [];
        messages.value[key].push(msg);
    }

    // 追加私聊消息：根据当前登录用户决定把消息放到哪个 "other" 的会话里
    // fromUserId, toUserId 是 Number 或 String
    function appendPrivateMessage(fromUserId, toUserId, msg) {
        const myId = String(me.getId()); // 依赖 userStore 提供 getId()
        const from = String(fromUserId);
        const to = String(toUserId);
        // otherId 为“另一方”的 id（非我自己）
        const otherId = (from === myId) ? to : from;
        const key = `user_${otherId}`;
        appendMessageByKey(key, msg);
    }

    // helper: 把 user 对象转成 key（针对私聊）
    function convKey(user) {
        if (!user) return '';
        return `user_${user.id}`;
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