<script setup>
import { computed } from 'vue';
import { userStore } from '@/stores/UserStore.js';
const store = userStore();

const bgStyle = computed(() => {
  if (!store.profile) return {};
  return {
    backgroundImage: `url(${store.profile})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left top', // 左上角
    backgroundSize: 'auto'           // 不缩放（保留原像素）
  };
});
</script>

<template>
  <div class="small-box" :style="bgStyle"></div>
</template>

<style scoped>
/* style */
.small-box {
  width: 45px;   /* 目标 div 比裁剪图小 */
  height: 45px;
  overflow: hidden; /* 可有可无，背景本身会被裁剪 */
  border-radius: 4px;
}
</style>