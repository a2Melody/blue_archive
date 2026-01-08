<script setup>
import { ref } from "vue";
import Header from "@/feature/Momotalk/components/ManageFriends/Header.vue";
import SearchFriend from "@/feature/Momotalk/components/ManageFriends/SearchFriend.vue";
import AgreeFriend from "@/feature/Momotalk/components/ManageFriends/AgreeFriend.vue";

const emit=defineEmits(['close']);
const activeTab = ref("search"); // 默认显示接收的申请
</script>

<template>
  <div class="firstphone_container">
    <Header :active="activeTab" @select="activeTab = $event" @exit="emit('close')"></Header>
    <SearchFriend v-if="activeTab === 'search'"></SearchFriend>
    <AgreeFriend v-else></AgreeFriend>
  </div>
</template>

<style scoped>
.firstphone_container{
  display: flex;
  flex-direction: column;
  width: 26vw;
  height: 80vh;
  position: absolute;
  top: 5vh;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 10px;
  z-index: 3000;
  background-color: white;
}
</style>