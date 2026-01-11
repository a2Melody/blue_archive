<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { userChat } from '@/stores/userChat.js';
import { userStore } from '@/stores/UserStore.js';
import { realTime } from '@/stores/RealTime.js';
import ChatHeader from './ChatHeader.vue';
import ChatInput from "@/feature/Momotalk/components/Chat/ChatInput.vue";

const uc = userChat();
const me = userStore();
const rt = realTime();

const selectedRef = uc.getSelectedConversation();
const selected = computed(() => selectedRef.value);

const messages = computed(() => uc.getMessagesForSelected());

const bodyRef = ref(null);

function isMine(m) {
  return String(m.fromUserId) === String(me.getUserId());
}

// 将后端可能的转义换行或非标准标识转换为真实换行符
function formatContent(text) {
  if (!text && text !== 0) return '';
  let s = String(text);
  // 先把常见的转义序列变为真实换行
  s = s.replace(/\r\n/g, '\n');   // CRLF -> LF
  s = s.replace(/\\r\\n/g, '\n'); // escaped \r\n
  s = s.replace(/\\n/g, '\n');    // escaped \n
  // 如果后端使用了 /n（斜杠 n），也把它换成换行
  s = s.replace(/\/n/g, '\n');
  return s;
}

watch(
    messages,
    async () => {
      await nextTick();
      const el = bodyRef.value;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },
    { flush: 'post', deep: true }
);
</script>

<template>
  <div class="chat_window f">
    <ChatHeader />

    <div v-if="!selected" class="empty_state" style="padding:20px;color:#999">
      请选择联系人开始聊天
    </div>

    <div v-else class="messages" ref="bodyRef">
      <div
          v-for="(m, idx) in messages"
          :key="m.id ?? idx"
          :class="['msg', isMine(m) ? 'me' : 'them']"
      >
        <div
            class="bubble"
            :class="isMine(m) ? 'bubble-me' : 'bubble-them'"
        >
          {{ formatContent(m.content) }}
        </div>
      </div>
    </div>

    <ChatInput></ChatInput>
  </div>
</template>

<style scoped>
.chat_window {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.messages {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 12px;
  background: #fafafa;
}

.msg {
  display: flex;
  margin-bottom: 8px;
}

.msg.me {
  justify-content: flex-end;
}

.msg.them {
  justify-content: flex-start;
}

/* 关键：保留换行并允许自动换行 */
.bubble {
  max-width: 70%;
  padding: 8px;
  border-radius: 8px;
  color: #000;
  white-space: pre-wrap; /* <- 保留换行与空白 */
  word-break: break-word;
}

.bubble-me {
  background: #f7d6e0;
  margin-left: 8px;
}

.bubble-them {
  background: #fff;
  border: 1px solid #eee;
  margin-right: 8px;
}

.empty_state {
  padding: 20px;
  color: #999;
}
</style>