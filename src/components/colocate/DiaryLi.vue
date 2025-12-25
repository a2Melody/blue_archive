<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  date: {
    type: [String, Date],
    default: ""
  }
});
const emit = defineEmits(["click"]);
function onClick() {
  emit("click");
}
</script>

<template>
  <div class="container" @click="onClick">
    <span class="title_name">{{ title }}</span>
    <span class="create_time">{{ date }}</span>
  </div>
</template>

<style scoped>
.container{
  position: relative;
  width: 500px;
  height: 40px;
  background-color: transparent;
  padding-left: 30px;
  border-radius: 4px;
}
.container:hover{
  background-color: rgba(255,255,255,0.6);
  cursor: pointer;
}
.title_name{
  color: black;
  line-height: 40px;
}
.create_time{
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 10px;
  color: #7c7b7b;
}
</style>