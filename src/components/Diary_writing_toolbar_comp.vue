<script setup>

</script>

<template>
  <div class="container">
<!---->
    <div class="header_container">
      <button type="button" class="btn_save"><span>保存</span></button>
    </div>
    <div class="tool_container"></div>
  </div>
</template>

<style scoped>
/*最上面有按钮的container*/
  .header_container{
    display: flex;
    align-items: center;       /* 垂直（Y 轴）居中 */
    justify-content: flex-end; /* 水平靠右 */
    padding-right: 240px;       /* 距右边间距，改为200px若需要 */
    width: 100%;
    height: 60px;
    background-color: #293646;
    border-radius: 15px 15px 0 0;
  }
  .btn_save{
    width: 58px;
    height: 32px;
    background-color: #00AFE8;
    color: white;
    border: none;
    border-radius: 5px;
  }
  .btn_save:hover{
    cursor: pointer;
  }

/*toolbar的container*/
.tool_container{
  width: 100%;
  height: 42px;
  padding: 3px;
  background-color: #ffffff;
  border-bottom:1px solid #ddd;
}
</style>