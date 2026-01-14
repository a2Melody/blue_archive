<script setup>
const props = defineProps({
  sessionTargetId: Number,
  title: String,
  avatar: String,
  signature: String,
  online: { type: Boolean, default: false },
  onlineColor: { type: String, default: 'pink' },
  lastMessagePreview: String,
  lastMessageTime: String, // ISO 字符串
  unreadCount: { type: Number, default: 0 },
  selected: Boolean,
});

const emit = defineEmits(['select', 'drag-start', 'drag-enter', 'drag-end']);

function onClick() { emit('select'); }

function onDragStart(e) {
  emit('drag-start');
}

function onDragEnter(e) {
  e.preventDefault();
  emit('drag-enter');
}

function onDragOver(e) {
  e.preventDefault(); // 允许 drop
}

function onDragEnd() {
  emit('drag-end');
}

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const hh = String(d.getHours()).padStart(2,'0');
  const mi = String(d.getMinutes()).padStart(2,'0');
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay ? `${hh}:${mi}` : `${mm}-${dd} ${hh}:${mi}`;
}
</script>

<template>
  <div
      class="friend_item"
      :class="{ 'friend_item--selected': props.selected }"
      @click="onClick"
      draggable="true"
      @dragstart.stop="onDragStart"
      @dragenter.stop="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragend="onDragEnd"
  >
    <div class="avatar_wrap">
      <img :src="props.avatar" class="avatar" />
      <span class="badge" v-if="props.unreadCount > 0">{{ props.unreadCount > 99 ? '99+' : props.unreadCount }}</span>
    </div>
    <div class="status">
      <div class="name_time">
        <h4 class="name">{{ props.title }}</h4>
        <span class="time">{{ fmtTime(props.lastMessageTime) }}</span>
      </div>
      <div class="preview_row">
        <span class="preview">{{ props.lastMessagePreview || props.signature || '' }}</span>
        <span class="online" :style="{ color: props.online ? props.onlineColor : '#999' }">
          {{ props.online ? '在线' : '离线' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend_item{
  display:flex; align-items:center; padding:8px; border-radius:10px; margin-bottom:7px;
  border-bottom:1px solid rgba(255,179,217,0.3); user-select:none;
}
.friend_item--selected{ background:#FFF0F5; }
.friend_item:not(.friend_item--selected):hover{
  cursor:pointer; background:rgba(255,240,245,0.8); box-shadow:2px 2px 5px rgba(0,0,0,0.08);
}

.avatar_wrap{ position:relative; }
.avatar{ width:52px; height:52px; border-radius:50%; object-fit:cover; }
.badge{
  position:absolute; right:-4px; top:-4px; min-width:18px; height:18px; padding:0 4px;
  background:#ff4d4f; color:#fff; border-radius:10px; font-size:12px; line-height:18px; text-align:center;
}

.status{ margin-left:8px; flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:4px; }
.name_time{ display:flex; align-items:center; justify-content:space-between; }
.name{ font-size:14px; margin:0; }
.time{ font-size:12px; color:#999; margin-left:8px; flex:0 0 auto; }
.preview_row{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
.preview{
  font-size:12px; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px;
}
.online{ font-size:12px; }
</style>