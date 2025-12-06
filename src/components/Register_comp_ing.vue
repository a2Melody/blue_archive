<script setup lang="js">
import {ref} from "vue";

const user_name_input=ref(null);
const user_name=ref('');
const user_warning=ref(true);

</script>

<template>
<!--Register为注册组件-->
<div class="register_container">

  <div class="top_container">
    <div class="register_words">注册</div>
  </div>

  <div class="middle_input_container" style="margin-top: 5px">
<!--    用户名字输入-->
    <div class="input_area_container">
      <span class="icon iconfont icon-yun1" style="font-size: 18px"></span>
      <input class="input" v-model="user_name" ref="user_name_input" type="text" placeholder="请输入用户名" @keydown.enter="pwd_focus">
    </div>
    <div class="warning iconfont icon-gantanhaozhong" :style="{visibility:user_warning?'visible':'hidden'}">用户名已经被注册</div>
<!--  邮箱输入-->
    <div class="input_area_container">

    </div>
    <div class="warning iconfont icon-gantanhaozhong">邮箱格式错误</div>
<!--密码输入-->
    <div class="input_area_container">

    </div>
    <div class="warning iconfont icon-gantanhaozhong">密码至少包含一个大写字母、小写字母和数字</div>
<!--重复密码输入-->
    <div class="input_area_container">

    </div>
    <div class="warning iconfont icon-gantanhaozhong">重复输入的密码并不相同</div>
  </div>
</div>
</template>

<style scoped>
  .register_container{
    position: relative;
    width: 430px;
    height: 480px;
    padding:40px 56px;
    left: 170px;
    top:80px;
    background-color: white;
    opacity: 0.8;
    border-radius: 18px;
  }
 /* 注册这两个字+返回登录*/
  .top_container{
    width: 318px;
    height: 40px;
  }
  .register_words{
    width: 132px;
    height: 40px;
    line-height: 40px;
    font-size: 20px;
    font-weight: 600;
    user-select: none;
    letter-spacing: 1px;
  }
  .middle_input_container{
    width: 318px;
    height: 260px;
  }
  /*输入框*/
  .input_area_container{
    display: flex;
    align-items: center;
    gap: 6px;
    width: 318px;
    height: 40px;
    background-color: #ddd;
    border-radius: 4px;
    padding-left: 10px;
    padding-right: 25px;
    user-select: none;
  }
  .icon{
    height: 22px;
    width: 22px;
    font-size: 20px;
    color: #696969;
    user-select: none;
    line-height: 22px;
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


/*  格式不正确的显示语句*/
  .warning{
  display: inline-flex;        /* 或 flex，视场景而定 */
  align-items: center;         /* 垂直居中 */
  width: 318px;
  height: 18px;
  font-size: 14px;
  margin-bottom: 12px;
  color: #6BCBFF;
  font-weight: 600;
  line-height: 18px;
  background-color: #55a532;
}
  .warning::before{
    font-size: 17px;
    font-weight: 600;
    line-height: 18px;
  }



</style>