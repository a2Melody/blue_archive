<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import axios from 'axios';
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

function formatContent(text) {
  if (!text && text !== 0) return '';
  let s = String(text);
  s = s.replace(/\r\n/g, '\n');
  s = s.replace(/\\r\\n/g, '\n');
  s = s.replace(/\\n/g, '\n');
  s = s.replace(/\/n/g, '\n');
  return s;
}

/* image helpers */
const MAX_THUMB_WIDTH = 200;
const MAX_THUMB_HEIGHT = 200;
const DEFAULT_THUMB_WIDTH = 100;
const DEFAULT_THUMB_HEIGHT = 100;
const MIN_THUMB_SIDE = 40;

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
    maxW = 100; maxH = 100;
  }
  const scale = Math.min(1, maxW / iw, maxH / ih);
  let w = Math.round(iw * scale);
  let h = Math.round(ih * scale);
  if (w < MIN_THUMB_SIDE) w = MIN_THUMB_SIDE;
  if (h < MIN_THUMB_SIDE) h = MIN_THUMB_SIDE;
  m._displayWidth = w;
  m._displayHeight = h;
}

/* recall/delete helpers */
const RECALL_WINDOW_MS = 3 * 60 * 1000;
function getMsgTimestamp(m) {
  if (m.timestamp) return Number(m.timestamp);
  if (m.createdAt) {
    try { return new Date(m.createdAt).getTime(); } catch { /* ignore */ }
  }
  return null;
}
function canRecall(m) {
  if (!isMine(m)) return false;
  const t = getMsgTimestamp(m);
  if (!t || Number.isNaN(t)) return false;
  return (Date.now() - t) <= RECALL_WINDOW_MS;
}
function removeMessageLocally(messageId) {
  const arr = uc.getMessagesForSelected();
  const idx = arr.findIndex(x => String(x.id) === String(messageId));
  if (idx >= 0) arr.splice(idx, 1);
}
async function onDeleteMessage(m) {
  try {
    await axios.post('/api/chat/messages/delete', { messageId: m.id });
    removeMessageLocally(m.id);
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data || e?.message || '删除失败';
    alert(msg);
  }
}
async function onRecallMessage(m) {
  try {
    const res = await axios.post('/api/chat/messages/recall', { messageId: m.id });
    const data = res?.data?.data || {};
    if (data.allowed) {
      removeMessageLocally(m.id);
    } else {
      alert('撤回失败：' + (data.reason || '不允许撤回'));
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data || e?.message || '撤回失败';
    alert(msg);
  }
}

/* typing indicator: whether peer is typing in current conversation */
const showPeerTyping = computed(() => {
  const sel = selected.value;
  if (!sel) return false;
  return uc.isPeerTyping(sel.id);
});

/* autoscroll */
watch(
    messages,
    async () => {
      await nextTick();
      const el = bodyRef.value;
      if (el) el.scrollTop = el.scrollHeight;
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
      <!-- 对方正在输入提示 -->
      <div v-if="showPeerTyping" class="peer-typing">
        对方正在输入…
      </div>

      <div
          v-for="(m, idx) in messages"
          :key="m.id ?? idx"
          :class="['msg', isMine(m) ? 'me' : 'them']"
      >
        <div class="msg-line" :class="isMine(m) ? 'line-me' : 'line-them'">
          <div
              class="bubble"
              :class="isMine(m) ? 'bubble-me' : 'bubble-them'"
          >
            <template v-if="m.imageUrl">
              <a
                  v-if="isImageUrl(m.imageUrl, m.messageType)"
                  :href="m.imageUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  :download="m.content || ''"
                  class="media-wrap"
              >
                <img
                    :src="m.imageUrl"
                    alt="attachment"
                    @load="onImageLoad($event, m)"
                    class="bubble-img"
                    :style="{
                    maxWidth: '100%',
                    width: (m._displayWidth || 100) + 'px',
                    height: 'auto',
                    borderRadius: '6px',
                    display: 'block'
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
                  <span style="color:#666;font-size:12px;">{{ formatContent(m.content) }}</span>
                </div>
                <div style="margin-top:8px; display:flex; gap:8px;">
                  <button @click="$emit('joinWhiteboard', m)" class="pill primary">加入白板</button>
                  <button @click="$event.stopPropagation()" class="pill">忽略</button>
                </div>
              </div>
              <div v-else>
                {{ formatContent(m.content) }}
              </div>
            </template>
          </div>

          <div class="msg-actions" :class="isMine(m) ? 'actions-me' : 'actions-them'">
            <span class="action-text" title="删除" @click="onDeleteMessage(m)">删除</span>
            <span v-if="canRecall(m)" class="action-text" title="撤回" @click="onRecallMessage(m)">撤回</span>
            <span v-if="isMine(m)" class="read-receipt">{{ m._read ? '已读' : '未读' }}</span>
          </div>
        </div>
      </div>
    </div>

    <ChatInput></ChatInput>
  </div>
</template>

<style scoped>
.chat_window { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.messages { flex: 1 1 auto; overflow-y: auto; overflow-x: hidden; padding: 12px; background: #fafafa; }
.peer-typing {
  position: sticky;
  top: 0;
  background: #fffbe8;
  color: #9a8700;
  font-size: 12px;
  padding: 6px 8px;
  border: 1px solid #f1e1a6;
  border-radius: 6px;
  margin-bottom: 8px;
}
.msg { display: flex; margin-bottom: 8px; }
.msg.me { justify-content: flex-end; }
.msg.them { justify-content: flex-start; }
.msg-line { display: flex; align-items: flex-start; gap: 6px; max-width: 80%; }
.line-me { flex-direction: row-reverse; }
.line-them { flex-direction: row; }
.bubble { max-width: 70%; padding: 8px; border-radius: 8px; color: #000; white-space: pre-wrap; word-break: break-word; overflow: hidden; }
.bubble-me { background: #f7d6e0; margin-left: 8px; }
.bubble-them { background: #fff; border: 1px solid #eee; margin-right: 8px; }
.media-wrap { display: inline-block; max-width: 100%; }
.bubble-img { max-width: 100%; height: auto; display: block; border-radius: 6px; }
.msg-actions { display: inline-flex; gap: 8px; align-items: center; flex: 0 0 auto; margin-top: 2px; user-select: none; }
.action-text { color: #888; font-size: 12px; cursor: pointer; }
.action-text:hover { color: #666; text-decoration: underline; }
.read-receipt { color: #aaa; font-size: 12px; }
.whiteboard-invite { background: #fff7f9; border: 1px dashed #ffb6c1; padding: 10px; border-radius: 8px; display:flex; flex-direction:column; }
.pill { padding: 6px 10px; border-radius: 6px; background: #f0f0f0; border: none; color: #555; cursor: pointer; font-size: 12px; }
.pill.primary { background: #ff9db2; color: #fff; }
.file-card{ display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:6px; background:#fff; border:1px solid #eee; max-width: 100%; }
.file-icon{ width:48px; height:48px; background:#f5f5f7; display:flex; align-items:center; justify-content:center; border-radius:6px; font-weight:700; color:#666; font-size:12px; }
.file-info{ display:flex; flex-direction:column; min-width:0; }
.file-name{ font-size:13px; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
.file-download{ margin-top:4px; font-size:12px; color:#1890ff; text-decoration:none; }
</style>