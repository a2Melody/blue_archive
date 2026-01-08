import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from "axios";

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
        console.log("拉取好友列表:  ")
        console.log(res);
        friendList.value=res.data.data.sessions;

    }
    async function updateAgreeingList(){
        const res = await axios.post('/api/chat/friends/request/list', {
        });
        console.log("拉取待同意列表:  ");
        console.log(res);
        agreeingList.value=res.data.data.items;

    }

    return {
        getAgreeingList,
        getFriendList,
        updateFriendList,
        updateAgreeingList
    };
});