<script setup>
import axios from "axios";
import {onMounted} from "vue";


async function pingBackend()
{
  try {
    const response = await axios.post('/api/chat/messages/private/getMessage', {
      // 这里放置你要发送的 POST 数据，如果没有可以传空对象 {}
      friendId:'6',
      page:'0'
    });

    console.log('返回数据:', response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
}

onMounted(()=>{
  pingBackend();
})
</script>

<template>
</template>

<style scoped>


</style>