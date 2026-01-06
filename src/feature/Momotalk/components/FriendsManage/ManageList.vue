<script setup>

</script>

<template>
  <ul class="list">
    <li><button>搜寻好友</button></li>
    <li><button>等待同意中</button></li>
    <li><button>申请中</button></li>
    <li><button>好友目录</button></li>
  </ul>
</template>

<style scoped>
.list{
  margin-top: 20px;
}
button{
  width: 100%;
  height: 40px;
  background-color: pink;
  color: white;
  border-radius: 12px;
  margin-bottom: 20px;
}
button:hover{
  cursor: pointer;
}
</style>