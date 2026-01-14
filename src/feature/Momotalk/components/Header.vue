<script setup>
import momotalk from "@/assets/images/momotalk.png";
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import axios from "axios";
import { userChat } from "@/stores/userChat.js";
import { userStore } from "@/stores/UserStore.js";

const router = useRouter();
// 事件：好友管理、编辑个人信息
const emit = defineEmits(['toggle-friends', 'edit-profile']);

const uc = userChat();
const me = userStore();

// 红点数量：未处理好友申请数
const pendingCount = computed(
    () => uc.getPendingRequestsCount?.() ?? (uc.getAgreeingList()?.value?.length || 0)
);

onMounted(() => {
  if (uc.updateAgreeingList) {
    uc.updateAgreeingList().catch(() => {});
  }
});

// 返回主页 = 调用后端登出 + 清前端状态 + 回到登录页
async function handleLogoutAndBack() {
  try {
    await axios.post('/api/user/logout', {}, { withCredentials: true });
  } catch (e) {
    console.warn('logout api failed, still clear local state', e?.response?.data || e?.message);
  }
  me.clearAll && me.clearAll();
  uc.resetForLogout && uc.resetForLogout();
  router.push('/');
}
</script>

<template>
  <div class="nav">
    <ul>
      <li class="momotalk_container">
        <div class="momotalk" :style="{ backgroundImage:`url(${momotalk})`}" ></div>
        <span class="momotalk_name">桃信Momotalk</span>
      </li>
    </ul>

    <ul class="icons">
      <!-- 当前就是聊天页，这个图标只是视觉提示 -->
      <li class="icon_container">
        <span class="iconfont icon-shuyi_liaotian" title="聊天"></span>
      </li>

      <!-- 个人资料：点击打开自定义信息编辑弹窗 -->
      <li class="icon_container" @click="emit('edit-profile')">
        <span class="iconfont icon-yonghu" title="个人资料"></span>
      </li>

      <!-- 好友管理按钮 + 红点 -->
      <li class="icon_container icon_with_badge" @click="emit('toggle-friends')">
        <span class="iconfont icon-weibiaoti--" title="好友管理"></span>
        <span v-if="pendingCount > 0" class="badge">
          {{ pendingCount > 99 ? '99+' : pendingCount }}
        </span>
      </li>

      <!-- 返回主页：登出并返回登录页 -->
      <li class="icon_container" @click="handleLogoutAndBack">
        <span class="iconfont icon-fanhui" title="退出到登录"></span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64px;
  background-color: rgb(241 157 170);
  padding-left: 80px;
  padding-right: 120px;
}
.nav ul{
  display: flex;
  align-items: center;
}

/* 左侧 Momotalk logo */
.momotalk_container{
  display: flex;
  align-items: center;
}
.momotalk{
  display: inline-block;
  vertical-align: middle;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  user-select: none;
}
.momotalk_name{
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.04em;
  margin-left: 4px;
}

/* 右侧按钮 */
.icon_container{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 38px;
  line-height: 38px;
  border-radius: 15px;
  margin-right: 16px;
}
.icon_container span{
  font-size: 22px;
  color: white;
}
.icon_container:hover{
  cursor: pointer;
  background-color: rgba(255,255,255,.4);
}

/* 红点 */
.icon_with_badge{
  position: relative;
}
.badge{
  transform: scale(0.7);
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 9px;
  height: 18px;
  padding: 0 4px;
  background: #ff4d4f;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px rgb(241 157 170);
}
</style>