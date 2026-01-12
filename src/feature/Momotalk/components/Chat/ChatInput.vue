<script setup>

import {computed, ref, onMounted, onBeforeUnmount} from "vue";
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
  }
}
function onKeydown(e){
  if (e.key === 'Enter' && !e.shiftKey){
    e.preventDefault(); // 阻止插入换行
    send();
  }
}

/*上传文件*/
const fileInput = ref(null);
const uploadedFile=ref(null);

function triggerFileSelect() {
  if (!selected.value) return;
  fileInput.value && fileInput.value.click();
}
async function onFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = null;

  const targetId = String(selected.value.id);

  const contentType = file.type || 'application/octet-stream';
  const presignReq = { originalFilename: file.name, mimeType: contentType };

  try {
    const res = await axios.post('/api/chat/messages/presign', presignReq, { withCredentials: true });
    const data = res.data || {};
    const attachmentId = data.attachmentId;
    const putUrl = data.putUrl;
    const putHeaders = data.putHeaders || {};
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

    const payload = {
      conversationType: 'PRIVATE',
      targetUserId: Number(targetId),
      groupId: null,
      messageType: 'FILE',
      content: file.name,
      attachmentId: Number(attachmentId)
    };
    rt.sendWsEnvelope('SEND_MESSAGE', payload);

  } catch (err) {
    console.error('文件上传并发送失败', err);
  }
}


/*视频通话部分*/
let pc = null;
let localStream = null;
let callId = null;
let localVideoEl = null;
let remoteVideoEl = null;
let videoContainer = null;

const pcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

function createVideoContainer() {
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
    if (pc && pc._onSignalHandlers) {
      const h = pc._onSignalHandlers;
      if (h.onAnswer) rt.offSignal && rt.offSignal('CALL_ANSWER', h.onAnswer);
      if (h.onIce) rt.offSignal && rt.offSignal('CALL_ICE', h.onIce);
      if (h.onHangup) rt.offSignal && rt.offSignal('CALL_HANGUP', h.onHangup);
      if (h.onReject) rt.offSignal && rt.offSignal('CALL_REJECT', h.onReject);
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
    pendingIce.delete(callId);
    pendingAnswers.delete(callId);
    callId = null;
    // clear any incoming UI state if present
    incomingCall.value = null;
    clearIncomingTimeout();
  } catch (e) {
    console.error('cleanupVideoCall error', e);
  }
}

function hangupVideoCall(reason = 'user_hangup') {
  if (!callId || !selected.value) {
    cleanupVideoCall();
    return;
  }
  const payload = { callId, reason };
  rt.sendWsEnvelope('CALL_HANGUP', payload);
  cleanupVideoCall();
}

// 主动呼叫（caller）
async function startVideoCall() {
  if (!selected.value) return;
  if (pc) {
    console.warn('already in call');
    return;
  }

  const targetUserId = Number(selected.value.id);
  callId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + String(Math.random()).slice(2);

  try {
    if (typeof navigator === 'undefined') {
      throw new Error('Navigator is undefined in this environment.');
    }

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
        throw new Error('getUserMedia is not available. Ensure you run in a browser (not SSR), use HTTPS (or localhost), and allow camera/microphone permissions.');
      }
    }
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
      if (remoteVideoEl) {
        remoteVideoEl.srcObject = ev.streams[0];
      }
    };

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const pending = pendingAnswers.get(callId);
    if (pending) {
      // onAnswer is registered below; pending will be processed there
      await onAnswer(pending);
      pendingAnswers.delete(callId);
    }

    rt.sendWsEnvelope('CALL_INVITE', {
      targetUserId,
      callId,
      sdp: offer,
      metadata: 'video,audio'
    });

    // register handlers
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

    const onReject = (payload) => {
      if (payload.callId !== callId) return;
      console.log('[call] received CALL_REJECT', payload);
      cleanupVideoCall();
    };

    const onHangup = (payload) => {
      if (payload.callId !== callId) return;
      cleanupVideoCall();
    };

    rt.onSignal && rt.onSignal('CALL_ANSWER', onAnswer);
    rt.onSignal && rt.onSignal('CALL_ICE', onIce);
    rt.onSignal && rt.onSignal('CALL_REJECT', onReject);
    rt.onSignal && rt.onSignal('CALL_HANGUP', onHangup);

    pc._onSignalHandlers = { onAnswer, onIce, onReject, onHangup };

  } catch (e) {
    console.error('startVideoCall failed', e);
    cleanupVideoCall();
  }
}

// pending buffers
const pendingIce = new Map();
const pendingAnswers = new Map();

function handleSignalIce(payload) {
  if (!payload || !payload.callId) return;
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
  const arr = pendingIce.get(payload.callId) || [];
  arr.push(payload);
  pendingIce.set(payload.callId, arr);
}

// --- 非阻塞来电处理 (替换原 confirm) ---
const incomingCall = ref(null); // { payload, fromUserId, callId }
let incomingTimeoutId = null;
function clearIncomingTimeout() {
  if (incomingTimeoutId) { clearTimeout(incomingTimeoutId); incomingTimeoutId = null; }
}

