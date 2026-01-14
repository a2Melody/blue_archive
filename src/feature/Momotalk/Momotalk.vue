<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import Header from "@/feature/Momotalk/components/Header.vue";
import Chat from "@/feature/Momotalk/components/Chat.vue";
import ManageFriends from "@/feature/Momotalk/components/ManageFriends.vue";
import { realTime } from "@/stores/RealTime.js";
import { userChat } from "@/stores/userChat.js";
import { userStore } from "@/stores/UserStore.js";
import axios from "axios";

const showFriends = ref(false);
const showProfileEditor = ref(false);

const realtime = realTime();
const userchat = userChat();
const me = userStore();

const editingName = ref('');
const editingSignature = ref('');
const uploading = ref(false);

// 最近一次“成功 PUT 到对象存储”的头像 attachmentId，等待绑定
const pendingAvatarAttachmentId = ref(null);

// 头像预览：优先显示当前 store 中的头像地址，如果选择了新图并上传成功，
// 我们会先更新 store 里的 profile，因此这里始终使用 getProfile()
const avatarPreview = computed(() => {
  if (me.getProfile) return me.getProfile();
  if (me.getAvatarUrl) return me.getAvatarUrl();
  return me.getDefaultProfile ? me.getDefaultProfile() : '';
});

const fileInput = ref(null);

onMounted(async () => {
  console.log("Momotalk onMounted");
  realtime.initWs();
  await userchat.updateFriendList();
  await userchat.updateAgreeingList();
  await userchat.loadAllFriendHistories();

  // 初始化编辑框内容
  editingName.value = me.getUserName ? (me.getUserName() || '') : '';
  editingSignature.value = me.getSignature ? (me.getSignature() || '') : '';
});

onUnmounted(() => {
  realtime.closeWs();
  userchat.resetForLogout();
});

function toggleFriends() {
  showFriends.value = true;
}
function closeFriends() {
  showFriends.value = false;
}

function openProfileEditor() {
  editingName.value = me.getUserName ? (me.getUserName() || '') : '';
  editingSignature.value = me.getSignature ? (me.getSignature() || '') : '';
  showProfileEditor.value = true;
  // 打开时清空待绑定 id，避免误用旧的
  pendingAvatarAttachmentId.value = null;
}
function closeProfileEditor() {
  showProfileEditor.value = false;
}

/** 选择新头像（弹出文件选择框） */
function chooseAvatar() {
  if (fileInput.value) fileInput.value.click();
}

/**
 * 上传新头像：
 * 1. 调用 /api/user/presign 获取 attachmentId / putUrl / putHeaders
 * 2. 使用 fetch PUT 把图片上传到存储
 * 3. 上传成功后：
 *    - 记录 attachmentId 到 pendingAvatarAttachmentId
 *    - 先更新本地头像预览（这里直接用 FileReader 的 base64，或者你愿意也可以重新 GET 一次 putUrl 对应的公开地址）
 */
async function onAvatarFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = null; // 允许下次选择同一文件

  uploading.value = true;
  try {
    const contentType = file.type || 'application/octet-stream';
    const presignReq = { originalFilename: file.name, mimeType: contentType };

    // 1) 预签名
    const presignRes = await axios.post('/api/user/presign', presignReq, { withCredentials: true });
    const presignData = presignRes.data || {};
    const attachmentId = presignData.attachmentId;
    const putUrl = presignData.putUrl;
    const putHeaders = presignData.putHeaders || {};

    if (!attachmentId || !putUrl) {
      console.error('presign 返回缺少 attachmentId 或 putUrl', presignData);
      alert('获取上传信息失败，请稍后重试');
      return;
    }

    // 2) 合并 headers 并 PUT 上传
    const uploadHeaders = {};
    for (const k in putHeaders) {
      if (Object.prototype.hasOwnProperty.call(putHeaders, k)) {
        uploadHeaders[k] = putHeaders[k];
      }
    }
    uploadHeaders['Content-Type'] = contentType;

    const uploadRes = await fetch(putUrl, {
      method: 'PUT',
      headers: uploadHeaders,
      body: file,
    });
    if (!uploadRes.ok) {
      console.error('上传头像失败', uploadRes.status, await uploadRes.text().catch(()=>null));
      alert('头像上传失败，请稍后再试');
      return;
    }

    // 3) 上传成功：记录 attachmentId，更新预览
    pendingAvatarAttachmentId.value = Number(attachmentId);

    // 使用本地 base64 预览（即时反馈）
    const reader = new FileReader();
    reader.onload = () => {
      if (me.setProfile) me.setProfile(reader.result);
    };
    reader.readAsDataURL(file);

  } catch (err) {
    console.error('头像上传过程出错', err);
    alert('头像上传失败，请稍后再试');
  } finally {
    uploading.value = false;
  }
}

