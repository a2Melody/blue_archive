<script setup>

import {computed, ref} from "vue";
import {realTime} from "@/stores/RealTime.js";
import {userChat} from "@/stores/userChat.js";
import {userStore} from "@/stores/UserStore.js";
import axios from "axios";

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

/*上传文件*/
/* 新增：隐藏的 file input 引用 */

const fileInput = ref(null);
const uploadedFile=ref(null);

/* 点击按钮时触发文件选择 */
function triggerFileSelect() {
  if (!selected.value) return;
  fileInput.value && fileInput.value.click();
}
/* 处理选择文件：presign -> PUT -> send WS -> optimistic append */
async function onFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  // 清空 input，便于下次重复选同文件
  e.target.value = null;

  const targetId = String(selected.value.id);
  const myId = String(me.getUserId());

  const contentType = file.type || 'application/octet-stream';
  const presignReq = { originalFilename: file.name, mimeType: contentType };

  try {
    // 1) 请求 presign
    const res = await axios.post('/api/chat/messages/presign', presignReq, { withCredentials: true });
    const data = res.data || {};
    const attachmentId = data.attachmentId;
    const putUrl = data.putUrl;
    const putHeaders = data.putHeaders || {};
    const getUrl = data.getUrl || null;

    // 2) PUT 上传到存储（带 putHeaders）
    const uploadHeaders = {};
    for (const k in putHeaders) {
      if (!Object.prototype.hasOwnProperty.call(putHeaders, k)) continue;
      uploadHeaders[k] = putHeaders[k];
    }
    uploadHeaders['Content-Type'] = contentType;

    const uploadRes = await fetch(putUrl, {
      method: 'PUT',
      headers: uploadHeaders,
      body: file,
    });
    if (!uploadRes.ok) {
      console.error('上传到 putUrl 失败', uploadRes.status, await uploadRes.text().catch(()=>null));
      return;
    }

    // 3) 通过 websocket 发送消息（把 attachmentId 发回后端）
    const payload = {
      conversationType: 'PRIVATE',
      targetUserId: Number(targetId),
      groupId: null,
      messageType: 'FILE', // 或 'IMAGE'，与后端约定一致
      content: file.name,  // 可选：用文件名作为 content
      attachmentId: Number(attachmentId)
    };
    // 使用 sendWsEnvelope 直接发送
    rt.sendWsEnvelope('SEND_MESSAGE', payload);

  } catch (err) {
    console.error('文件上传并发送失败', err);
  }
}


/*视频通话部分*/
// 新增 Imports（如果未导入）
// import { onBeforeUnmount } from 'vue';   // 如果文件顶端没有导入，就添加它
import { onMounted, onBeforeUnmount } from 'vue';

// 视频通话相关最小状态（module 级）
let pc = null;
let localStream = null;
let callId = null;
let localVideoEl = null;
let remoteVideoEl = null;
let videoContainer = null;

// ICE servers（根据需要调整）
const pcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// 辅助：创建简单的视频容器并插入 body（最小 UI）
function createVideoContainer() {
  // 如果已存在则复用
  if (videoContainer) return;
  videoContainer = document.createElement('div');
  videoContainer.style.position = 'fixed';
  videoContainer.style.right = '20px';
  videoContainer.style.bottom = '20px';
  videoContainer.style.zIndex = 9999;
  videoContainer.style.background = 'rgba(255,255,255,0.95)';
  videoContainer.style.border = '1px solid #eee';
  videoContainer.style.borderRadius = '8px';
  videoContainer.style.padding = '8px';
  videoContainer.style.display = 'flex';
  videoContainer.style.gap = '8px';
  videoContainer.style.alignItems = 'center';

  localVideoEl = document.createElement('video');
  localVideoEl.autoplay = true;
  localVideoEl.muted = true;
  localVideoEl.style.width = '120px';
  localVideoEl.style.height = '90px';
  localVideoEl.style.objectFit = 'cover';
  localVideoEl.style.borderRadius = '6px';

  remoteVideoEl = document.createElement('video');
  remoteVideoEl.autoplay = true;
  remoteVideoEl.style.width = '200px';
  remoteVideoEl.style.height = '150px';
  remoteVideoEl.style.objectFit = 'cover';
  remoteVideoEl.style.borderRadius = '6px';

  const hangupBtn = document.createElement('button');
  hangupBtn.textContent = '挂断';
  hangupBtn.style.height = '32px';
  hangupBtn.onclick = () => { hangupVideoCall('user_hangup'); };

  videoContainer.appendChild(localVideoEl);
  videoContainer.appendChild(remoteVideoEl);
  videoContainer.appendChild(hangupBtn);

  document.body.appendChild(videoContainer);
}

