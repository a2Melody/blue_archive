<script setup>
import FriendItem from "@/feature/Momotalk/components/Chat/FriendItem.vue";

</script>

<template>
  <div class="friends">
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
    <FriendItem></FriendItem>
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