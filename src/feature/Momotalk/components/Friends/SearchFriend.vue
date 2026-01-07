<script setup>

import SearchFriendList from "@/feature/Momotalk/components/Friends/SearchFriendList.vue";
</script>

<template>
  <div class="search_container">
    <div class="search_input f">
      <input  type="text" maxlength="16" placeholder="请输入uid">
      <span class="iconfont icon-sousuo4 search_icon"></span>
    </div>
    <SearchFriendList></SearchFriendList>
  </div>
</template>

<style scoped>
.search_container{
  display: flex;
  flex-direction: column;
  width: 100%;
  /* remove: height: 100%; */
  flex: 1;
  min-height: 0;         /* 新增：允许在 flex 容器中收缩，从而启用内部滚动 */
  border-radius: 10px;
  padding: 10px 20px;
}
.search_input{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 45px;
  padding-bottom: 6px;
  border-bottom: 1px solid 	#DCDCDC;
}
.search_input input{
  width: 76%;
  height: 70%;
  border-radius: 4px;
  padding: 10px 10px;
  background-color: #f3f3f3;
}
.search_input input::placeholder{
  color:#696969;;
}
.search_icon{
  font-size: 20px;
  margin-left: 4px;
  color: #b8b6b6;
}
.search_icon:hover{
  cursor: pointer;
}
</style>