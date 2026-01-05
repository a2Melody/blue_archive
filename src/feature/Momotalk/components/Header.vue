<script setup>
import momotalk from "@/assets/images/momotalk.png";
import {useRouter} from "vue-router";

const router=useRouter();

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
        <span class="iconfont icon-shuyi_liaotian" title="消息"></span>
      </li>
      <li class="icon_container">
        <span class="iconfont icon-weibiaoti--" title="添加好友"></span>
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
  padding-right: 140px;
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
  user-select: none;
  margin-right: 12px;
}
.icon_container span{
  font-size: 22px;
  color: white;
}
.icon_container:hover{
  cursor: pointer;
  background-color: rgba(255,255,255,.4);
}

</style>