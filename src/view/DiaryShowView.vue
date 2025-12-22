<script setup>
import {onMounted, ref} from "vue";
import Navigator from "@/components/Navigator.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";
import DiaryLi from "@/components/colocate/DiaryLi.vue";
import {useRouter} from "vue-router";

const router=useRouter();
const content=ref('');



</script>

<template>
  <Navigator></Navigator>

  <div class="body_container">
    <Add @click="router.push('/diaryWriting')"></Add>
    <Delete></Delete>
    <div class="diary_container">
      <DiaryLi title="日记_name_test1" :date="'2025-12-17'"></DiaryLi>
      <DiaryLi title="日记_name_test2" :date="'2025-12-17'"></DiaryLi>
    </div>

    <div class="content_container" v-show="!(content==='')">{{content}}</div>
  </div>
</template>

<style scoped>
.body_container{
  width: 100%;
  min-height: 100vh;
  background: #E0EAFC;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #CFDEF3, #E0EAFC); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  padding: 60px 150px 150px 150px;

  position: relative;
  user-select: none;
}
.diary_container{
  float: left;
  width: 500px;
  height: auto;
/*  background-color: pink;*/
}
.content_container{
  float: left;
  width: 540px;
  height: 500px;
  margin-left: 100px;
  padding: 20px;
  background-color: pink;
}
</style>