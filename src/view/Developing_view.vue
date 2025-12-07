<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import Background_image from "@/components/Background_image.vue";
import Toulan from "@/components/small_components/Toulan.vue";

import rabbit from "@/assets/images/rabbit.jpg"
</script>

<template>
  <Navigator></Navigator>
  <Background_image :bg="rabbit" :bg-pos="'center 0'" :comp="Toulan"></Background_image>
  <Footer></Footer>
</template>

<style scoped>

</style>