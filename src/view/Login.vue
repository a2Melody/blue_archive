<script setup lang="ts">
import Navigator_ing from "@/components/Navigator_ing.vue";
import Footer from "@/components/Footer.vue";
import Login_bg from "@/components/Login_bg.vue";
import LoginCompIng from "@/components/Login_comp_ing.vue";

import imageUrl_alice from "@/assets/images/alice_bg.jpg"

</script>

<template>
  <Navigator_ing></Navigator_ing>
  <Login_bg :bg="imageUrl_alice" :bg-pos="'100% center'" :comp="LoginCompIng"></Login_bg>
  <Footer></Footer>
</template>

<style scoped>

</style>