function cleanupVideoCall() {
  try {
    // 取消在 pc 上登记的 signal handlers（若有）
    if (pc && pc._onSignalHandlers) {
      const h = pc._onSignalHandlers;
      if (h.onAnswer) rt.offSignal && rt.offSignal('CALL_ANSWER', h.onAnswer);
      if (h.onIce) rt.offSignal && rt.offSignal('CALL_ICE', h.onIce);
      if (h.onHangup) rt.offSignal && rt.offSignal('CALL_HANGUP', h.onHangup);
      if (h.onReject) rt.offSignal && rt.offSignal('CALL_REJECT', h.onReject); // 新增
      if (h.calleeIce) rt.offSignal && rt.offSignal('CALL_ICE', h.calleeIce);
      if (h.calleeHangup) rt.offSignal && rt.offSignal('CALL_HANGUP', h.calleeHangup);
      pc._onSignalHandlers = null;
    }

    if (pc) { pc.close(); pc = null; }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    if (videoContainer) {
      videoContainer.remove();
      videoContainer = null;
      localVideoEl = null;
      remoteVideoEl = null;
    }
    // 清理缓存
    pendingIce.delete(callId);
    pendingAnswers.delete(callId);
    // 取消 callId
    callId = null;
  } catch (e) {
    console.error('cleanupVideoCall error', e);
  }
}

// 挂断（向对端/服务端发送 CALL_HANGUP）
function hangupVideoCall(reason = 'user_hangup') {
  if (!callId || !selected.value) {
    cleanupVideoCall();
    return;
  }
  const payload = { callId, reason };
  rt.sendWsEnvelope('CALL_HANGUP', payload);
  cleanupVideoCall();
}

// 主函数：发起视频通话（caller）
async function startVideoCall() {
  if (!selected.value) return;
  // 防止重复呼叫
  if (pc) {
    console.warn('already in call');
    return;
  }

  const targetUserId = Number(selected.value.id);
  callId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + String(Math.random()).slice(2);

  try {
    // 1) 获取本地媒体
    // 1) 获取本地媒体（兼容性检测与回退）
    if (typeof navigator === 'undefined') {
      throw new Error('Navigator is undefined in this environment.');
    }

    const md = navigator.mediaDevices ?? null;

    if (md && typeof md.getUserMedia === 'function') {
      // 标准 API（现代浏览器）
      localStream = await md.getUserMedia({ video: true, audio: true });
    } else {
      // 试试老的前缀 API（webkit / moz / 老版实现）
      const legacyGetUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (typeof legacyGetUserMedia === 'function') {
        localStream = await new Promise((resolve, reject) =>
            legacyGetUserMedia.call(navigator, { video: true, audio: true }, resolve, reject)
        );
      } else {
        // 无法获取摄像头/麦克风
        throw new Error('getUserMedia is not available. Ensure you run in a browser (not SSR), use HTTPS (or localhost), and allow camera/microphone permissions.');
      }
    }
    createVideoContainer();
    if (localVideoEl) localVideoEl.srcObject = localStream;

    // 2) 创建 PeerConnection
    pc = new RTCPeerConnection(pcConfig);

    // 当发现本地 candidate，通知对端
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        rt.sendWsEnvelope('CALL_ICE', {
          callId,
          candidate: ev.candidate.candidate,
          sdpMid: ev.candidate.sdpMid,
          sdpMLineIndex: ev.candidate.sdpMLineIndex
        });
      }
    };
    // 远端流到达
    pc.ontrack = (ev) => {
      if (remoteVideoEl) {
        remoteVideoEl.srcObject = ev.streams[0];
      }
    };

    // 添加本地 track
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    // 3) offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    // after await pc.setLocalDescription(offer);
    const pending = pendingAnswers.get(callId);
    if (pending) {
      // 直接调用处理逻辑（复用 onAnswer）
      await onAnswer(pending);
      pendingAnswers.delete(callId);
    }

    // 4) 发送 CALL_INVITE（包含 sdp）
    rt.sendWsEnvelope('CALL_INVITE', {
      targetUserId,
      callId,
      sdp: offer,
      metadata: 'video,audio'
    });

    // 5) 订阅来自 RealTime 的 signaling 事件（最小处理：ANSWER / ICE / HANGUP）
    // 在 send CALL_INVITE 前定义并注册信令 handler（包含 CALL_REJECT）
    const onAnswer = async (payload) => {
      if (payload.callId !== callId) return;
      try {
        if (!pc) {
          pendingAnswers.set(payload.callId, payload);
          return;
        }
        if (pc.signalingState === 'have-local-offer' || pc.signalingState === 'have-local-pranswer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          console.log('[call] setRemoteDescription(answer) OK');
        } else {
          pendingAnswers.set(payload.callId, payload);
          console.warn('[call] onAnswer: unexpected signalingState', pc.signalingState);
        }
      } catch (e) {
        console.error('setRemoteDescription failed', e);
      }
    };

    const onIce = async (payload) => {
      if (payload.callId !== callId) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate({
          candidate: payload.candidate,
          sdpMid: payload.sdpMid,
          sdpMLineIndex: payload.sdpMLineIndex
        }));
      } catch (e) { console.error('addIceCandidate failed', e); }
    };

