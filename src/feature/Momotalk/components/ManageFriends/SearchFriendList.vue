<script setup>

import SearchFriend from "@/feature/Momotalk/components/ManageFriends/SearchFriend.vue";
import SearchFriendItem from "@/feature/Momotalk/components/ManageFriends/SearchFriendItem.vue";

const props=defineProps({
  searchFriendList:Array
})
</script>

<template>
  <div class="search_result_container">
    <div class="search_result font_color font_small_size"><span class="iconfont icon-sousuo4" style="margin-right: 2px;font-size: 14px" ></span>0个搜索结果</div>
    <div class="search_result_list">
      <SearchFriendItem
        v-for="item in searchFriendList"
        :id="item.id"
        :name="item.username"
      ></SearchFriendItem>
    </div>
  </div>
</template>

<style scoped>
.search_result_container{
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 6px 8px;
  flex: 1;       /* 新增：占据父容器剩余高度 */
  min-height: 0;
}
.search_result{
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.search_result_list{
  width: 100%;
  flex: 1;                 /* 新增：占据容器剩余高度，从而启用滚动 */
  overflow-y: auto;
}
.search_result_list::-webkit-scrollbar {
  display: none;                /* 隐藏滚动条轨道 */
}
</style>