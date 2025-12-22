<script setup lang="js">
import Navigator from "@/components/Navigator.vue";
import Footer from "@/components/Footer.vue";
import BackgroundImage from "@/components/BackgroundImage.vue";
import Login from "@/components/Login.vue";

import imageUrl_alice from "@/assets/images/alice_bg.jpg"
import {onMounted} from "vue";
import axios from "axios";
import {userStore} from "@/stores/UserStore.js";

const user=userStore();
onMounted(async () => {
  try {
    const res = await axios.post('/api/user/logout');
    console.log('后端返回：', res.data);
    user.setUser(null, null, null);
  } catch (err) {
    console.error('请求出错：', err);
  }
})
</script>

<template>
  <Navigator></Navigator>
  <BackgroundImage :bg="imageUrl_alice" :bg-pos="'100% center'" :comp="Login"></BackgroundImage>
  <Footer></Footer>
</template>

<style scoped>

</style>