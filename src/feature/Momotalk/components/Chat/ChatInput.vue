<script setup>

import {ref} from "vue";
import {realTime} from "@/stores/RealTime.js";

const message=ref('');
const realtime=realTime();

function send(){
  if (!message.value) return;
  // 在这里放你真正的发送逻辑
  console.log("test 传输信息为"+message.value);
  userchat.sendPrivateText(4,message.value);
  message.value='';
}
function onKeydown(e){
  if (e.key === 'Enter' && !e.shiftKey){
    e.preventDefault(); // 阻止插入换行
    send();
  }
}

</script>

<template>
  <div class="chat_input">
    <div class="buttons f">
      <button class="icon_container">
        <span class="iconfont icon-wenjianjia" style="font-size: 22px"></span>
      </button>
    </div>
    <textarea ref="messageEl" v-model="message" class="editor" @keydown="onKeydown"></textarea>
    <button class="send" @click="send">发送<span class="iconfont icon-fasong1" style="margin-left: 4px;font-size: 16px" ></span></button>
  </div>
</template>

<style scoped>
.chat_input{
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  width: 100%;
  height: 184px;
  border-top: 1px solid rgba(255, 179, 217, 0.3);
  overflow-y: auto;
}
.icon_container{
  width: 30px;
  height: 30px;
}
.icon_container:hover{
  background-color: rgba(255,240,245,1);
}
.editor{
  flex: 1;              /* 占据剩余的垂直空间 */
  width: 100%;
  resize: none;
  overflow-y: auto;     /* 消息内容超出时可滚动 */
  padding: 8px 5px;
  border: none;
  outline: none;
}
.editor:focus{
  outline: none;
}
.send{
  width: 80px;
  height: 32px;
  background-color: rgb(241 157 170);
  color: white;
  border-radius: 20px;
  transition: all 0.5s ease;
  font-size: 16px;
  align-self: flex-end;
  margin-top: 8px;
}
.send:hover{
  cursor: pointer;
  transform: scale(1.02);
  background-color: rgba(241,157,170,0.7);
}
</style>