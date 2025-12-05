<script setup lang="js">
import {ref} from "vue";

const user=ref('');

</script>

<template>
<!--Login为登录组件-->
<div class="login_container">
  <div class="login_words">登录</div>
  <div class="out_input_container">
    <div class="login_warning iconfont icon-gantanhaozhong" >用户名或者密码错误</div>

    <div class="input_area_container" style="margin-bottom: 15px;margin-top: 5px;">

    </div>

    <div class="input_area_container">

    </div>

    <button class="login_submit">登录</button>
  </div>

  <div class="footer">
    <div class="forget_pwd"><RouterLink to="">忘记密码</RouterLink></div>
    <div class="to_register"><RouterLink to="">立即注册</RouterLink></div>
  </div>
</div>
</template>

<style scoped>
.login_container{
  position: relative;
  left: 910px;
  top: 100px;
  width: 430px;
  height: 408px;
  background-color: white;
  opacity:0.8;
  padding:40px 56px;
  font-weight: 500;
  border-radius: 18px;
}
.login_words{
  width: 132px;
  height: 40px;
  line-height: 40px;
  font-size: 20px;
  font-weight: 600;
  user-select: none;
  letter-spacing: 1px;
}
.out_input_container{
  width: 318px;
  height: 260px;
}
.login_warning{
  display: inline-flex;        /* 或 flex，视场景而定 */
  align-items: center;         /* 垂直居中 */
  width: 160px;
  height: 18px;
  font-size: 14px;
  margin-top: 16px;
  color: #6BCBFF;
  font-weight: 600;
  line-height: 18px;
}
.login_warning::before{
  font-size: 17px;
  font-weight: 600;
  line-height: 18px;
}

/*输入框和按钮*/
.input_area_container{
  width: 318px;
  height: 40px;
  background-color: #ddd;
}
.login_submit{
  width: 318px;
  color: white;
  font-size: 16px;
  letter-spacing: 4px;
  font-weight: 600;
  height: 40px;
  margin-top: 40px;
  background-color: #6BCBFF;
  border-radius: 6px;
  border: 0;
}

/*最下面的忘记密码和立即注册*/
.footer{
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
  color: #6BCBFF;
}
</style>