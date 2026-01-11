<script setup>
import FriendItem from "@/feature/Momotalk/components/Chat/FriendItem.vue";
import {userChat} from "@/stores/userChat.js";
import {userStore} from "@/stores/UserStore.js";
import {computed} from "vue";

const user=userStore();
const userchat=userChat();
const friendList=userchat.getFriendList();


const selectedId = computed(() => String(userchat.getSelectedConversation().value?.id ?? '')); // 新增
// 当点击某一项时，映射成包含 id/name/avatarUrl/signature 的对象并选中
function select(item) {
  // item.sessionTargetId 是你的 user id 字段（根据你提供的数据）
  userchat.selectConversation({
    id: item.sessionTargetId,
    name: item.title,
    avatarUrl: item.avatarUrl,     // 与 ChatHeader 里使用的字段名对应
    signature: item.signature,
  });
}
</script>

<template>
  <div class="friends">
    <FriendItem
        v-for="item in friendList"
        :sessionTargetId="item.sessionTargetId"
        :key="item.sessionTargetId"
        :title="item.title"
        :latest-message="item.lastMessagePreview"
        :avatar="item.avatarUrl ?? user.getDefaultProfile()"
        :latestMessage="item.lastMessageTime"
        :signature="item.signature?? '个性签名desu'"
        :unread-count="item.unreadCount"
        :selected="String(item.sessionTargetId) === selectedId"
        :online="item.online"
        @select="select(item)"
    ></FriendItem>
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
  display: none;                /* 隐藏滚动条轨道 */
}
</style>