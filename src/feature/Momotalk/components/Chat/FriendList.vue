<script setup>
import FriendItem from "@/feature/Momotalk/components/Chat/FriendItem.vue";
import {userChat} from "@/stores/userChat.js";


const userchat=userChat();
const friendList=userchat.getFriendList();

console.log("test111");
console.log(friendList);
/*sessionType: 'PRIVATE', sessionTargetId: 6, title: 'Mika', lastMessagePreview: '11111', lastMessageTime: '2026-01-08T13:26:59', …}*/
</script>

<template>
  <div class="friends">
    <FriendItem
        v-for="item in friendList"
        :sessionTargetId="item.sessionTargetId"
        :key="item.sessionTargetId"
        :title="item.title"
        :latest-message="item.lastMessagePreview"
        :avatar="item.avatarUrl"
        :latestMessage="item.lastMessageTime"
        :signature="item.signature"
        :unread-count="item.unreadCount"
    ></FriendItem>
  </div>
</template>

<style scoped>
.friends{
  width: 100%;
  height: 100%;
  padding: 1.2rem 0.8rem;
  overflow-y: auto;
}
.friends::-webkit-scrollbar {
  display: none;                /* 隐藏滚动条轨道 */
}
</style>