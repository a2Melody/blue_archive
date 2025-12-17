<script setup>
import LoginView from "@/view/LoginView.vue";
import RegisterView from "@/view/RegisterView.vue";
import LazyingView from "@/view/LazyingView.vue";
import CroppingProfileView from "@/view/CroppingProfileView.vue";
import DiaryWritingView from "@/view/DiaryWritingView.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";
import FirstFoldersView from "@/view/FirstFoldersView.vue";
import CollectionsView from "@/view/CollectionsView.vue";
import AddFirstFolderView from "@/view/AddFirstFolderView.vue";
import AddCollectionView from "@/view/AddCollectionView.vue";
import DiaryShowView from "@/view/DiaryShowView.vue";

</script>

<template>
  <FirstFoldersView></FirstFoldersView>
  <div style="margin-top: 40px"></div>
  <DiaryShowView></DiaryShowView>
  <div style="margin-top: 40px"></div>
  <AddCollectionView></AddCollectionView>
  <div style="margin-top: 40px"></div>
  <AddFirstFolderView></AddFirstFolderView>
  <div style="margin-top: 40px"></div>
  <CollectionsView></CollectionsView>
  <div style="margin-top: 40px"></div>
  <DiaryWritingView></DiaryWritingView>
  <div style="margin-top: 40px"></div>
  <CroppingProfileView></CroppingProfileView>
  <div style="margin-top: 40px"></div>
  <LazyingView></LazyingView>
  <div style="margin-top: 40px"></div>
  <RegisterView></RegisterView>
  <div style="margin-top: 40px"></div>
  <LoginView></LoginView>

</template>

<style scoped>

</style>
