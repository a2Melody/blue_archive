<script setup lang="js">
import sweets from "../../assets/images/sweets.svg";
import momotalk from "@/assets/images/momotalk.jpg";
import {ref,computed} from "vue"
import {userStore} from "@/stores/UserStore.js";
import {useRouter} from "vue-router";
import axios from "axios";

const user=userStore();
const router=useRouter();
const signature=ref('');
const show=ref(true);
const isLogin = computed(() => user.accessToken);


function input_enter(e){
    e.preventDefault();
    e.target.blur();
}
function input_focus(e){
    e.target.placeholder='';
}
function input_blur(e){
  if(signature.value===''){
    e.target.placeholder='与你的每一天都是奇迹';
  }
}
function changeShow(){
  show.value=!show.value;
}
/*小a悬浮时会向上跳跃一下*/
function jump(e){
  const el=e.currentTarget;
  if(!el) return;
  void el.offsetWidth;
  el.classList.add("nav-jumping");
  const clean = () => { el.classList.remove("nav-jumping"); };
  el.addEventListener("animationend", clean, { once: true });   //动画结束后调用clean函数，并且触发一次事件后自动删除监听器
}

/*切换账户的函数功能*/
async function logout(){
  try {
    const res = await axios.post('/api/user/logout');
    console.log('后端返回：', res.data);
    user.clearAll();
    await router.push('/');
  } catch (err) {
    console.error('请求出错：', err);
  }
}

/*复制用户的id*/
async function copyId(id) {
  try {
    await navigator.clipboard.writeText(id);
    alert('复制成功');
  } catch (err) {
    console.error('无法复制: ', err);
  }
}
</script>

<template>
  <div class="nav-shell" :class="show ? 'h64' : 'h20'">
    <transition name="up" mode="out-in">
      <div class="navigator_container" v-if="show">
        <!--      logo-->
        <div class="logo">
          <img :src="sweets" width="30px" height="27px" alt="logo">
          <span>放学甜点部</span>
        </div>
        <!--      RouterLink-->
        <ul class="nav">
          <li style="position: relative">
            <div class="momotalk" @click="router.push('/momotalk')" :style="{ backgroundImage:`url(${momotalk})`}" ></div>
            <div class="momotalk_numbers" v-if="user.getMessages()===null||user.getMessages()===0">99+</div>
          </li>
          <li><RouterLink to="/videos" class="nav_link" @mouseenter="jump">社交</RouterLink></li>
          <li><RouterLink to="/firstFolders" class="nav_link" @mouseenter="jump">收藏</RouterLink></li>
          <li><RouterLink to="/diary" class="nav_link" @mouseenter="jump">日记</RouterLink></li>
          <li><RouterLink to="/test" class="nav_link" @mouseenter="jump">测试</RouterLink></li>
        </ul>
        <!--      头像 profile photo-->
        <div class="profile_wrapper" v-if="isLogin" :class="{ 'no-login': !isLogin }">
          <div class="profile" :style="user.profile?{ backgroundImage:`url(${user.profile})`}:{}" @click="router.push('/cropProfile')"></div>
          <ul class="content" v-if="isLogin">
            <li class="user_name">{{ user.getUserName() }}</li>
            <li class="user_id" @click="copyId(user.getUserId().value)">{{user.getUserId()}}
              <span class="iconfont icon-fuzhi copy_icon" style="margin-left: 6px"></span>
            </li>
            <li class="li_a"><router-link to="/lazy">个人中心</router-link><span class="iconfont icon-arrow-right-s-line span_icon"></span></li>
            <li class="li_a"><router-link to="/lazy">待开发中</router-link><span class="iconfont icon-arrow-right-s-line span_icon"></span></li>
            <li class="li_a"><router-link to=""></router-link></li>
            <li class="li_a"><router-link to=""></router-link></li>
            <li class="li_a" @click="logout" style="font-size: 13px"><a>切换账户</a><span class="iconfont icon-arrow-right-s-line span_icon" style="font-size: 14px"></span></li>
          </ul>
        </div>
        <!--      个性签名desu-->
        <div class="sentence" v-if="isLogin">
          <input class="input_sentence" type="text" v-model="signature" placeholder="与你的每一天都是奇迹" @keydown.enter="input_enter" @focus="input_focus" @blur="input_blur">
        </div>
        <!--  向上缩小-->
        <div class="up" @click="changeShow">
          <i class="iconfont icon-xiangshang"  style="color: #6BCBFF;font-size: 16px"></i>
        </div>
      </div>
      <!--  下拉返回-->
      <div class="down" v-else @click="changeShow">
        <i class="iconfont icon-xiangxia" style="color: white; font-size: 16px"></i>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* 外层壳：高度动画，影响布局，让下方内容跟随上移/下移 */
