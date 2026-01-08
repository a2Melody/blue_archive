<script setup>
import axios from "axios";


async function pingBackend()
{
  try {
    const response = await axios.post('https://192.168.1.5:8443/api/user/ping1', {
      // 这里放置你要发送的 POST 数据，如果没有可以传空对象 {}
      message: 'hello'
    });

    console.log('返回数据:', response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
}

</script>

<template>
  <Momotalk></Momotalk>
</template>

<style scoped>


</style>