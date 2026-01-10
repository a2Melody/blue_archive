<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { userChat } from '@/stores/userChat.js';
import { userStore } from '@/stores/UserStore.js';
import { realTime } from '@/stores/RealTime.js';
import ChatHeader from './ChatHeader.vue';
import ChatInput from "@/feature/Momotalk/components/Chat/ChatInput.vue"; // 相对路径按你项目实际位置调整

const uc = userChat();
const me = userStore();
const rt = realTime();

const selectedRef = uc.getSelectedConversation(); // 返�� ref
const selected = computed(() => selectedRef.value); // 当前会话对象 or null

const messages = computed(() => uc.getMessagesForSelected()); // 返回当前会话的数组

// 用于滚动容器
const bodyRef = ref(null);


// helper 判断是否是我发送的消息（统一字符串比较）
function isMine(m) {
  return String(m.fromUserId) === String(me.getUserId());
}

// 当 messages 变化时滚动到底部
watch(
    messages,
    async () => {
      await nextTick();
      const el = bodyRef.value;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },
    { flush: 'post' }
);

</script>

<template>
  <div class="chat_window f">
    <!-- Header (只在选中会话时显示，ChatHeader 内部也会做同样判断) -->
    <ChatHeader />

    <!-- 空状态 -->
    <div v-if="!selected" class="empty_state" style="padding:20px;color:#999">
      请选择联系人开始聊天
    </div>

    <!-- 聊天消息列表 -->
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
          {{ m.content }}
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
  min-height: 0; /* 使内部滚动正常工作 */
}

/* 消息区域 */
.messages {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 12px;
  background: #fafafa;
}

/* 单条消息容器 */
.msg {
  display: flex;
  margin-bottom: 8px;
}

/* 我方消息靠右 */
.msg.me {
  justify-content: flex-end;
}

/* 他方消息靠左 */
.msg.them {
  justify-content: flex-start;
}

/* 气泡基础样式 */
.bubble {
  max-width: 70%;
  padding: 8px;
  border-radius: 8px;
  color: #000;
  word-break: break-word;
}

/* 我方气泡样式 */
.bubble-me {
  background: #f7d6e0;
  margin-left: 8px;
}

/* 他方气泡样式 */
.bubble-them {
  background: #fff;
  border: 1px solid #eee;
  margin-right: 8px;
}

/* 空状态 */
.empty_state {
  padding: 20px;
  color: #999;
}
</style>