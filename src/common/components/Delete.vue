<script setup>

</script>

<template>
  <div ref="jianhao" class="container">
    <span class="jianhao iconfont icon-jianhao3" ></span>
  </div>
</template>

<style scoped>
.container{
  position: fixed;     /* 改成fixed*/
  right: 20px;
  top: 320px;
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
.jianhao{
  display: inline-block;
  color: white;
  font-size: 18px;
}
.container:hover{
  cursor: pointer;
}
</style>