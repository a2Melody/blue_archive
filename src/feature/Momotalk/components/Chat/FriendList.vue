<script setup>
import FriendItem from "@/feature/Momotalk/components/Chat/FriendItem.vue";
import { userChat } from "@/stores/userChat.js";
import { userStore } from "@/stores/UserStore.js";
import { computed, ref } from "vue";

const props = defineProps({
  searchText: { type: String, default: '' }
});

const user = userStore();
const userchat = userChat();
const friendList = userchat.getFriendList();

const selectedId = computed(() => String(userchat.getSelectedConversation().value?.id ?? ''));

// 搜索过滤：标题 / 签名 / id 里任意包含搜索关键字（忽略大小写）即可
const filteredFriends = computed(() => {
  const q = (props.searchText || '').trim().toLowerCase();
  if (!q) return friendList.value || [];

  return (friendList.value || []).filter(item => {
    const title = String(item.title || '').toLowerCase();
    const sig = String(item.signature || '').toLowerCase();
    const idStr = String(item.sessionTargetId || '').toLowerCase();

    return title.includes(q) || sig.includes(q) || idStr.includes(q);
  });
});

// 选中会话
function select(item) {
  userchat.selectConversation({
    id: item.sessionTargetId,
    name: item.title,
    avatarUrl: item.avatarUrl,
    signature: item.signature,
  });
}

/* ---------- 拖拽排序 ---------- */
const dragFromIndex = ref(null);

function onItemDragStart(index) {
  dragFromIndex.value = index;
}
function onItemDragEnter(index) {
  if (dragFromIndex.value === null || dragFromIndex.value === index) return;

  const arr = filteredFriends.value;
  // filteredFriends 是计算属性，对应的是 friendList.value 的引用顺序
  // 我们直接对 friendList.value 重排
  const globalArr = friendList.value;
  if (!Array.isArray(globalArr)) return;

  // 需要把 filtered 的 index 映射回原数组 index
  const fromItem = arr[dragFromIndex.value];
  const toItem = arr[index];
  const fromGlobal = globalArr.findIndex(x => x.sessionTargetId === fromItem.sessionTargetId);
  const toGlobal = globalArr.findIndex(x => x.sessionTargetId === toItem.sessionTargetId);
  if (fromGlobal === -1 || toGlobal === -1) return;

  const [moved] = globalArr.splice(fromGlobal, 1);
  globalArr.splice(toGlobal, 0, moved);

  // 更新 dragFromIndex 为当前 index，保证继续拖动是顺滑的
  dragFromIndex.value = index;
}
function onItemDragEnd() {
  dragFromIndex.value = null;
}
</script>

<template>
  <div class="friends">
    <FriendItem
        v-for="(item, idx) in filteredFriends"
        :key="item.sessionTargetId"
        :sessionTargetId="item.sessionTargetId"
        :title="item.title"
        :avatar="item.avatarUrl ?? user.getDefaultProfile()"
        :signature="item.signature ?? '个性签名desu'"
        :lastMessagePreview="item.lastMessagePreview"
        :lastMessageTime="item.lastMessageTime"
        :unreadCount="item.unreadCount"
        :selected="String(item.sessionTargetId) === selectedId"
        :online="item.online"
        @select="select(item)"
        @drag-start="onItemDragStart(idx)"
        @drag-enter="onItemDragEnter(idx)"
        @drag-end="onItemDragEnd"
    />
  </div>
</template>

<style scoped>
.friends{
  width: 100%;
  height: 100%;
  padding: 1.2rem 0.8rem;
  overflow-y: auto;
}
.friends::-webkit-scrollbar {
  display: none;
}
</style>