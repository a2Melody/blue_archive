<script setup>

import {userStore} from "@/stores/UserStore.js";

const props=defineProps({
  url:String,
  name:String,
  signature:String
});
const user=userStore();

</script>

<template>
  <div class="chat_header">
    <img :src="user.getProfile()" class="avatar f">
    <div class="name_signature">
      <h4>{{user.getUserName()}}</h4>
      <p class="font_color font_small_size" style="margin-top: 4px">与你的每一天都是奇迹</p>
    </div>
  </div>
</template>

<style scoped>
.chat_header{
  display: flex;
  align-items: center;
  width: 100%;
  height: 74px;
  border-bottom: 1px solid rgba(255, 179, 217, 0.3);
  padding: 16px 40px;
}
.avatar{
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgb(255 179 217);
}
.name_signature{
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: 10px;
}
</style>