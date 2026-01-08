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
        friendList.value=res.data.data.sessions;
        console.log("拉取好友列表:  ")

        console.log(friendList);
    }
    async function updateAgreeingList(){
        const res = await axios.post('/api/chat/friends/request/list', {
        });
        agreeingList.value=res.data.data.items;
        console.log("拉取待同意列表:  ");
        console.log(agreeingList);
    }

    return {
        getAgreeingList,
        getFriendList,
        updateFriendList,
        updateAgreeingList
    };
});