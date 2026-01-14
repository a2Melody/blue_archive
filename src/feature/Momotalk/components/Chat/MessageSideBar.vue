<script setup>
import SearchBox from "@/feature/Momotalk/components/Chat/SearchBox.vue";
import FriendList from "@/feature/Momotalk/components/Chat/FriendList.vue";
import { ref } from "vue";

const searchText = ref('');
</script>

<template>
  <div class="sidebar">
    <SearchBox v-model:search="searchText" />
    <FriendList :search-text="searchText" />
  </div>
</template>

<style scoped>
.sidebar{
  display: flex;
  flex-direction: column;
  width: 255px;
  height: 100%;
  border-right: 1px solid rgba(255, 179, 217, 0.3);
}
</style>