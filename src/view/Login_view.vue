<script setup lang="js">
import NavigatorComp from "@/components/Navigator_comp.vue";
import FooterComp from "@/components/Footer_comp.vue";
import BackgroundImageComp from "@/components/Background_image_comp.vue";
import LoginComp from "@/components/Login_comp.vue";

import imageUrl_alice from "@/assets/images/alice_bg.jpg"

</script>

<template>
  <NavigatorComp></NavigatorComp>
  <BackgroundImageComp :bg="imageUrl_alice" :bg-pos="'100% center'" :comp="LoginComp"></BackgroundImageComp>
  <FooterComp></FooterComp>
</template>

<style scoped>

</style>