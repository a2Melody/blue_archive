<script setup lang="js">
import sweets from "../assets/images/sweets.svg";
import 'animate.css';
import {ref} from "vue"

const signature=ref('');
const show=ref(true);

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
function jump(e){
  const el=e.currentTarget;
  if(!el) return;
  void el.offsetWidth;
  el.classList.add("nav-jumping");
  const clean = () => { el.classList.remove("nav-jumping"); };
  el.addEventListener("animationend", clean, { once: true });   //动画结束后调用clean函数，并且触发一次事件后自动删除监听器
}
</script>

<template>
    <transition name="">
      <div class="navigator_container" v-show="show">
        <!--      logo-->
        <div class="logo">
          <img :src="sweets" width="30px" height="27px" alt="logo">
          <span>放学甜点部</span>
        </div>
        <!--      RouterLink-->
        <ul class="nav">
          <li><RouterLink to="" class="nav_link" @mouseenter="jump">日记</RouterLink></li>
          <li><RouterLink to="" class="nav_link" @mouseenter="jump">收藏</RouterLink></li>
          <li><RouterLink to="" class="nav_link" @mouseenter="jump">旅途ing</RouterLink></li>
          <li><RouterLink to="" class="nav_link" @mouseenter="jump">测试ing</RouterLink></li>
        </ul>
        <!--      头像 profile photo-->
        <div class="profile">
        </div>
        <!--      个性签名desu-->
        <div class="sentence">
          <input class="input_sentence" type="text" v-model="signature" placeholder="与你的每一天都是奇迹" @keydown.enter="input_enter" @focus="input_focus" @blur="input_blur">
        </div>

        <!--  向上缩小-->
        <div class="up" @click="changeShow">
          <i class="iconfont icon-xiangshang"  style="color: #6BCBFF;font-size: 16px"></i>
        </div>
      </div>
    </transition>

<!--  下拉返回-->
     <transition name="">
       <div class="down" v-show="!show" @click="changeShow">
         <i class="iconfont icon-xiangxia" style="color: white; font-size: 16px"></i>
       </div>
     </transition>
</template>

<style scoped>
.navigator_container{
  display: flex;
  align-items: center;
  width: 100%;
  height:64px;
  background-color: #6BCBFF;
  color: white;
  font-size: 15px;
  font-weight: 600;
  user-select: none;
  position: relative;
}
.logo{
  margin-left: 78px;
  display: flex;
  align-items: center;
}
.nav{
  display: flex;
  align-items: center;
}
.nav li{
  margin-left: 60px;
}

/* 头像上传 */
.profile{
  margin-left: 461px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-image: url("../assets/images/profile2.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position:  center;
}

/* 个性签名 */
.sentence{
  margin-left: 30px;
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
  left:50%;
  transform:translateX(-50%);
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
  background-color: #6BCBFF;
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

</style>