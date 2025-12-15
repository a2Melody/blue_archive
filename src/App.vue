<script setup>
import LoginView from "@/view/LoginView.vue";
import RegisterView from "@/view/RegisterView.vue";
import LazyingView from "@/view/LazyingView.vue";
import CroppingProfileView from "@/view/CroppingProfileView.vue";
import DiaryWritingView from "@/view/DiaryWritingView.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";

import Test from "@/test/Test.vue"
import FirstFoldersView from "@/view/FirstFoldersView.vue";

</script>

<template>
<!--  <Test></Test>-->
  <FirstFoldersView></FirstFoldersView>
  <Add></Add>
  <Delete></Delete>
  <div style="margin-top: 40px"></div>
  <DiaryWritingView></DiaryWritingView>
  <div style="margin-top: 40px"></div>
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