// 新增：处理对方拒绝（CALL_REJECT）
    const onReject = (payload) => {
      if (payload.callId !== callId) return;
      console.log('[call] received CALL_REJECT', payload);
      // 可根据 reason 展示提示：payload.reason
      cleanupVideoCall();
    };

// 也保留挂断处理
    const onHangup = (payload) => {
      if (payload.callId !== callId) return;
      cleanupVideoCall();
    };

// 注册到 realTime（务必在发送 CALL_INVITE 之前注册，避免 race）
    rt.onSignal && rt.onSignal('CALL_ANSWER', onAnswer);
    rt.onSignal && rt.onSignal('CALL_ICE', onIce);
    rt.onSignal && rt.onSignal('CALL_REJECT', onReject);    // 新增注册
    rt.onSignal && rt.onSignal('CALL_HANGUP', onHangup);

// 把 handler 保存到 pc._onSignalHandlers 以便 cleanup 时统一 off
    pc._onSignalHandlers = { onAnswer, onIce, onReject, onHangup };
  } catch (e) {
    console.error('startVideoCall failed', e);
    cleanupVideoCall();
  }
}

// ---------- 插入开始：incoming call 处理与 ICE 缓冲 ----------
const pendingIce = new Map();
const pendingAnswers = new Map();

// 在收到 CALL_ICE 时若尚未创建 pc 则缓冲，创建后会消费这些缓冲
function handleSignalIce(payload) {
  if (!payload || !payload.callId) return;
  // 如果已经有 pc 且 callId 匹配，直接添加
  if (pc && callId === payload.callId) {
    try {
      pc.addIceCandidate(new RTCIceCandidate({
        candidate: payload.candidate,
        sdpMid: payload.sdpMid,
        sdpMLineIndex: payload.sdpMLineIndex
      })).catch(e => console.error('addIceCandidate error', e));
    } catch (e) {
      console.error('addIceCandidate sync error', e);
    }
    return;
  }
  // 否则缓冲，等接听后再添加
  const arr = pendingIce.get(payload.callId) || [];
  arr.push(payload);
  pendingIce.set(payload.callId, arr);
}

// 处理来电（CALL_INVITE）：弹窗询问、接听后建立被叫端 peer connection 并发送 ANSWER
async function handleIncomingInvite(payload) {
   console.log('[ChatInput] handleIncomingInvite called, payload=', payload);

  if (!payload || !payload.callId) return;
  console.log('incoming CALL_INVITE', payload);

  // 最小弹窗处理，改为 UI modal 可按需替换
  const accept = confirm(`来自 ${payload.fromUserId} 的视频邀请，是否接听？`);
  if (!accept) {
    rt.sendWsEnvelope('CALL_REJECT', { callId: payload.callId, reason: 'user_reject' });
    return;
  }

  // 防止重复接听
  if (pc) {
    console.warn('already in call, ignore incoming invite');
    return;
  }

  callId = payload.callId;

  try {
    // 1) 获取本地媒体（兼容性检测）
    const md = navigator.mediaDevices ?? null;
    if (md && typeof md.getUserMedia === 'function') {
      localStream = await md.getUserMedia({ video: true, audio: true });
    } else {
      const legacyGetUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (typeof legacyGetUserMedia === 'function') {
        localStream = await new Promise((resolve, reject) =>
            legacyGetUserMedia.call(navigator, { video: true, audio: true }, resolve, reject)
        );
      } else {
        alert('无法获取摄像头/麦克风：浏览器不支持 getUserMedia 或当前不是安全上下文（HTTPS/localhost）。');
        rt.sendWsEnvelope('CALL_REJECT', { callId, reason: 'no_media' });
        return;
      }
    }

    // 2) 显示本地预览、创建 pc
    createVideoContainer();
    if (localVideoEl) localVideoEl.srcObject = localStream;

    pc = new RTCPeerConnection(pcConfig);

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        rt.sendWsEnvelope('CALL_ICE', {
          callId,
          candidate: ev.candidate.candidate,
          sdpMid: ev.candidate.sdpMid,
          sdpMLineIndex: ev.candidate.sdpMLineIndex
        });
      }
    };

    pc.ontrack = (ev) => {
      if (remoteVideoEl) remoteVideoEl.srcObject = ev.streams[0];
    };

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    // 3) 设置远端描述（caller 发来的 offer）
    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

    // 4) 添加缓存的 ICE（如果有）
    const cached = pendingIce.get(callId) || [];
    for (const item of cached) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate({
          candidate: item.candidate,
          sdpMid: item.sdpMid,
          sdpMLineIndex: item.sdpMLineIndex
        }));
      } catch (e) { console.warn('adding cached candidate failed', e); }
    }
    pendingIce.delete(callId);

    // 5) createAnswer & setLocalDescription
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // 6) 发送 CALL_ANSWER（包含 sdp）
    rt.sendWsEnvelope('CALL_ANSWER', {
      callId,
      sdp: answer
    });

    // 7) 注册被叫端的信令监听（便于接收后续 ICE / HANGUP）
    const onIceForThis = async (p) => {
      try {
        if (!p || p.callId !== callId) return;

        // 如果 pc 尚未创建 或 已被清理 -> 缓存该 candidate，等待后续消费
        if (!pc) {
          const arr = pendingIce.get(p.callId) || [];
          arr.push(p);
          pendingIce.set(p.callId, arr);
          console.log('[ChatInput] onIceForThis: pc not ready, buffered candidate for', p.callId);
          return;
        }

        // pc 存在则尝试添加 candidate
        await pc.addIceCandidate(new RTCIceCandidate({
          candidate: p.candidate,
          sdpMid: p.sdpMid,
          sdpMLineIndex: p.sdpMLineIndex
        }));
        console.log('[ChatInput] onIceForThis: added candidate for', p.callId);
      } catch (err) {
        console.error('callee addIceCandidate error', err, p);
      }
    };
    const onHangupForThis = (p) => {
      if (p.callId !== callId) return;
      cleanupVideoCall();
    };

    rt.onSignal && rt.onSignal('CALL_ICE', onIceForThis);
    rt.onSignal && rt.onSignal('CALL_HANGUP', onHangupForThis);

    pc._onSignalHandlers = pc._onSignalHandlers || {};
    pc._onSignalHandlers.calleeIce = onIceForThis;
    pc._onSignalHandlers.calleeHangup = onHangupForThis;

  } catch (e) {
    console.error('error handling incoming call', e);
    alert('接听失败：' + (e && e.message ? e.message : String(e)));
    rt.sendWsEnvelope('CALL_REJECT', { callId: payload.callId, reason: 'accept_failed' });
    cleanupVideoCall();
  }
}



