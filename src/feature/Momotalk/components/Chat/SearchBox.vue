<script setup>

</script>

<template>
  <div class="search_container">
    <input class="name_search" placeholder="搜索好友...">
  </div>
</template>

<style scoped>

.search_container{
  width: 100%;
  height: 76px;
  padding: 1rem 1.4rem;
  border-bottom: 1px solid rgba(255, 179, 217, 0.3);
  user-select: none;
}
.name_search{
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0.5rem 1rem;
  font-size: 15px;
  border: 1px solid  rgb(255 179 217);
  border-radius: 20px;
}
.name_search:focus {
  outline: 2px solid rgb(255 179 217);
  outline-offset: 0;
}
.name_search::placeholder {
  color: rgba(255, 179, 217, 0.8); /* 设置为你想要的粉色系或灰色 */
  font-size: 1rem; /* 也可以单独调整占位符的大小 */
}
</style>