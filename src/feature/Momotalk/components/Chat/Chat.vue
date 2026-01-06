<script setup>
import ChatHeader from "@/feature/Momotalk/components/Chat/ChatHeader.vue";
import ChatWindow from "@/feature/Momotalk/components/Chat/ChatWindow.vue";
import ChatInput from "@/feature/Momotalk/components/Chat/ChatInput.vue";

</script>

<template>
    <div class="chat_container">
      <ChatHeader></ChatHeader>
      <ChatWindow></ChatWindow>
      <ChatInput></ChatInput>
    </div>
</template>

<style scoped>
.chat_container{
  display: flex;
  flex-direction: column;
  flex: 1;        /* 占据剩余空间 */
  width: auto;    /* 可选：移除 calc(100% - 1px) 的硬宽度 */
  height: 100%;
}
</style>