/**
 * 保存资料：
 * 1. 如签名有变化 -> 调用 /api/user/signature 更新后端 & 本地 store
 * 2. 如 pendingAvatarAttachmentId 有值 -> 调用 /api/user/userAvatar 绑定头像
 * 3. 昵称目前只本地更新（如果你将来有昵称更新接口，可以一并接）
 */
async function saveProfile() {
  try {
    // 1) 更新签名
    if (editingSignature.value !== (me.getSignature ? me.getSignature() : '')) {
      await axios.post('/api/user/signature', {
        personalSignature: editingSignature.value || ''
      });
      me.setSignature && me.setSignature(editingSignature.value || '');
    }

    // 2) 绑定头像（如果用户在本次编辑中选择并上传了新头像）
    if (pendingAvatarAttachmentId.value) {
      const bindRes = await axios.post(
          '/api/user/userAvatar',
          { attachmentId: pendingAvatarAttachmentId.value },
          { withCredentials: true }
      );
      const respData = bindRes.data || {};
      const avatarUrl = respData.data?.avatarUrl || respData.avatarUrl || null;
      if (avatarUrl && me.setProfile) {
        me.setProfile(avatarUrl);
      }
    }

    // 3) 昵称本地更新（后端未实现接口的前提下）
    if (me.setUser && me.getUserId) {
      me.setUser(
          me.getUserId(),
          editingName.value,
          me.getProfile ? me.getProfile() : avatarPreview.value,
          me.getSignature ? me.getSignature() : editingSignature.value
      );
    }

    alert('保存成功');
    closeProfileEditor();
  } catch (e) {
    console.error('保存个人资料失败', e);
    alert('保存失败，请稍后再试');
  }
}
</script>

<template>
  <div class="momotalk_root">
    <Header
        @toggle-friends="toggleFriends"
        @edit-profile="openProfileEditor"
    />

    <Chat />

    <!-- 好友管理遮罩 + 弹窗 -->
    <div v-if="showFriends" class="friends_overlay" @click="closeFriends">
      <div class="friends_overlay_inner" @click.stop>
        <ManageFriends @close="closeFriends" />
      </div>
    </div>

    <!-- 个人资料编辑遮罩 + 自定义白板卡片 -->
    <div v-if="showProfileEditor" class="profile_overlay" @click="closeProfileEditor">
      <div class="profile_overlay_inner" @click.stop>
        <div class="profile_card">
          <div class="profile_header">
            <span>编辑个人资料</span>
            <button class="icon_btn" @click="closeProfileEditor">✕</button>
          </div>

          <!-- 显示 userId -->
          <div class="user_id_line">
            用户ID：<span class="user_id_value">{{ me.getUserId ? me.getUserId() : '' }}</span>
          </div>

          <div class="profile_body">
            <div class="avatar_section">
              <div class="avatar_preview" :style="{ backgroundImage: `url(${avatarPreview})` }"></div>
              <button class="btn_secondary" @click="chooseAvatar" :disabled="uploading">
                {{ uploading ? '上传中…' : '更换头像' }}
              </button>
              <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  style="display:none"
                  @change="onAvatarFileChange"
              />
            </div>

            <div class="fields_section">
              <label class="field">
                <span class="field_label">昵称</span>
                <input
                    v-model="editingName"
                    type="text"
                    class="field_input"
                    maxlength="32"
                    placeholder="请输入昵称"
                />
              </label>

              <label class="field">
                <span class="field_label">个性签名</span>
                <textarea
                    v-model="editingSignature"
                    class="field_textarea"
                    maxlength="200"
                    placeholder="写一点想说的话吧…"
                ></textarea>
                <div class="field_hint">
                  {{ (editingSignature || '').length }}/200
                </div>
              </label>
            </div>
          </div>

          <div class="profile_footer">
            <button class="btn_secondary" @click="closeProfileEditor">取消</button>
            <button class="btn_primary" :disabled="uploading" @click="saveProfile">
              {{ uploading ? '保存中…' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.momotalk_root{
  display:flex;
  flex-direction:column;
  width:100%;
  height:100vh;
}

/* 好友管理遮罩：保持原样 */
.friends_overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2500;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh;
}
.friends_overlay_inner{
  position: relative;
}

/* 个人资料编辑遮罩：全屏 + 居中 */
.profile_overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2600;
  display: flex;
  justify-content: center;
  align-items: center;
}
.profile_overlay_inner{
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 90vh;
}

