<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/Background_image.vue";
import LoginComp from "@/components/Login_comp.vue";

import imageUrl_alice from "@/assets/images/alice_bg.jpg"

</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="imageUrl_alice" :bg-pos="'100% center'" :comp="LoginComp"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>