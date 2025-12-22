<script setup>
import {ref} from "vue";
import SecondFolder from "@/components/colocate/SecondFolder.vue";

const props=defineProps({
  firstFolderName:{
    type:String,
    default:"默认收藏夹1"
  }
});
const secondFName=ref('');
const input_show=ref(false);


function test(){
  console.log(1);
}
</script>

<template>
  <div class="tixing" @click="input_show=false">
    <span class="folder_name">{{props.firstFolderName}}</span>
    <div class="folder_container">
      <SecondFolder></SecondFolder>
      <SecondFolder></SecondFolder>
<!--创建二级收藏夹-->
      <div class="create_container" @click.stop="input_show=!input_show">
        <span class="left"></span>
        <span class="name">创建收藏夹</span>
        <input @keydown.enter="test" @click.stop v-model="secondFName" v-show="input_show" type="text" class="name_input" maxlength="12">
      </div>
    </div>
  </div>
</template>

<style scoped>
.tixing{
  position: absolute;
  width: 520px;
  height: 100%;
  background-color: #CFDEF3;
  right: 0;
  top:  0;
  z-index: 1000;
  clip-path: polygon(46% 0, 100% 0, 100% 100%, 0% 100%);
  overflow: hidden;

  user-select: none;
}
.folder_name{
  position: absolute;
  bottom: 438px;
  right: 220px;
  color: #676767;
}
.folder_container{
  position: absolute;
  width: 300px;
  height: 400px;
  right: 100px;
  bottom: 40px;
  transform: skew(-20deg);

 /* background-color: skyblue;*/
}

/*点击创建后出现的input*/
.create_container{
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  background-color: #E0EAFC;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 10px;
}
.create_container:hover{
  cursor: pointer;
}
.left{
  float: left;
  width: 2%;
  height: 100%;
  background-color: #64CBFF;
}
.name{
  float: left;
  width: 100px;
  height: 100%;
  margin-left: 10px;
  transform: skew(20deg);
  line-height: 30px;
}
.name_input{
  transform: skew(20deg);
  outline: none;
  border: none;
  opacity: 0.8;
}
</style>