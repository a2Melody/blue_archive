<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/BackgroundImage.vue";
import Toulan from "@/components/colocate/Toulan.vue";

import rabbit from "@/assets/images/rabbit.jpg"
</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="rabbit" :bg-pos="'center 0'" :comp="Toulan"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>