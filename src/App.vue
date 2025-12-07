<script setup>
import LoginView from "@/view/Login_view.vue";
import RegisterView from "@/view/Register_view.vue";
import Developing_view from "@/view/Developing_view.vue";

import AvatarUploader from "@/test/AvatarUploader.vue";
import Test from "@/test/Test.vue";
import Cropping_view from "@/view/Cropping_view.vue";
import Cropper_profile_comp from "@/components/Cropper_profile_comp.vue";
</script>

<template>
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
