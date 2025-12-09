<script setup>
import LoginView from "@/view/Login_view.vue";
import RegisterView from "@/view/Register_view.vue";
import Developing_view from "@/view/Developing_view.vue";
import Cropping_view from "@/view/Cropping_view.vue";
import Diary_writing_view from "@/view/Diary_writing_view.vue";
import JiaJian from "@/components/small_components/Jia_Jian.vue";

</script>

<template>
  <JiaJian></JiaJian>
  <Diary_writing_view></Diary_writing_view>
  <div style="margin-top: 40px"></div>
  <Cropping_view></Cropping_view>
  <div style="margin-top: 40px"></div>
  <Developing_view></Developing_view>
  <div style="margin-top: 40px"></div>
  <RegisterView></RegisterView>
  <div style="margin-top: 40px"></div>
  <LoginView></LoginView>

</template>

<style scoped>

</style>
