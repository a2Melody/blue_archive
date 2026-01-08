<script setup>

</script>

<template>
  <div class="chat_window f">
    <!-- 聊天消息列表放这里 -->
  </div>
</template>

<style scoped>
.chat_window{
  flex: 1 1 auto;   /* 占据剩余高度 */
  min-height: 0;    /* 必须：允许在 flex 容器内收缩并正确触发 overflow */
  overflow: auto;   /* 内容超出时滚动 */
}
</style>