onMounted(() => {
  // 注册来电 & 全局 ICE 缓冲处理
  rt.onSignal && rt.onSignal('CALL_INVITE', handleIncomingInvite);
  console.log('[ChatInput] registered CALL_INVITE handler');
  rt.onSignal && rt.onSignal('CALL_ICE', handleSignalIce);
  // 也处理对端在未注册本地 pc 前发来的挂断
  rt.onSignal && rt.onSignal('CALL_HANGUP', (p) => {
    if (p && p.callId && p.callId === callId) cleanupVideoCall();
  });
});
// 在组件卸载时清理并取消订阅
onBeforeUnmount(() => {
  // 移除全局注册的来电与 ICE 缓冲 handler
  rt.offSignal && rt.offSignal('CALL_INVITE', handleIncomingInvite);
  rt.offSignal && rt.offSignal('CALL_ICE', handleSignalIce);

  // 如果之前注册了 caller 的 handler，取消
  if (pc && pc._onSignalHandlers) {
    const { onAnswer, onIce, onHangup, calleeIce, calleeHangup } = pc._onSignalHandlers;
    if (onAnswer) rt.offSignal && rt.offSignal('CALL_ANSWER', onAnswer);
    if (onIce) rt.offSignal && rt.offSignal('CALL_ICE', onIce);
    if (onHangup) rt.offSignal && rt.offSignal('CALL_HANGUP', onHangup);
    if (calleeIce) rt.offSignal && rt.offSignal('CALL_ICE', calleeIce);
    if (calleeHangup) rt.offSignal && rt.offSignal('CALL_HANGUP', calleeHangup);
  }

  cleanupVideoCall();
});
</script>

<template>
  <div v-if="selected" class="chat_input f">
    <div class="buttons f">
      <!-- 把按钮的点击改为触发文件选择 -->
      <button class="icon_container" @click="triggerFileSelect">
        <span class="iconfont icon-wenjianjia" style="font-size: 22px"></span>
      </button>
      <!-- 隐藏的 file input -->
      <input ref="fileInput" type="file" style="display:none" @change="onFileChange" />

      <button class="icon_container" style="margin-left: 5px" @click="startVideoCall">
        <span class="iconfont icon-qunliao-shipinliaotian" style="font-size: 25px" ></span>
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
  flex: 0 0 170px;
  width: 100%;
  height: 184px;
  border-top: 1px solid rgba(255, 179, 217, 0.3);
  overflow-y: auto;
}
.buttons{
  display: flex;
}
.icon_container{
  display: flex;
  align-items: center;
  justify-content: center;
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