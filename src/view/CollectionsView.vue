<script setup>
import {ref} from "vue";

import Navigator from "@/components/Navigator.vue";
import Collection from "@/components/colocate/Collection.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";

import xia from "@/assets/images/夏.png";
import shiroko from "@/assets/images/shiroko.png";
import zhigengniao from "@/assets/images/知更鸟2.jpg"
import zhanfushaonu from "@/assets/images/zhanfushaonu.png"


const test=ref("新月\n同行\n———\n组长，回头看，向前走，答案在前也在后");
</script>

<template>
  <Navigator></Navigator>
  <Add></Add>
  <Delete></Delete>
  <div class="collections_container">
    <Collection :bg-url="xia" :info="test"></Collection>
    <Collection :bg-url="shiroko"></Collection>
    <Collection :bg-url="zhanfushaonu"></Collection>
    <Collection :bg-url="xia"></Collection>
    <Collection :bg-url="xia"></Collection>
    <Collection :bg-url="zhigengniao"></Collection>
    <Collection :bg-url="xia"></Collection>
  </div>
</template>

<style scoped>
.collections_container{
  display: grid;
  grid-template-columns: repeat(3, 33.33%);
  grid-auto-flow: row;
  grid-auto-rows: auto;
  /* 默认就是按行填充：第一行从左到右，再到第二行；显式写出以便理解 */
  gap: 20px;
  justify-items: center;   /* ← 新增：水平把子项居中放在格子里 */
  align-items: center;     /* ← 新增：垂直把子项居中放在格子里 */


  width: 100%;
  min-height: 100vh;
  background: #E0EAFC;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #CFDEF3, #E0EAFC); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  padding: 40px 100px 150px 100px;

}
</style>