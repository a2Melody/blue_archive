<script setup>

import {userStore} from "@/stores/UserStore.js";
/*sessionType: 'PRIVATE', sessionTargetId: 6, title: 'Mika', lastMessagePreview: '11111', lastMessageTime: '2026-01-08T13:26:59', …}*/
const props=defineProps({
  sessionTargetId:Number,
  title:String,
  avatar:String,
  signature:String,
  status:Boolean,
  latestMessage:String,
  LastMessageTime:Date,
  unreadCount:Number,

  selected:Boolean,
})

// 增：发出 select 事件，父组件用 @select="..." 监听
const emit = defineEmits(['select']);
function onClick() {
  emit('select');
}

</script>

<template>
  <div class="friend_item" @click="onClick" :class="{ 'friend_item--selected': props.selected }">
    <img :src="props.avatar" class="avatar">
    <div class="status">
      <div class="name_time">
        <h4 style="font-size: 14px">{{props.title}}</h4>
        <span class="time font_color font_small_size font_bold" style="margin-left: 70px">{{props.sessionTargetId}}</span>
      </div>
      <span class="font_small_size font_color"></span>
    </div>
  </div>
</template>

<style scoped>
.friend_item{
  display: flex;
  align-items: center;
  padding: 0.5rem;
/*  background-color: pink;*/
  border-radius: 10px;
  margin-bottom: 7px;
  border-bottom: 1px solid rgba(255, 179, 217, 0.3);
  user-select: none;
}
.friend_item--selected{
  background-color: #FFF0F5; /* 你可以换成想要的颜色 */
}
.friend_item:not(.friend_item--selected):hover{
  cursor: pointer;
  background-color: rgba(255,240,245,0.8);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.08);
}
.avatar{
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}
.status{
  margin-left: 7px;
  flex: 1 1 auto;
  min-width: 0;
}
.name_time{
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between
}
</style>