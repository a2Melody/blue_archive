<script setup lang="js">
import imageUrl from "@/assets/images/shiroko_bg.jpg";

const bgStyle = {
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
};
</script>

<template>
  <div
      class="back_image"
      :style="bgStyle"
  ></div>
</template>

<style scoped>
.back_image{
  border:0;
  width: 100%;
  height: 630px;
  background-position: center 0;
}
</style>