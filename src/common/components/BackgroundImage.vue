<script setup lang="js">
import {computed} from "vue";

const props=defineProps({
  bg:String,
  bgPos: { type: String, default: 'center 0' },
  comp:{type:Object,default:null}
})

const bgStyle = computed(() => ({
  backgroundImage: `url(${props.bg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: props.bgPos
}))
</script>

<template>
  <div class="back_image" :style="bgStyle">
    <component :is="comp"></component>
  </div>
</template>

<style scoped>
.back_image{
  position: relative;
  border:0;
  width: 100%;
  height: 660px;
  background-position: center center;
}
</style>