<script setup>

</script>

<template>
<!-- 整体容器-->
  <div class="scroll_container">

    <div class="content_container">

      <div class="title_container">
        <input type="text">
      </div>

      <div class="edit_container">
        <div  contenteditable="true" ></div>
      </div>
    </div>
  </div>


</template>

<style scoped>
  .scroll_container{
    display: flex;
    justify-content:center;
    width:100%;
    height:600px;
    margin-top: 24px;
    background-color: pink;
  }
  .content_container{
    width: 910px;
    height: 100%;
    background-color: skyblue;
  }
  .title_container{
    width: 100%;
    height: 60px;
    padding: 0 16px;
    background-color: #27f3b4;
  }
</style>