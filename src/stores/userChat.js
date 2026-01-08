import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from "axios";

export const userChat = defineStore('userChat', () => {
    const FriendList=ref(null);
    const agreeingList=ref(null);

    function getFriendList(){
        return FriendList;
    }
    function getAgreeingList(){
        return agreeingList;
    }
    async function updateFriendList(){
        const res = await axios.post('/api/chat/sessions/list', {
        });
        console.log("test-updateFriendList:"+res.data);
/*        const FriendList = res.data;
        console.log(FriendList);*/
    }
    async function updateAgreeingList(){
        const res = await axios.post('/api/chat/friends/request/list', {
        });
        console.log("test-updateAgreeingList:"+res.data);
        const responseData = res.data;
        console.log(responseData);
    }

    return {
        getAgreeingList,
        getFriendList,
        updateFriendList,
        updateAgreeingList
    };
});