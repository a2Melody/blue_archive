<script setup>

import MessageSideBar from "@/feature/Momotalk/components/Chat/MessageSideBar.vue";
import ChatWindow from "@/feature/Momotalk/components/Chat/ChatWindow.vue";
</script>

<template>
  <div class="message_container">
    <MessageSideBar></MessageSideBar>
    <div class="chat_container">
      <ChatWindow></ChatWindow>
    </div>
  </div>
</template>

<style scoped>
.message_container{
  display: flex;
  width: 100%;
  height: calc(100vh - 64px);
}
.chat_container{
  display: flex;
  flex-direction: column;
  flex: 1;        /* 占据剩余空间 */
  width: auto;    /* 可选：移除 calc(100% - 1px) 的硬宽度 */
  height: 100%;
}
</style>