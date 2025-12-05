<script setup lang="ts">

</script>

<template>
<!--Register为注册组件-->
<div class="register_container">
  <div class="register_words">注册</div>
  <div class="out_input_container">
    <div class="input_area_container">

    </div>

    <div class="input_area_container">

    </div>
    <div class="warning iconfont icon-gantanhaozhong">邮箱格式错误</div>

    <div class="input_area_container">

    </div>
    <div class="warning iconfont icon-gantanhaozhong">密码至少包含一个大写字母、小写字母和数字</div>

    <div class="input_area_container">

    </div>
    <div class="warning iconfont icon-gantanhaozhong">重复输入的密码并不相同</div>
  </div>
</div>
</template>

<style scoped>
  .register_container{
    position: relative;
    width: 440px;
    height: 478px;
    padding:40px 56px;
    left: 170px;
    top:80px;
    background-color: white;
    opacity: 0.8;
    border-radius: 18px;
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
  .out_input_container{
    width: 318px;
    height: 320px;
    background-color: pink;
  }
  .input_area_container{
    width: 318px;
    height: 40px;
    background-color: #ddd;
  }
  .warning{
  display: inline-flex;        /* 或 flex，视场景而定 */
  align-items: center;         /* 垂直居中 */
  width: 318px;
  height: 18px;
  font-size: 14px;
  margin-top: 16px;
  color: #6BCBFF;
  font-weight: 600;
  line-height: 18px;
}
  .warning::before{
    font-size: 17px;
    font-weight: 600;
    line-height: 18px;
  }
</style>