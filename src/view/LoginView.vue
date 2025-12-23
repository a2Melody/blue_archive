<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/BackgroundImage.vue";
import Login from "@/components/Login.vue";

import imageUrl_alice from "@/assets/images/alice_bg.jpg"


</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="imageUrl_alice" :bg-pos="'100% center'" :comp="Login"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>