<script setup>
import momotalk from "@/assets/images/momotalk.png";
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import { userChat } from "@/stores/userChat.js";

const router = useRouter();
const emit = defineEmits(['toggle-friends']);

const uc = userChat();
// 红点数量：未处理好友申请数
const pendingCount = computed(() => uc.getPendingRequestsCount?.() ?? (uc.getAgreeingList()?.value?.length || 0));

// 首次进入时拉一次，避免刷新后红点不显示
onMounted(() => {
  if (uc.updateAgreeingList) {
    uc.updateAgreeingList().catch(()=>{});
  }
});
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
      <li class="icon_container">
        <span class="iconfont icon-shuyi_liaotian" title="聊天"></span>
      </li>

      <!-- 好友管理按钮 + 红点 -->
      <li class="icon_container icon_with_badge" @click="emit('toggle-friends')">
        <span class="iconfont icon-weibiaoti--" title="好友管理"></span>
        <span v-if="pendingCount > 0" class="badge">
          {{ pendingCount > 99 ? '99+' : pendingCount }}
        </span>
      </li>

      <li class="icon_container">
        <span class="iconfont icon-fanhui" @click="router.push('/firstFolders')" title="返回主页"></span>
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
/*左侧的momotalk的logo*/
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
  background-position: center; /* 建议加上，保证图片居中 */
  user-select: none;
}
.momotalk_name{
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.04em;
  margin-left: 4px;
}

/*右侧的按钮*/
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

/* 红点定位与样式 */
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
  /* 与导航背景做分隔描边，避免“糊在一起” */
  box-shadow: 0 0 0 2px rgb(241 157 170);
}
</style>