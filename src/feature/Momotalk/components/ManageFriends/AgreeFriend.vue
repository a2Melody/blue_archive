<script setup>

import AgreeFriendItem from "@/feature/Momotalk/components/ManageFriends/AgreeFriendItem.vue";
import {userChat} from "@/stores/userChat.js";

const userchat=userChat();
const agreeList=userchat.getAgreeingList();
</script>

<template>
  <div class="agree_container">
    <div class="number font_small_size font_small_bold" style="margin-left: 16px">申请人员<span style="color: pink;font-size: 1rem;margin-left: 4px" >1</span></div>
    <div class="agree_list">
      <AgreeFriendItem
          v-for="item in agreeList">

      </AgreeFriendItem>
    </div>
  </div>
</template>

<style scoped>
.agree_container{
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;         /* 新增：允许在 flex 容器中收缩，从而启用内部滚动 */
  border-radius: 10px;
  padding: 10px 20px;
}
.number{
  display: flex;
  align-items: center;
}
.agree_list{
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 6px 8px;
  overflow-y: auto;
}
.agree_list::-webkit-scrollbar {
  display: none;                /* 隐藏滚动条轨道 */
}
</style>