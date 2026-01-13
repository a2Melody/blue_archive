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

// Normalize/format content, keep newlines etc.
function formatContent(text) {
  if (!text && text !== 0) return '';
  let s = String(text);
  s = s.replace(/\r\n/g, '\n');
  s = s.replace(/\\r\\n/g, '\n');
  s = s.replace(/\\n/g, '\n');
  s = s.replace(/\/n/g, '\n');
  return s;
}

/* ===== Image helpers (fix for your error) =====
   These must exist in script scope because template calls them.
*/
const MAX_THUMB_WIDTH = 200;   // 缩略图最大宽
const MAX_THUMB_HEIGHT = 200;  // 缩略图最大高
const DEFAULT_THUMB_WIDTH = 100;
const DEFAULT_THUMB_HEIGHT = 100;
const MIN_THUMB_SIDE = 40;     // 最小边长，防止过小

function isImageUrl(url, messageType) {
  if (!url) return false;
  if (messageType === 'IMAGE') return true;
  const path = String(url).split('?')[0].toLowerCase();
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
}

function getFileExt(nameOrUrl) {
  const s = String(nameOrUrl || '').split('?')[0];
  const m = s.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : '';
}

function onImageLoad(ev, m) {
  const iw = ev.target.naturalWidth || 0;
  const ih = ev.target.naturalHeight || 0;
  if (!iw || !ih) {
    m._displayWidth = DEFAULT_THUMB_WIDTH;
    m._displayHeight = DEFAULT_THUMB_HEIGHT;
    return;
  }

  const ratio = iw / ih;
  const NEAR_SQUARE_MIN = 0.8;
  const NEAR_SQUARE_MAX = 1.2;

  let maxW = MAX_THUMB_WIDTH;
  let maxH = MAX_THUMB_HEIGHT;
  if (ratio >= NEAR_SQUARE_MIN && ratio <= NEAR_SQUARE_MAX) {
    maxW = 100;
    maxH = 100;
  }

  const scale = Math.min(1, maxW / iw, maxH / ih);
  let w = Math.round(iw * scale);
  let h = Math.round(ih * scale);

  if (w < MIN_THUMB_SIDE) w = MIN_THUMB_SIDE;
  if (h < MIN_THUMB_SIDE) h = MIN_THUMB_SIDE;

  m._displayWidth = w;
  m._displayHeight = h;
}

/* ===== Whiteboard invite helpers ===== */
function parseBoardIdFromInvite(m) {
  try {
    if (m.messageType === 'WHITEBOARD_INVITE') {
      if (m.content) {
        try {
          const obj = typeof m.content === 'string' ? JSON.parse(m.content) : m.content;
          if (obj && (obj.boardId || (obj.type === 'WHITEBOARD_INVITE' && obj.boardId))) {
            return obj.boardId;
          }
        } catch (e) { /* ignore */ }
      }
    }
    if (m.extra) {
      try {
        const ex = typeof m.extra === 'string' ? JSON.parse(m.extra) : m.extra;
        if (ex && (ex.type === 'WHITEBOARD_INVITE' || ex.boardId)) {
          return ex.boardId;
        }
      } catch (e) { /* ignore */ }
    }
    if (m.content && typeof m.content === 'string') {
      try {
        const obj = JSON.parse(m.content);
        if (obj && (obj.boardId || obj.type === 'WHITEBOARD_INVITE')) {
          return obj.boardId;
        }
      } catch (e) { /* ignore */ }
    }
    if (m.content && String(m.content).startsWith('whiteboard_invite:')) {
      return String(m.content).split(':', 2)[1] || null;
    }
  } catch (err) {
    console.warn('parseBoardIdFromInvite error', err);
  }
  return null;
}

function getInviteText(m) {
  try {
    if (m.messageType === 'WHITEBOARD_INVITE') {
      if (m.content) {
        try {
          const obj = typeof m.content === 'string' ? JSON.parse(m.content) : m.content;
          if (obj && obj.message) return obj.message;
        } catch (e) { /* ignore */ }
      }
      return '点击加入白板';
    }
    return formatContent(m.content);
  } catch (e) {
    return formatContent(m.content);
  }
}

function onJoinWhiteboard(m) {
  const boardId = parseBoardIdFromInvite(m);
  if (!boardId) {
    alert('无效的白板邀请（缺少 boardId）');
    return;
  }
  // dispatch global event; ChatInput listens and will send WHITEBOARD_JOIN
  window.dispatchEvent(new CustomEvent('openWhiteboard', { detail: { boardId } }));
  setTimeout(() => {
    const el = bodyRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  }, 50);
}

/* autoscroll when messages change */
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
          <template v-if="m.imageUrl">
            <a v-if="isImageUrl(m.imageUrl, m.messageType)" :href="m.imageUrl" target="_blank" rel="noopener noreferrer" :download="m.content || ''">
              <img
                  :src="m.imageUrl"
                  alt="attachment"
                  @load="onImageLoad($event, m)"
                  :style="{
                  width: (m._displayWidth || DEFAULT_THUMB_WIDTH) + 'px',
                  height: (m._displayHeight || DEFAULT_THUMB_HEIGHT) + 'px',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }"
              />
            </a>
            <div v-else class="file-card">
              <div class="file-icon">{{ getFileExt(m.content || m.imageUrl) || 'FILE' }}</div>
              <div class="file-info">
                <div class="file-name" :title="m.content || m.imageUrl">{{ m.content || '下载文件' }}</div>
                <a :href="m.imageUrl" target="_blank" rel="noopener noreferrer" class="file-download">打开</a>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-if="m.messageType === 'WHITEBOARD_INVITE' || (m.content && String(m.content).startsWith('whiteboard_invite:'))" class="whiteboard-invite">
              <div style="display:flex;align-items:center;gap:8px;">
                <strong>白板邀请</strong>
                <span style="color:#666;font-size:12px;">{{ getInviteText(m) }}</span>
              </div>
              <div style="margin-top:8px; display:flex; gap:8px;">
                <button @click="onJoinWhiteboard(m)" style="padding:6px 10px; border-radius:6px; background:#ff9db2; color:#fff; border:none;">加入白板</button>
                <button @click="$event.stopPropagation()" style="padding:6px 10px; border-radius:6px; background:#f0f0f0; border:none;">忽略</button>
              </div>
            </div>
            <div v-else>
              {{ formatContent(m.content) }}
            </div>
          </template>
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

.bubble {
  max-width: 70%;
  padding: 8px;
  border-radius: 8px;
  color: #000;
  white-space: pre-wrap;
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

.whiteboard-invite {
  background: #fff7f9;
  border: 1px dashed #ffb6c1;
  padding: 10px;
  border-radius: 8px;
  display:flex;
  flex-direction:column;
}

/* file card */
.file-card{
  display:flex;
  align-items:center;
  gap:8px;
  padding:6px 8px;
  border-radius:6px;
  background:#fff;
  border:1px solid #eee;
  max-width: 240px;
}
.file-icon{
  width:48px;
  height:48px;
  background:#f5f5f7;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:6px;
  font-weight:700;
  color:#666;
  font-size:12px;
}
.file-info{
  display:flex;
  flex-direction:column;
  min-width:0;
}
.file-name{
  font-size:13px;
  color:#333;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  max-width:160px;
}
.file-download{
  margin-top:4px;
  font-size:12px;
  color:#1890ff;
  text-decoration:none;
}
</style>