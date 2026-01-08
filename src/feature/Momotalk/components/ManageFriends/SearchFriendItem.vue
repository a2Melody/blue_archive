<script setup>

import {userStore} from "@/stores/UserStore.js";
import axios from "axios";

const props=defineProps({
  name:String,
  id:Number,
  signature:String,
  avatarUrl:String,
})

async function addFriend(){
  const res = await axios.post('/api/chat/friends/request/send', {
    toUserId: props.id
  });
  console.log(1111);
  const responseData = res.data;
}
</script>

<template>
  <div class="searchFriendItem">
    <img :src="props.avatarUrl" class="avatar" title="头像">
    <div class="data">
      <h5 class="name">{{props.name}}</h5>
      <span class="uid font_small_size">uid:{{props.id}}</span>
      <span class="signature font_small_size" style="margin-top: 2px;">与你的每一天都是奇迹</span>
    </div>
    <button class="add_button" @click="addFriend"><span class="iconfont icon-tianjiahaoyou" style="font-size: 20px"></span></button>
  </div>
</template>

<style scoped>
.searchFriendItem{
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  padding: 0.5rem 1.5rem;
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
.add_button{
  width: 46px;
  height: 35px;
  margin-left: auto;
  align-self: flex-end;
  background-color: pink;
  color: white;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
</style>