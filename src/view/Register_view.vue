<script setup lang="ts">
import Navigator_ing from "@/components/Navigator_ing.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/Background_image.vue";

import imageUrl_shiroko from "@/assets/images/shiroko_bg.jpg";
import Register_comp_ing from "@/components/Register_comp_ing.vue";
</script>

<template>
  <Navigator_ing></Navigator_ing>
  <BackgroundImage :bg="imageUrl_shiroko" :comp="Register_comp_ing"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>