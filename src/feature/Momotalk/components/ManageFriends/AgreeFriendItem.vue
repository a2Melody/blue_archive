<script setup>

import {userStore} from "@/stores/UserStore.js";

const user=userStore();

</script>

<template>
  <div class="agreeFriendItem">
    <img :src="user.getProfile()" class="avatar">
    <div class="data">
      <h5 class="name">{{user.getUserName()}}</h5>
      <span class="uid font_small_size">uid:{{user.getUserId()}}</span>
      <span class="signature font_small_size" style="margin-top: 2px;">与你的每一天都是奇迹</span>
    </div>
    <button class="unagree_btn btn"><span class="iconfont icon-yuanquancha"></span></button>
    <button class="agree_btn btn"><span class="iconfont icon-yuangou" style="font-size: 20px"></span></button>

  </div>
</template>

<style scoped>
.agreeFriendItem{
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 6px;
  border-radius: 7px;
  border:1px solid #DCDCDC;
}
.avatar{
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
}
.data{
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
}
.btn{
  width: 46px;
  height: 35px;

  color: white;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
.unagree_btn{
  margin-left: auto;     /* 推动两个按钮到右侧 */
  align-self: flex-end;  /* 对齐到底部 */
  background-color: #cccccc;
}
.agree_btn{
  align-self: flex-end;  /* 对齐到底部 */
  margin-left: 8px;      /* 两个按钮之间的间距 */
  background-color: pink;
}
</style>