<script setup>
import FirstFolder from "@/components/colocate/FirstFolder.vue";
import Navigator from "@/components/Navigator.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";

import profile from "@/assets/images/profile_test.jpg"
import xia from "@/assets/images/夏.png"
import zhanfushaonu from "@/assets/images/zhanfushaonu.png"
import arona from "@/assets/images/arona.png"
import zhigengniao from "@/assets/images/知更鸟2.jpg"

</script>

<template>
  <div class="body_container">
    <Add></Add>
    <Delete></Delete>
    <Navigator></Navigator>

    <div class="grid_container">
      <FirstFolder :row="2" :col="1" :left="100" :bg="zhanfushaonu"></FirstFolder>
      <FirstFolder :row="1" :col="2" :bg="xia"></FirstFolder>
      <FirstFolder :row="2" :col="3" :bg="profile"></FirstFolder>
      <FirstFolder :row="1" :col="4" :bg="arona"></FirstFolder>
      <FirstFolder :row="2" :col="5" :bg="zhigengniao"></FirstFolder>
    </div>

  </div>
</template>

<style scoped>
  .body_container{
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: #E0EAFC;  /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);  /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, #CFDEF3, #E0EAFC); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }
  .grid_container{
    display: grid;
    grid-auto-flow: column;
    padding-bottom: 16px;
    padding-right: 150px;
    grid-template-rows: repeat(2, 320px);
    grid-auto-columns: 450px;
    place-items: center;
    overflow-x: auto;
  }

</style>