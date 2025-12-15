<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/BackgroundImage.vue";

import imageUrl_shiroko from "@/assets/images/shiroko_bg.jpg";
import Register from "@/components/Register.vue";
</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="imageUrl_shiroko" :comp="Register"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>