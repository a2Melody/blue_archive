<script setup lang="js">

</script>

<template>
  <div class="footer_container">
    <ul class="members">
      <li class="title">开发人员</li>
      <li class="member1" style="margin-left: 20px;margin-top: 8px">Mika_sensei</li>
      <li class="member2" style="margin-left: 20px;margin-top: 7px">NzuCRAS</li>
      <li class="member3" style="margin-left: 20px;margin-top: 7px">小白</li>
    </ul>

  </div>
</template>

<style scoped>
  .footer_container{
    user-select: none;
    width: 100%;
    height: 139px;
    position: relative;
    background-color: #6BCBFF;
    border-radius: 0 0 14px 14px
  }
  .members{
    float: left;
    margin-left: 106px;
    margin-top:20px;
    width: 170px;
    height: 100px;
    color: white;
    font-size: 14px;
    font-weight: 600;
  }
  .member1:hover{
    color: pink;
  }
  .member2:hover{
    color: #27f3b4;
  }
  .member3:hover{
    color: black;
  }
</style>