<script setup lang="js">
import Navigator from "@/common/components/Navigator.vue";
import Footer from "@/common/components/Footer.vue";
import BackgroundImage from "@/common/components/BackgroundImage.vue";
import Login from "@/feature/Login/components/Login.vue";

import imageUrl_alice from "@/assets/images/alice_bg.jpg"


</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="imageUrl_alice" :bg-pos="'100% center'" :comp="Login"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>