<script setup lang="ts">
import Navigator_ing from "@/components/Navigator_ing.vue";
import Footer from "@/components/Footer.vue";
import Login_bg from "@/components/Login_bg.vue";

import imageUrl_shiroko from "@/assets/images/shiroko_bg.jpg";
import Register_comp_ing from "@/components/Register_comp_ing.vue";
</script>

<template>
  <Navigator_ing></Navigator_ing>
  <Login_bg :bg="imageUrl_shiroko" :comp="Register_comp_ing"></Login_bg>
  <Footer></Footer>
</template>

<style scoped>

</style>