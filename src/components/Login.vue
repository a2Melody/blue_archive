<script setup lang="js">
import {ref} from "vue";
import axios from 'axios';
import {useRouter} from "vue-router";
import { userStore } from '@/stores/UserStore.js'

const router = useRouter();
const user=userStore();

/*控制错误信息的显示与否*/
const warning_show=ref(false);
/*标签的引用*/
const pwd_input=ref(null);
const login_button=ref(null);
/*v-model的值*/
const pwd=ref('');
const user_name=ref('');


function pwd_focus(){
  pwd_input.value.focus();
}
function button_focus(){
  login_button.value.focus();
}

async function submit() {
  try {
    const res = await axios.post('/api/user/login', {
      usernameOrEmail: user_name.value,
      password: pwd.value
    });
    const responseData = res.data;
    console.log(responseData);
    // 2. 获取嵌套在里面的 data 对象
    if (responseData.isSuccess) {
      const userInfo = responseData.data;
      console.log(userInfo.id,userInfo.username,userInfo.userAvatarUrl)
      user.setUser(userInfo.id,userInfo.username,userInfo.userAvatarUrl)

      const newAccess = res.headers.get("New-Access-Token");
      console.log(newAccess);
      if (newAccess) {
        user.setToken(newAccess);
        console.log(user.getToken());
      }
      await router.push('/test');
    } else {
      // 处理业务逻辑错误（如密码错误）
      console.warn('登录失败：', responseData.message);
    }
  } catch (err) {
    warning_show.value = true;
    console.error('网络或服务器出错：', err);
  }
}
</script>

<template>
<!--Login为登录组件-->
<div class="login_container">
  <div class="login_words">登录</div>
  <div class="middle_input_container">
    <div class="login_warning iconfont icon-gantanhaozhong" :style="{visibility:warning_show?'visible':'hidden'}">用户名或者密码错误</div>

    <div class="input_area_container" style="margin-bottom: 15px">
        <span class="icon iconfont icon-yun1"></span>
        <input class="input" v-model="user_name" ref="user_name_input" type="text" placeholder="请输入用户名" @keydown.enter="pwd_focus">
    </div>

    <div class="input_area_container">
      <span class="icon iconfont icon-key" style="font-size: 25px;font-weight: 600"></span>
      <input class="input" v-model="pwd" ref="pwd_input" type="password" placeholder="请输入密码" @keydown.enter="button_focus">
    </div>

    <button class="login_submit" ref="login_button" type="submit" @click="submit">登录</button>
  </div>
  <!--    最下面的忘记密码和立即注册-->
  <div class="footer_a">
    <div class="forget_pwd"><RouterLink to="">忘记密码</RouterLink></div>
    <div class="to_register"><RouterLink to="/register">立即注册</RouterLink></div>
  </div>
</div>
</template>

<style scoped>
.login_container{
  position: relative;
  left: 920px;
  top: 130px;
  width: 398px;
  height: 380px;
  background-color: white;
  opacity:0.8;
  padding:45px 40px 30px 40px;
  font-weight: 500;
  border-radius: 18px;
}
.login_words{
  width: 132px;
  height: 30px;
  padding-left: 10px;
  line-height: 30px;
  font-size: 20px;
  font-weight: 600;
  user-select: none;
  letter-spacing: 1px;
}
.middle_input_container{
  width: 318px;
  height: 250px;
}
.login_warning{
  display: inline-flex;        /* 或 flex，视场景而定 */
  align-items: center;         /* 垂直居中 */
  width: 160px;
  height: 18px;
  font-size: 14px;
  margin-top: 10px;
  color: #64CBFF;
  font-weight: 600;
  line-height: 18px;
}
.login_warning::before{
  font-size: 17px;
  font-weight: 600;
  line-height: 18px;
}

/*输入框*/
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
  font-size: 20px;
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

/*登录按钮*/
.login_submit{
  width: 318px;
  color: white;
  font-size: 16px;
  letter-spacing: 4px;
  font-weight: 600;
  height: 40px;
  margin-top: 40px;
  background-color: #64CBFF;
  border-radius: 6px;
  border: 0;
}
.login_submit:focus,.login_submit:hover{
  outline:2px solid #ddd;
}

/*最下面的忘记密码和立即注册*/
.footer_a{
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.forget_pwd{
  float: left;
  margin-left: 192px;
}
.to_register{
  float: right;
  margin-left: 10px;
}
.forget_pwd:hover,.to_register:hover{
  color: #64CBFF;
}


</style>