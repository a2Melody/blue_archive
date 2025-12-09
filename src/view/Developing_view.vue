<script setup lang="js">
import NavigatorComp from "@/components/Navigator_comp.vue";
import FooterComp from "@/components/Footer_comp.vue";
import BackgroundImageComp from "@/components/Background_image_comp.vue";
import Toulan from "@/components/small_components/Toulan.vue";

import rabbit from "@/assets/images/rabbit.jpg"
</script>

<template>
  <NavigatorComp></NavigatorComp>
  <BackgroundImageComp :bg="rabbit" :bg-pos="'center 0'" :comp="Toulan"></BackgroundImageComp>
  <FooterComp></FooterComp>
</template>

<style scoped>

</style>