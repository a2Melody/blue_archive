<script setup>

</script>

<template>
  <div ref="jiahao" class="container" style="right: 20px;top: 200px">
    <span class="jiahao iconfont icon-jiahao3"></span>
  </div>
  <div ref="jianhao" class="container" style="right: 20px;top: 260px">
    <span class="jianhao iconfont icon-jianhao3" ></span>
  </div>
</template>

<style scoped>
.container{
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 30px;
  height: 30px;
  background-color: #6BCBFF;
  border-radius: 50%;
  z-index: 5;
  user-select: none;
}
.jiahao{
  display: inline-block;
  color: white;
  font-size: 16px;
}
.jianhao{
  display: inline-block;
  color: white;
  font-size: 18px;
}
.container:hover{
  cursor: pointer;
}
</style>