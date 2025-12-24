<script setup>
const props=defineProps({
  name:{
    type:String,
    required:true
  },
  id:{
    type:Number,
    required:true
  }
})

</script>

<template>
    <div class="second_folder" >
      <span class="left"></span>
      <span class="name">{{props.name}}</span>
    </div>
</template>

<style scoped>
.second_folder{
  width: 100%;
  height: 30px;
  background-color: #E0EAFC;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 14px;
}
.second_folder:hover{
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
</style>