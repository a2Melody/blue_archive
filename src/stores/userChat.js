import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from "axios";

export const userChat = defineStore('userChat', () => {
    let friendList=ref(null);
    let agreeingList=ref(null);

    function getFriendList(){
        return friendList;
    }
    function getAgreeingList(){
        return agreeingList;
    }

    async function updateFriendList(){
        const res = await axios.post('/api/chat/sessions/list', {
        });
        friendList=res.data.data.sessions;
        console.log("拉取好友列表:  ")
        console.log(res);
    }
    async function updateAgreeingList(){
        const res = await axios.post('/api/chat/friends/request/list', {
        });
        agreeingList=res.data.data.items;
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