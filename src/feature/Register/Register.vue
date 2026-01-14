<script setup lang="js">
import Navigator from "@/common/components/Navigator.vue";
import Footer from "@/common/components/Footer.vue";
import BackgroundImage from "@/common/components/BackgroundImage.vue";

import imageUrl_shiroko from "@/assets/images/shiroko_bg.jpg";
import Register from "@/feature/Register/components/Register.vue";
</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="imageUrl_shiroko" :comp="Register"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>