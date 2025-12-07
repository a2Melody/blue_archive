<script setup lang="js">
import Navigator_ing from "@/components/Navigator_ing.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/Background_image.vue";
import LoginCompIng from "@/components/Login_comp_ing.vue";

import imageUrl_alice from "@/assets/images/alice_bg.jpg"

</script>

<template>
  <Navigator_ing></Navigator_ing>
  <BackgroundImage :bg="imageUrl_alice" :bg-pos="'100% center'" :comp="LoginCompIng"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>