// 收到邀请时只设置 UI 状态（不再直接 confirm）
function handleIncomingInvite(payload) {
  console.log('[ChatInput] handleIncomingInvite called, payload=', payload);
  if (!payload || !payload.callId) return;

  // 若已有未处理来电或正在通话 -> 自动 busy 拒绝
  if (incomingCall.value || pc) {
    console.log('[ChatInput] already inbound or in call - auto reject', payload.callId);
    rt.sendWsEnvelope('CALL_REJECT', { callId: payload.callId, reason: 'busy' });
    return;
  }

  incomingCall.value = {
    payload,
    fromUserId: payload.fromUserId,
    callId: payload.callId
  };

  // 超时自动拒绝，例如 30s
  incomingTimeoutId = setTimeout(() => {
    if (incomingCall.value && incomingCall.value.callId === payload.callId) {
      console.log('[ChatInput] incoming call auto-reject due to timeout', payload.callId);
      rt.sendWsEnvelope('CALL_REJECT', { callId: payload.callId, reason: 'timeout' });
      incomingCall.value = null;
      incomingTimeoutId = null;
    }
  }, 30000);
}

// 用户点击接听时执行原来的接听逻辑（已从 handleIncomingInvite 中抽出）
async function acceptIncomingCall() {
  const info = incomingCall.value;
  if (!info || !info.payload) return;
  clearIncomingTimeout();

  // 防止重复接听
  if (pc) {
    console.warn('already in call, ignore incoming invite');
    incomingCall.value = null;
    return;
  }

  callId = info.payload.callId;

  try {
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
        incomingCall.value = null;
        return;
      }
    }

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

    await pc.setRemoteDescription(new RTCSessionDescription(info.payload.sdp));

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

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    rt.sendWsEnvelope('CALL_ANSWER', {
      callId,
      sdp: answer
    });

    const onIceForThis = async (p) => {
      try {
        if (!p || p.callId !== callId) return;
        if (!pc) {
          const arr = pendingIce.get(p.callId) || [];
          arr.push(p);
          pendingIce.set(p.callId, arr);
          console.log('[ChatInput] onIceForThis: pc not ready, buffered candidate for', p.callId);
          return;
        }
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

    incomingCall.value = null;
  } catch (e) {
    console.error('error handling incoming call (accept)', e);
    alert('接听失败：' + (e && e.message ? e.message : String(e)));
    rt.sendWsEnvelope('CALL_REJECT', { callId: info.payload.callId, reason: 'accept_failed' });
    incomingCall.value = null;
    cleanupVideoCall();
  }
}

function rejectIncomingCall(reason = 'user_reject') {
  const info = incomingCall.value;
  if (!info || !info.payload) return;
  clearIncomingTimeout();
  // 发送拒绝信令
  rt.sendWsEnvelope('CALL_REJECT', { callId: info.payload.callId, reason });
  // 额外再发一个挂断，确保对端无论是否已注册 CALL_REJECT 处理器都能关闭呼叫（最小兼容性修复）
  rt.sendWsEnvelope('CALL_HANGUP', { callId: info.payload.callId, reason });
  incomingCall.value = null;
}

// 注册与卸载
onMounted(() => {
  rt.onSignal && rt.onSignal('CALL_INVITE', handleIncomingInvite);
  console.log('[ChatInput] registered CALL_INVITE handler');
  rt.onSignal && rt.onSignal('CALL_ICE', handleSignalIce);
  rt.onSignal && rt.onSignal('CALL_HANGUP', (p) => {
    if (p && p.callId && p.callId === callId) cleanupVideoCall();
  });
});

onBeforeUnmount(() => {
  rt.offSignal && rt.offSignal('CALL_INVITE', handleIncomingInvite);
  rt.offSignal && rt.offSignal('CALL_ICE', handleSignalIce);
  clearIncomingTimeout();

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
      <button class="icon_container" @click="triggerFileSelect">
        <span class="iconfont icon-wenjianjia" style="font-size: 22px"></span>
      </button>
      <input ref="fileInput" type="file" style="display:none" @change="onFileChange" />

      <button class="icon_container" style="margin-left: 5px" @click="startVideoCall">
        <span class="iconfont icon-qunliao-shipinliaotian" style="font-size: 25px" ></span>
      </button>
    </div>
    <textarea ref="messageEl" v-model="draft" class="editor" @keydown="onKeydown"></textarea>
    <button class="send" @click="send">发送<span class="iconfont icon-fasong1" style="margin-left: 4px;font-size: 16px" ></span></button>

    <!-- 非阻塞来电 modal -->
    <div v-if="incomingCall" class="incoming-modal">
      <div class="incoming-card">
        <p>来自uid: {{ incomingCall.fromUserId }} 的视频邀请</p>
        <div class="controls">
          <button @click="acceptIncomingCall">接听</button>
          <button @click="rejectIncomingCall">拒绝</button>
        </div>
        <small>若长时间未响应将自动拒绝</small>
      </div>
    </div>
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

/* incoming modal 简单样式 */
.incoming-modal {
  position: fixed;
  left: 50%;
  top: 30%;
  transform: translateX(-50%);
  z-index: 10000;
}
.incoming-card {
  background: white;
  border: 1px solid #ddd;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  text-align: center;
}
.incoming-card .controls {
  display:flex;
  gap:10px;
  justify-content:center;
  margin-top:8px;
}
.incoming-card button {
  padding:6px 10px;
  border-radius:6px;
  border:none;
  cursor:pointer;
}
.incoming-card button:first-child { background:pink; color:white; }
.incoming-card button:last-child { background: #c1c1c1; color:white; }
</style>