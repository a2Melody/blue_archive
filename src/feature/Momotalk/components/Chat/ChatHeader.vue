<script setup>

import {userStore} from "@/stores/UserStore.js";
import {computed} from "vue";
import {userChat} from "@/stores/userChat.js";

const props=defineProps({
  url:String,
  name:String,
  signature:String
});
const user=userStore();


/*ai写的*/
const userchat=userChat();
const selected = computed(() => userchat.getSelectedConversation().value || null);

// 如果没有选中会话，仍然显示当前用户自己的信息或占位文本
const avatar = computed(() => {
  return selected.value?.avatarUrl || user.getProfile();
});
const displayName = computed(() => {
  return selected.value?.name || user.getUserName();
});
const signature = computed(() => {
  return selected.value?.signature || '与你的每一天都是奇迹';
});
const avatarHref = computed(() => {
  const sel = userchat.getSelectedConversation().value;
  return (sel && sel.avatarUrl) ? sel.avatarUrl : user.getDefaultProfile();
});
</script>

<template>
  <div v-if="selected" class="chat_header">
    <a :href="avatarHref" target="_blank" rel="noopener">
      <img :src="userchat.getSelectedConversation().value.avatarUrl??user.getDefaultProfile()" class="avatar f">
    </a>
    <div class="name_signature">
      <h4>{{userchat.getSelectedConversation().value.name}}</h4>
      <p class="font_color font_small_size" style="margin-top: 7px">{{userchat.getSelectedConversation().value.signature?userchat.getSelectedConversation().value.signature:'个性签名desu'}}</p>
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
  padding: 14px 40px;
}
.avatar{
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgb(255 179 217);
}
.name_signature{
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: 20px;
}
</style>