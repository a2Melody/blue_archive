<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/Background_image.vue";

import imageUrl_shiroko from "@/assets/images/shiroko_bg.jpg";
import RegisterComp from "@/components/Register_comp.vue";
</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="imageUrl_shiroko" :comp="RegisterComp"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>