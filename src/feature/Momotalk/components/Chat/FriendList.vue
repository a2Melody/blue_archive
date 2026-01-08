<script setup>
import FriendItem from "@/feature/Momotalk/components/Chat/FriendItem.vue";
import {userChat} from "@/stores/userChat.js";
const chat=userChat();
const friendList=chat.getFriendList();
console.log("获取的数据"+friendList.value);
</script>

<template>
  <div class="friends">
    <FriendItem
        v-for="friend in friendList"


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