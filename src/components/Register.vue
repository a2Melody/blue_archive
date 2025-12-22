<script setup lang="js">
import {ref,computed} from "vue";
import axios from "axios";
import {useRouter} from "vue-router";

const router=useRouter();
/*控制错误信息的显示与否*/
const user_warning=ref(false);
const pwd_warning=ref(false);
/*v-model的值*/
const user_name=ref('');
const email=ref('');
const pwd=ref('');
const pwd_twice=ref('');
const isPwdMatch = computed(()=>pwd.value===pwd_twice.value);
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
/*标签的引用*/
const user_name_input=ref(null);
const email_input=ref(null);
const pwd_input=ref(null);
const pwd_twice_input=ref(null);
const register_btn=ref(null);

function email_focus(){
  email_input.value.focus();
}
function pwd_focus(){
  pwd_input.value.focus();
}
function pwd_twice_focus(){
  pwd_twice_input.value.focus();
}
function button_focus(){
  register_btn.value.focus();
}

async function submit() {
  if (!isPwdMatch.value||!isEmailValid) {
    return;
  }
  try {
    const res = await axios.post('/api/user/register',{
      username:user_name,
      password: pwd,
      confirmPassword: pwd_twice,
      email: email
    });
    console.log('后端返回：', res.data);
    await router.push('/');
  } catch (err) {
    console.error('请求出错：', err);
  }
}


</script>

<template>
<!--Register为注册组件-->
<div class="register_container">

  <div class="top_container">
    <span class="register_words">注册</span>
    <span class="return_login"><router-link to="/">返回登录</router-link></span>
  </div>

  <div class="middle_input_container" style="margin-top: 15px">
<!--    用户名字输入-->
    <div class="input_area_container">
      <span class="icon iconfont icon-yun1" style="font-size: 18px;margin-top: 5px"></span>
      <input class="input" v-model="user_name" ref="user_name_input" type="text" placeholder="请输入用户名" @keydown.enter="email_focus">
    </div>
    <div class="warning iconfont icon-gantanhaozhong" :style="{visibility:user_warning?'visible':'hidden'}">用户名已经被注册</div>
<!--  邮箱输入-->
    <div class="input_area_container">
      <span class="icon iconfont icon-youxiang1" style="font-size: 26px;font-weight: 500"></span>
      <input class="input" v-model="email" ref="email_input" type="email" placeholder="请输入邮箱" @keydown.enter="pwd_focus">
    </div>
    <div class="warning iconfont icon-gantanhaozhong" :style="{visibility:!isEmailValid?'visible':'hidden'}">邮箱格式错误</div>
<!--密码输入-->
    <div class="input_area_container">
      <span class="icon iconfont icon-key" style="font-size: 25px;font-weight: 600"></span>
      <input class="input" v-model="pwd" ref="pwd_input" type="password" placeholder="请输入密码" @keydown.enter="pwd_twice_focus">
    </div>
    <div class="warning iconfont icon-gantanhaozhong" :style="{visibility:pwd_warning?'visible':'hidden'}">密码至少包含一个大写字母、小写字母和数字</div>
<!--重复密码输入-->
    <div class="input_area_container">
      <span class="icon iconfont icon-key" style="font-size: 25px;font-weight: 600"></span>
      <input class="input" v-model="pwd_twice" ref="pwd_twice_input" type="password" placeholder="请确认密码" @keydown.enter="button_focus">
    </div>
    <div class="warning iconfont icon-gantanhaozhong" :style="{visibility:!isPwdMatch?'visible':'hidden'}">重复输入的密码并不相同</div>
<!--注册按钮-->
    <button ref="register_btn" type="submit" class="register_btn" @click="submit">注册</button>
  </div>
</div>
</template>

<style scoped>
  .register_container{
    position: relative;
    width: 398px;
    height: 480px;
    padding:40px 40px;
    left: 170px;
    top:80px;
    background-color: white;
    opacity: 0.8;
    border-radius: 18px;
  }

  /* 注册这两个字+返回登录*/
  .top_container{
    position: relative;
    width: 270px;
    height: 40px;
    padding-top: 1px;
    padding-left: 14px;
  }
  .register_words{
    width: 132px;
    height: 40px;
    font-size: 20px;
    font-weight: 600;
    user-select: none;
    letter-spacing: 1px;
  }
  .return_login{
    margin-top: 3px;
    margin-left: 150px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  .return_login:hover{
    color: #64CBFF;
  }

  /*  输入框+按钮*/
  .middle_input_container{
    width: 318px;
    height: 320px;
  }
  .input_area_container{
    display: flex;
    align-items: center;
    gap: 6px;
    width: 318px;
    height: 40px;
    border-radius: 7px;
    padding-left: 14px;
    padding-right: 25px;
    user-select: none;
    background-color: transparent;
    border-bottom: 2px solid #ddd;
  }
  .icon{
    height: 22px;
    width: 22px;
    font-size: 18px;
    color: #696969;
    user-select: none;
  }
  .input{
    flex: 1;
    height: 100%;
    border: none;            /* 移除边框 */
    background: transparent;
    outline: none;
    font-size: 14px;
    padding: 0;
    line-height: 1;
    color: #696969;
    font-weight: 600;
    margin-left: 8px;
  }
  .register_btn{
    width: 318px;
    color: white;
    font-size: 16px;
    letter-spacing: 4px;
    font-weight: 600;
    height: 40px;
    margin-top: 35px;
    background-color: #64CBFF;
    border-radius: 6px;
    border: 0;
  }
  .register_btn:focus,.register_btn:hover{
    outline:2px solid #ddd;
  }

/*  格式不正确的显示语句*/
  .warning{
  display: inline-flex;        /* 或 flex，视场景而定 */
  align-items: center;         /* 垂直居中 */
  width: 318px;
  height: 18px;
  font-size: 14px;
  margin-bottom: 1px;
  color: #64CBFF;
  font-weight: 600;
  line-height: 18px;
  margin-left: 5px;
}
  .warning::before{
    font-size: 17px;
    font-weight: 600;
    line-height: 18px;
  }

</style>