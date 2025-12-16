<script setup>

</script>

<template>
  <div ref="add" class="container">
    <span class="jiahao iconfont icon-jiahao3"></span>
  </div>
</template>

<style scoped>
.container{
  position: absolute;    /* 改成fixed*/
  right: 20px;
  top: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background-color: #6BCBFF;
  border-radius: 50%;
  z-index: 5;
  user-select: none;
}
.container:hover{
  cursor: pointer;
}
.jiahao{
  display: inline-block;
  color: white;
  font-size: 16px;
}
</style>