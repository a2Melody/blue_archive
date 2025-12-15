<script setup>


</script>

<template>
  <div class="container">
    <div class="triangle"></div>
  </div>
</template>

<style scoped>
.container{
  /*  transform: skew(-25deg);*/
}
.triangle {
  width: 0;
  height: 0;
  border-top: 100px solid orange;
  border-right: 100px solid orange;
  border-left: 100px solid transparent;
  border-bottom: 100px solid transparent;
}

</style>