<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { ElButton, ElMessageBox, ElMessage } from 'element-plus';
import { Delete, RefreshLeft } from '@element-plus/icons-vue';
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

// 原始消息
const rawMessages = computed(() => uc.getMessagesForSelected());
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

/* ---------- 时间分割线逻辑（超过 5 分钟插入分割） ---------- */
const SEPARATOR_GAP_MS = 5 * 60 * 1000;

function getMsgTimestamp(m) {
  if (!m) return null;
  if (m.timestamp) return Number(m.timestamp);
  if (m.createdAt) {
    try { return new Date(m.createdAt).getTime(); } catch { /* ignore */ }
  }
  return null;
}

function formatTimeForSeparator(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();

  const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (sameDay) return hhmm;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日 ${hhmm}`;
}

/**
 * 在消息流中插入时间分割对象：
 * - 每当两条消息间隔 > 5 分钟时，在当前消息前插入一条 {_isSeparator: true, _sepTime: ts}
 */
const messagesWithTime = computed(() => {
  const arr = rawMessages.value || [];
  if (!arr.length) return [];
  const result = [];
  let lastTs = null;

  for (let i = 0; i < arr.length; i++) {
    const m = arr[i];
    const ts = getMsgTimestamp(m) ?? (m._tsCache || Date.now());
    if (ts && !m._tsCache) m._tsCache = ts;

    if (ts && (lastTs === null || ts - lastTs > SEPARATOR_GAP_MS)) {
      result.push({
        _isSeparator: true,
        _sepId: `sep_${ts}_${i}`,
        _sepTime: ts,
      });
      lastTs = ts;
    } else if (ts && lastTs !== null && ts > lastTs) {
      lastTs = ts;
    }
    result.push(m);
  }
  return result;
});

/* ---------- 图片 / 文件展示 ---------- */
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

/* ---------- 删除 / 撤回（带确认弹窗） ---------- */
const RECALL_WINDOW_MS = 3 * 60 * 1000;

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

async function confirmDelete(m) {
  try {
    await ElMessageBox.confirm(
        '确定要删除这条消息吗？仅会在你这边删除。',
        '删除消息',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'momo-confirm-btn',
          cancelButtonClass: 'momo-cancel-btn',
        }
    );
    await axios.post('/api/chat/messages/delete', { messageId: m.id });
    removeMessageLocally(m.id);
    ElMessage.success('消息已删除');
  } catch (e) {
    if (e === 'cancel') return;
    const msg = e?.response?.data?.message || e?.response?.data || e?.message || '删除失败';
    ElMessage.error(msg);
  }
}

async function confirmRecall(m) {
  try {
    await ElMessageBox.confirm(
        '撤回后，所有人都会看不到这条消息，确定要撤回吗？',
        '撤回消息',
        {
          confirmButtonText: '撤回',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'momo-confirm-btn',
          cancelButtonClass: 'momo-cancel-btn',
        }
    );
    const res = await axios.post('/api/chat/messages/recall', { messageId: m.id });
    const data = res?.data?.data || {};
    if (data.allowed) {
      removeMessageLocally(m.id);
      ElMessage.success('已撤回');
    } else {
      ElMessage.error('撤回失败：' + (data.reason || '不允许撤回'));
    }
  } catch (e) {
    if (e === 'cancel') return;
    const msg = e?.response?.data?.message || e?.response?.data || e?.message || '撤回失败';
    ElMessage.error(msg);
  }
}

/* typing indicator: whether peer is typing in current conversation */
const showPeerTyping = computed(() => {
  const sel = selected.value;
  if (!sel) return false;
  return uc.isPeerTyping(sel.id);
});

/* ---------- 已读上报：窗口激活 + 列表在底部 + 防抖 ---------- */
const isWindowActive = ref(document.visibilityState === 'visible' && document.hasFocus());
let markTimer = null;

function isAtBottom() {
  const el = bodyRef.value;
  if (!el) return false;
  const threshold = 12; // 容差
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}
function maybeMarkRead() {
  if (!selected.value) return;
  if (!isWindowActive.value) return;
  if (!isAtBottom()) return;
  uc.markConversationRead(selected.value.id);
}
function scheduleMarkRead(delay = 800) {
  if (markTimer) clearTimeout(markTimer);
  markTimer = setTimeout(maybeMarkRead, delay);
}
function onScroll() {
  scheduleMarkRead(600);
}
function onWindowFocus() {
  isWindowActive.value = true;
  scheduleMarkRead(200);
}
function onWindowBlur() {
  isWindowActive.value = false;
}
function onVisibilityChange() {
  isWindowActive.value = (document.visibilityState === 'visible') && document.hasFocus();
  if (isWindowActive.value) scheduleMarkRead(200);
}

/* autoscroll + 触发判定 */
watch(
    rawMessages,
    async () => {
      await nextTick();
      const el = bodyRef.value;
      if (el) {
        el.scrollTop = el.scrollHeight;
        scheduleMarkRead(200);
      }
    },
    { flush: 'post', deep: true }
);

/* 切换会话时，也尝试判定一次 */
watch(selected, async () => {
  await nextTick();
  scheduleMarkRead(200);
});

onMounted(() => {
  window.addEventListener('focus', onWindowFocus);
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('focus', onWindowFocus);
  window.removeEventListener('blur', onWindowBlur);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  if (markTimer) clearTimeout(markTimer);
});

/**
 * 临时头像 URL：
 * - 对方头像：从会话 selected.value.avatarUrl（如果你已经在会话里放了 avatar 字段，可直接用）
 * - 自己头像：me.getAvatarUrl() 之类，如果还没有，可以先写死一张
 */
const myAvatar = computed(() => me.getAvatarUrl());
const peerAvatar = computed(() => selected.value?.userAvatarUrl || selected.value?.avatarUrl || '');
</script>

<template>
  <div class="chat_window f">
    <ChatHeader />

    <div v-if="!selected" class="empty_state" style="padding:20px;color:#999">
      请选择联系人开始聊天
    </div>

    <div v-else class="messages" ref="bodyRef" @scroll="onScroll">
      <!-- 对方正在输入提示 -->
      <div v-if="showPeerTyping" class="peer-typing">
        对方正在输入…
      </div>

      <template
          v-for="(item, idx) in messagesWithTime"
          :key="item._isSeparator ? item._sepId : (item.id ?? `m_${idx}`)"
      >
        <!-- 时间分割线 -->
        <div v-if="item._isSeparator" class="time-separator">
          <span>{{ formatTimeForSeparator(item._sepTime) }}</span>
        </div>

        <!-- 普通消息 -->
        <div v-else class="msg-row" :class="isMine(item) ? 'me' : 'them'">
          <!-- 对方消息：左边头像 + 中间气泡 + 右侧操作 -->
          <template v-if="!isMine(item)">
            <div class="avatar-col">
              <img
                  v-if="peerAvatar"
                  :src="peerAvatar"
                  alt=""
                  class="avatar-img"
              />
            </div>

            <div class="msg-main line-them">
              <div
                  class="bubble bubble-them"
              >
                <template v-if="item.imageUrl">
                  <a
                      v-if="isImageUrl(item.imageUrl, item.messageType)"
                      :href="item.imageUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      :download="item.content || ''"
                      class="media-wrap"
                  >
                    <img
                        :src="item.imageUrl"
                        alt="attachment"
                        @load="onImageLoad($event, item)"
                        class="bubble-img"
                        :style="{
                        maxWidth: '100%',
                        width: (item._displayWidth || 100) + 'px',
                        height: 'auto',
                        borderRadius: '6px',
                        display: 'block'
                      }"
                    />
                  </a>
                  <div v-else class="file-card">
                    <div class="file-icon">{{ getFileExt(item.content || item.imageUrl) || 'FILE' }}</div>
                    <div class="file-info">
                      <div class="file-name" :title="item.content || item.imageUrl">{{ item.content || '下载文件' }}</div>
                      <a :href="item.imageUrl" target="_blank" rel="noopener noreferrer" class="file-download">打开</a>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div
                      v-if="item.messageType === 'WHITEBOARD_INVITE' ||
                           (item.content && String(item.content).startsWith('whiteboard_invite:'))"
                      class="whiteboard-invite"
                  >
                    <div style="display:flex;align-items:center;gap:8px;">
                      <strong>白板邀请</strong>
                      <span style="color:#666;font-size:12px;">{{ formatContent(item.content) }}</span>
                    </div>
                    <div style="margin-top:8px; display:flex; gap:8px;">
                      <button @click="$emit('joinWhiteboard', item)" class="pill primary">加入白板</button>
                      <button @click="$event.stopPropagation()" class="pill">忽略</button>
                    </div>
                  </div>
                  <div v-else>
                    {{ formatContent(item.content) }}
                  </div>
                </template>
              </div>

              <div class="msg-actions">
                <el-button
                    class="msg-action-btn"
                    type="danger"
                    link
                    :icon="Delete"
                    size="small"
                    title="删除"
                    @click="confirmDelete(item)"
                />
                <el-button
                    v-if="canRecall(item)"
                    class="msg-action-btn"
                    type="warning"
                    link
                    :icon="RefreshLeft"
                    size="small"
                    title="撤回"
                    @click="confirmRecall(item)"
                />
                <span v-if="isMine(item)" class="read-receipt">{{ item._read ? '已读' : '未读' }}</span>
              </div>
            </div>

            <div class="avatar-col avatar-col-placeholder"></div>
          </template>

          <!-- 我方消息：左占位 + 中间气泡 + 右边头像 -->
          <template v-else>
            <div class="avatar-col avatar-col-placeholder"></div>

            <div class="msg-main line-me">
              <div
                  class="bubble bubble-me"
              >
                <template v-if="item.imageUrl">
                  <a
                      v-if="isImageUrl(item.imageUrl, item.messageType)"
                      :href="item.imageUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      :download="item.content || ''"
                      class="media-wrap"
                  >
                    <img
                        :src="item.imageUrl"
                        alt="attachment"
                        @load="onImageLoad($event, item)"
                        class="bubble-img"
                        :style="{
                        maxWidth: '100%',
                        width: (item._displayWidth || 100) + 'px',
                        height: 'auto',
                        borderRadius: '6px',
                        display: 'block'
                      }"
                    />
                  </a>
                  <div v-else class="file-card">
                    <div class="file-icon">{{ getFileExt(item.content || item.imageUrl) || 'FILE' }}</div>
                    <div class="file-info">
                      <div class="file-name" :title="item.content || item.imageUrl">{{ item.content || '下载文件' }}</div>
                      <a :href="item.imageUrl" target="_blank" rel="noopener noreferrer" class="file-download">打开</a>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div
                      v-if="item.messageType === 'WHITEBOARD_INVITE' ||
                           (item.content && String(item.content).startsWith('whiteboard_invite:'))"
                      class="whiteboard-invite"
                  >
                    <div style="display:flex;align-items:center;gap:8px;">
                      <strong>白板邀请</strong>
                      <span style="color:#666;font-size:12px;">{{ formatContent(item.content) }}</span>
                    </div>
                    <div style="margin-top:8px; display:flex; gap:8px;">
                      <button @click="$emit('joinWhiteboard', item)" class="pill primary">加入白板</button>
                      <button @click="$event.stopPropagation()" class="pill">忽略</button>
                    </div>
                  </div>
                  <div v-else>
                    {{ formatContent(item.content) }}
                  </div>
                </template>
              </div>

              <div class="msg-actions">
                <el-button
                    class="msg-action-btn"
                    type="danger"
                    link
                    :icon="Delete"
                    size="small"
                    title="删除"
                    @click="confirmDelete(item)"
                />
                <el-button
                    v-if="canRecall(item)"
                    class="msg-action-btn"
                    type="warning"
                    link
                    :icon="RefreshLeft"
                    size="small"
                    title="撤回"
                    @click="confirmRecall(item)"
                />
                <span v-if="isMine(item)" class="read-receipt">{{ item._read ? '已读' : '未读' }}</span>
              </div>
            </div>

            <div class="avatar-col">
              <img
                  v-if="myAvatar"
                  :src="myAvatar"
                  alt=""
                  class="avatar-img"
              />
            </div>
          </template>
        </div>
      </template>
    </div>

    <ChatInput />
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
  overflow-x: hidden;
  padding: 12px;
  background: #fafafa;
}

/* 时间分割线 */
.time-separator {
  display: flex;
  justify-content: center;
  margin: 8px 0;
  font-size: 12px;
  color: #999;
}
.time-separator span {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #f3d5df;
}

/* 对方正在输入提示 */
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

/* 每一行消息：三列（左头像，中间内容，右头像） */
.msg-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  align-items: flex-start;
  column-gap: 8px;
  margin-bottom: 8px;
}

/* 中间内容区域：气泡 + 操作 */
.msg-main {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.msg-row.me .msg-main {
  margin-left: auto; /* 右侧对齐一点点，整体更靠右 */
}
.msg-row.them .msg-main {
  margin-right: auto;
}

/* 气泡 */
.bubble {
  width: auto;
  max-width: 100%;
  padding: 8px;
  border-radius: 8px;
  color: #000;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
}
.bubble-me {
  background: #f7d6e0;
  align-self: flex-end;
}
.bubble-them {
  background: #fff;
  border: 1px solid #eee;
  align-self: flex-start;
}

.media-wrap {
  display: inline-block;
  max-width: 100%;
}
.bubble-img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}

/* 头像列 */
.avatar-col {
  display: flex;
  justify-content: center;
}
.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-col-placeholder {
  /* 保持网格占位，不显示内容 */
}

/* 操作按钮：默认透明，悬浮整行时出现 */
.msg-actions {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  flex: 0 0 auto;
  margin-top: 2px;
  user-select: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.msg-row:hover .msg-actions {
  opacity: 1;
}

.msg-action-btn :deep(.el-icon) {
  font-size: 14px;
}

/* 已读标记 */
.read-receipt {
  color: #aaa;
  font-size: 12px;
  margin-left: 4px;
}

.whiteboard-invite {
  background: #fff7f9;
  border: 1px dashed #ffb6c1;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.pill {
  padding: 6px 10px;
  border-radius: 6px;
  background: #f0f0f0;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 12px;
}
.pill.primary {
  background: #ff9db2;
  color: #fff;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #eee;
  max-width: 100%;
}
.file-icon {
  width: 48px;
  height: 48px;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 700;
  color: #666;
  font-size: 12px;
}
.file-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.file-name {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.file-download {
  margin-top: 4px;
  font-size: 12px;
  color: #1890ff;
  text-decoration: none;
}

/* Element MessageBox 按钮定制（粉色主题） */
:global(.momo-confirm-btn) {
  background-color: #ff9db2 !important;
  border-color: #ff9db2 !important;
  color: #fff !important;
}
:global(.momo-confirm-btn:hover) {
  background-color: #ffb3c5 !important;
  border-color: #ffb3c5 !important;
}
:global(.momo-cancel-btn) {
  color: #666 !important;
}
</style>