/* 白板卡片本体 */
.profile_card{
  width: 600px;
  max-width: 95vw;
  background: #fff;
  border-radius: 8px;
  padding: 20px 22px 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 标题栏 */
.profile_header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 8px;
}
.profile_header span{
  font-size: 18px;
  font-weight: 600;
  color:#333;
}
.icon_btn{
  border:none;
  background:transparent;
  font-size: 16px;
  cursor:pointer;
  padding: 2px 4px;
  color:#999;
}
.icon_btn:hover{
  color:#666;
}

/* 用户ID显示 */
.user_id_line{
  font-size: 13px;
  color:#777;
  margin-bottom: 8px;
}
.user_id_value{
  font-weight: 600;
  color:#555;
}

/* 主体：左头像右字段 */
.profile_body{
  display:flex;
  gap:20px;
  margin-top: 4px;
}
.avatar_section{
  flex:0 0 140px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
}
.avatar_preview{
  width:96px;
  height:96px;
  border-radius:50%;
  background-position:center;
  background-size:cover;
  background-repeat:no-repeat;
  border:2px solid rgba(241,157,170,0.8);
}
.fields_section{
  flex:1;
  display:flex;
  flex-direction:column;
  gap:12px;
}
.field{
  display:flex;
  flex-direction:column;
  gap:6px;
}
.field_label{
  font-size: 13px;
  color:#666;
}
.field_input{
  height:32px;
  border-radius:6px;
  border:1px solid #ddd;
  padding: 4px 8px;
  font-size: 14px;
  outline:none;
}
.field_input:focus{
  border-color:#ff9db2;
  box-shadow: 0 0 0 1px rgba(255,157,178,0.4);
}
.field_textarea{
  min-height:70px;
  max-height:120px;
  resize: vertical;
  border-radius:6px;
  border:1px solid #ddd;
  padding:6px 8px;
  font-size: 14px;
  outline:none;
}
.field_textarea:focus{
  border-color:#ff9db2;
  box-shadow: 0 0 0 1px rgba(255,157,178,0.4);
}
.field_hint{
  font-size: 12px;
  color:#999;
  text-align:right;
}

/* 底部按钮区 */
.profile_footer{
  margin-top: 16px;
  display:flex;
  justify-content:flex-end;
  gap:8px;
}
.btn_primary{
  min-width:72px;
  height:30px;
  padding:0 14px;
  border-radius:16px;
  border:none;
  cursor:pointer;
  background: rgb(241 157 170);
  color:#fff;
  font-size:14px;
}
.btn_primary:disabled{
  opacity:.6;
  cursor:not-allowed;
}
.btn_primary:hover:not(:disabled){
  background: rgba(241,157,170,0.85);
}
.btn_secondary{
  min-width:60px;
  height:30px;
  padding:0 12px;
  border-radius:16px;
  border:1px solid #ddd;
  background:#fff;
  color:#555;
  font-size:14px;
  cursor:pointer;
}
.btn_secondary:hover{
  background:#f7f7f7;
}
</style>