<script setup lang="js">
import NavigatorComp from "@/components/Navigator_comp.vue";
import FooterComp from "@/components/Footer_comp.vue";
import BackgroundImageComp from "@/components/Background_image_comp.vue";

import imageUrl_shiroko from "@/assets/images/shiroko_bg.jpg";
import RegisterComp from "@/components/Register_comp.vue";
</script>

<template>
  <NavigatorComp></NavigatorComp>
  <BackgroundImageComp :bg="imageUrl_shiroko" :comp="RegisterComp"></BackgroundImageComp>
  <FooterComp></FooterComp>
</template>

<style scoped>

</style>