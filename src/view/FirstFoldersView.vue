<script setup>
import FirstFolder from "@/components/colocate/FirstFolder.vue";
import Navigator from "@/components/Navigator.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";


</script>

<template>
  <div class="body_container">
    <Add></Add>
    <Delete></Delete>
    <Navigator></Navigator>
    <FirstFolder></FirstFolder>

  </div>
</template>

<style scoped>
  .body_container{
    position: relative;
    width: 100%;
    height: 100vh;
    background: #E0EAFC;  /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);  /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, #CFDEF3, #E0EAFC); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */


  }
</style>