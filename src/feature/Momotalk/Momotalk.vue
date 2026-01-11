<script setup>
import {onMounted,onUnmounted, ref} from "vue";
import Header from "@/feature/Momotalk/components/Header.vue";
import Chat from "@/feature/Momotalk/components/Chat.vue";
import ManageFriends from "@/feature/Momotalk/components/ManageFriends.vue";
import { realTime } from "@/stores/RealTime.js";
import {userChat} from "@/stores/userChat.js";

const showFriends = ref(false);
const realtime = realTime();
const userchat=userChat();

onMounted(async ()=>{
  console.log("onMounted")
  realtime.initWs();
  await userchat.updateFriendList();
  await userchat.updateAgreeingList();
  await userchat.loadAllFriendHistories();
});
onUnmounted(()=>{
  realtime.closeWs();
  userchat.resetForLogout();
})
</script>

<template>
  <Header @toggle-friends="showFriends = true"></Header>
  <Chat></Chat>

  <!-- 遮罩 + ManageFriends（v-if 最小渲染） -->
  <div v-if="showFriends" class="overlay" @click="showFriends = false">
    <div class="overlay_inner" @click.stop>
      <ManageFriends @close="showFriends=false"></ManageFriends>
    </div>
  </div>
</template>

<style scoped>
.overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2500;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh; /* 让 ManageFriends 与原先 top:5vh 保持一致 */
}
.overlay_inner{
  position: relative; /* 保持 ManageFriends 内部定位行为正常 */
}
</style>