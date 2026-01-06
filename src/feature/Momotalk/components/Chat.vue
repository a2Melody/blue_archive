<script setup>

import MessageSideBar from "@/feature/Momotalk/components/Chat/MessageSideBar.vue";
import Chat from "@/feature/Momotalk/components/Chat/Chat.vue";
</script>

<template>
  <div class="message_container">
    <MessageSideBar style="float: left"></MessageSideBar>
    <Chat style="float: right;"></Chat>
  </div>
</template>

<style scoped>
.message_container{
  display: flex;
  width: 100%;
  height: calc(100vh - 64px);
}
</style>