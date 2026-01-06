<script setup>
import ManageList from "@/feature/Momotalk/components/FriendsManage/ManageList.vue";
import AddFriend from "@/feature/Momotalk/components/FriendsManage/AddFriend.vue";

</script>

<template>
  <div class="friendsmanage_container">
    <div class="left">
      <ManageList></ManageList>
    </div>
    <div class="right">
      <AddFriend></AddFriend>
    </div>
  </div>
</template>

<style scoped>
.friendsmanage_container{
  display: flex;
  width: 100%;
  height: calc(100vh - 64px);
  padding: 40px 230px;
}
.left {
  width: 200px;
  height: 300px;

}
.right{
  width: 800px;
  height: 500px;
  margin-left: 40px;
  background-color: pink;
  border-radius: 5px;
}
</style>