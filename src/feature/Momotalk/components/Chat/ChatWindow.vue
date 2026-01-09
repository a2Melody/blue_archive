<script setup>
import { userChat } from "@/stores/userChat.js";
import { userStore } from "@/stores/UserStore.js";
import { computed } from 'vue';

const userchat = userChat();
const me = userStore();

const selected = computed(() => userchat.getSelectedConversation().value);
const messages = computed(() => userchat.getMessagesForSelected());
</script>

<template>
  <div class="chat_window f">
    <div v-if="!selected" class="empty_state" style="padding:20px;color:#999">
      请选择联系人开始聊天
    </div>
    <div v-else class="messages" style="padding:12px">
      <div v-for="(m, idx) in messages" :key="m.id || idx" :class="['msg', m.fromUserId === me.getId() ? 'me' : 'them']" style="margin-bottom:8px;">
        <div class="bubble" :style="m.fromUserId === me.getId() ? 'background:#f7d6e0;color:#000;padding:8px;border-radius:8px;max-width:70%;margin-left:auto' : 'background:#fff;color:#000;padding:8px;border-radius:8px;max-width:70%;margin-right:auto;border:1px solid #eee'">
          {{ m.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat_window{
  flex: 1 1 auto;   /* 占据剩余高度 */
  min-height: 0;    /* 必须：允许在 flex 容器内收缩并正确触发 overflow */
  overflow: auto;   /* 内容超出时滚动 */
}
</style>