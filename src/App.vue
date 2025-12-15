<script setup>
import LoginView from "@/view/LoginView.vue";
import RegisterView from "@/view/RegisterView.vue";
import LazyingView from "@/view/LazyingView.vue";
import CroppingProfileView from "@/view/CroppingProfileView.vue";
import DiaryWritingView from "@/view/DiaryWritingView.vue";
import AddAndDelete from "@/components/colocate/AddAndDelete.vue";

import Test from "@/test/Test.vue"

</script>

<template>
  <AddAndDelete></AddAndDelete>
<!--  <DiaryWritingView></DiaryWritingView>
  <div style="margin-top: 40px"></div>-->
  <CroppingProfileView></CroppingProfileView>
  <div style="margin-top: 40px"></div>
  <LazyingView></LazyingView>
  <div style="margin-top: 40px"></div>
  <RegisterView></RegisterView>
  <div style="margin-top: 40px"></div>
  <LoginView></LoginView>

</template>

<style scoped>

</style>
