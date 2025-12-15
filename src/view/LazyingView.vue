<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/BackgroundImage.vue";

import rabbit from "@/assets/images/rabbit.jpg"

import { defineComponent, h } from 'vue';
const InlineContent = defineComponent({
  name: 'InlineContent',
  setup() {
    return () => h('span', {
      style: 'display:inline-block;position:relative;color:white;font-size:18px;font-weight:600;left:50%;transform:translateX(-50%);top:50px;opacity:0.9;user-select:none'
    }, '前端在睡觉偷懒');
  }
});
</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="rabbit" :bg-pos="'center 0'" :comp="InlineContent"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>