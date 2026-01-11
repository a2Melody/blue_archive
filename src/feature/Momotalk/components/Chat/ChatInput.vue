<script setup>

import {computed, ref} from "vue";
import {realTime} from "@/stores/RealTime.js";
import {userChat} from "@/stores/userChat.js";
import {userStore} from "@/stores/UserStore.js";

const uc = userChat();
const me = userStore();
const rt = realTime();

const selected = computed(() => uc.getSelectedConversation().value || null);

/*input中的内容*/
const draft=ref('');

// 发送消息（最小 optimistic update）
async function send() {
  const text = draft.value && draft.value.trim();
  if (!text) return;
  if (!selected.value) return;

  const targetId = String(selected.value.id);
  const myId = String(me.getUserId());

  // 清空输入并滚动（watch 会处理滚动，也可手动滚）
  draft.value = '';

  // 通过 WebSocket 发送（RealTime.sendPrivateText 会封装 envelope）
  try {
    rt.sendPrivateText(targetId, text);
    // 不做立即替换；等后端 NEW_MESSAGE / ACK 到来再处理（后端消息可能含 server id）
  } catch (e) {
    console.error('发送消息出错', e);
    // 可选：把本地临时消息标为 failed
    // 找到 messages[key] 并设置 status = 'failed' —— 可按需实现
  }
}
function onKeydown(e){
  if (e.key === 'Enter' && !e.shiftKey){
    e.preventDefault(); // 阻止插入换行
    send();
  }
}


</script>

<template>
  <div v-if="selected" class="chat_input f">
    <div class="buttons f">
      <button class="icon_container">
        <span class="iconfont icon-wenjianjia" style="font-size: 22px"></span>
      </button>
    </div>
    <textarea ref="messageEl" v-model="draft" class="editor" @keydown="onKeydown"></textarea>
    <button class="send" @click="send">发送<span class="iconfont icon-fasong1" style="margin-left: 4px;font-size: 16px" ></span></button>
  </div>
</template>

<style scoped>
.chat_input{
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  flex: 0 0 184px;
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