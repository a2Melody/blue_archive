<script setup>
import {ref} from "vue";
import Header from "@/feature/Momotalk/components/Header.vue";
import Chat from "@/feature/Momotalk/components/Chat.vue";
import Friends from "@/feature/Momotalk/components/Friends.vue";

const showFriends = ref(false);
</script>

<template>
  <Header @toggle-friends="showFriends = true"></Header>
  <Chat></Chat>

  <!-- 遮罩 + Friends（v-if 最小渲染） -->
  <div v-if="showFriends" class="overlay" @click="showFriends = false">
    <div class="overlay_inner" @click.stop>
      <Friends @close="showFriends=false"></Friends>
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
  padding-top: 5vh; /* 让 Friends 与原先 top:5vh 保持一致 */
}
.overlay_inner{
  position: relative; /* 保持 Friends 内部定位行为正常 */
}
</style>