.nav-shell {
  position: relative;
  transition: height 1s ease;
  overflow: visible;
  z-index: 2;
}
.nav-shell.h64 { height: 64px; }
.nav-shell.h20 { height: 20px; }
.navigator_container,
.down {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
}
.navigator_container{
  display: flex;
  align-items: center;
  width: 100%;
  height:64px;
  background-color:#64CBFF;
  color: white;
  font-size: 15px;
  font-weight: 600;
  user-select: none;
  position: relative;

  /* 高度收缩时不露出内容 */
}
.logo{
  margin-left: 78px;
  display: flex;
  align-items: center;
}
.nav{
  display: flex;
  align-items: center;
  margin-left: 20px;
}
.nav li{
  margin-left: 40px;
}

.momotalk{
  width: 32px;
  height: 32px;
  flex-shrink: 0; /* 防止被挤成椭圆 */
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center; /* 建议加上，保证图片居中 */
  border-radius: 50%;
  user-select: none;
  cursor: pointer;
}
.momotalk_numbers{
  display: inline-block;
  height: 20px;
  text-align: center;
  line-height: 20px;
  position: absolute;
  top: -7px;
  left: 28px;
  color: red;
  font-size: 13px;
  font-weight: 700;
  z-index: 200;
}
.momotalk:hover{
  cursor: pointer;
}
/* 头像上传 */
.profile_wrapper{
  position: relative;
  z-index: 10;
  margin-left: 520px;
  display: inline-block;
}
.no-login:hover .profile {
  transform: none !important; /* 禁用头像放大 */
}
.profile{
  position: relative;
  z-index: 10;
  width: 50px;
  height: 50px;
  border: 1px solid white;
  border-radius: 50%;
  transition: all .8s ease;
  background-size: cover;       /* 或 'contain' 视需求 */
  background-position: center;
  background-repeat: no-repeat;
}
.profile:hover{
    cursor: pointer;
}
/*头像悬浮时可以放大并且显示下拉表*/
.profile_wrapper:hover .profile{
  transform:translate(-22px,22px) scale(1.75);
}
.content{
  display: flex;
  flex-direction: column;      /* 垂直排列 li */
  align-items: center;         /* 交叉轴(水平)居中每个 li */
  width: 220px;
  height: 240px;
  position: absolute;
  background-color: #f1f2f5;
  border-radius: 12px;
  opacity: 0;
  left: -104px;
  top: 70px;
  visibility: hidden;
  font-size: 14px;
  transition: opacity .8s ease;
  padding: 30px 10px 20px 10px;
}
.user_name{
  color: #696969;
  margin-bottom: 5px;
}
.user_id{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  color: #696969;
  font-size: 12px;
  margin-bottom: 5px;
  position: relative;
}
.user_id:hover{
  cursor: pointer;
  color: #6BCBFF;
}


.li_a{
  margin-left: 8px;
  margin-top: 12px;
  letter-spacing: 1px;
  color: #696969;
}
.li_icon::before{
  font-size: 20px;
  display: inline-block;
  transform: translate(-1px,1px);
}
.span_icon{
  display: inline-block;
  font-size: 18px;
  margin-left: 20px;
}
.content .li_a:hover{
  color: #64CBFF;
  cursor: pointer;
}
.profile_wrapper:hover .content, .content:hover {
  visibility: visible;
  opacity: 0.8;
}

/* 个性签名 */
.sentence{
  margin-left: 20px;
}
.input_sentence{
  background: transparent;  /* 背景透明 */
  border: none;             /* 去边框 */
  outline: none;            /* 去焦点外框 */
  caret-color: #fff;        /* 光标颜色 */
  color: white;
  font-size: 14px;
  height: 26px;
  font-weight: 600;
  padding: 3px 6px;         /* 基本内边距，按需调 */
  width: 180px;             /* 宽度按需 */
}
.input_sentence:focus {
  background-color: rgba(255,255,255,.35); /* 半透明白 */
}
.input_sentence::placeholder {       /*::placeholder 选中并样式化输入框里显示的占位文字*/
  font-weight: inherit;        /* 占位符使用与 input 相同的粗细 */
  color: rgba(255,255,255,1);
}

/* 缩放框 */
.up{
  width: 30px;
  height: 14px;
  margin: 0 auto;
  line-height: 14px;
  text-align: center;
  user-select: none;
  position: absolute;
  top: 100%;
  left:730px;
  z-index: 9999;
}
.up:hover,.down:hover{
  cursor: pointer;
}

/*下拉框*/
.down{
  width: 100%;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #64CBFF;
  z-index: 9999;
}

/*向上跳动动画效果*/
.nav_link{
  display: inline-block;
}
@keyframes nav-jumping {
  0%   { transform: translateY(0); }
  25%  { transform: translateY(-5px); }
  55%  { transform: translateY(2px); }
  100% { transform: translateY(0); }
}
.nav-jumping{
  animation: nav-jumping 0.9s ease;
}

/*缩小和下拉的具体过渡效果*/
@keyframes up-leave {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-70px); } /* 与实际高度一致 */
}
.up-leave-active { animation: up-leave 1s ease; }
@keyframes up-enter {
  0%   { transform: translateY(-70px); }
  100% { transform: translateY(0); }
}
.up-enter-active { animation: up-enter 1s ease; }



</style>