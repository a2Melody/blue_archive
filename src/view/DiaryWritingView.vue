<script setup lang="ts">
import useTools from "@/utils/diary-toolbar";
import {useRouter} from "vue-router";
const { onBeforeInput, onCompositionStart, onCompositionEnd,isUndoDisabled, isRedoDisabled,editorRef, fileInputRef, onUndo, onRedo, onBold, onItalic, onFileButtonClick, onFileInputChange, onInsertLocalImage}=useTools();

const router=useRouter();

</script>

<template>
  <!--上面的工具导航栏-->
  <div class="container">
    <!---->
    <div class="header_container">
      <button type="button" class="btn return" @click="router.push('/diaryShow')">返回</button>
      <button type="button" class="btn save"><span>保存</span></button>
    </div>
    <div class="tool_container">
      <!--      撤销-->
      <div class="w_edit_tool">
        <button
            :disabled="isUndoDisabled"
            @mousedown.prevent="onUndo"
            :style="{ color: isUndoDisabled ? '#bbb' : '#333', cursor: isUndoDisabled ? 'not-allowed' : 'pointer' }">
          <svg viewBox="0 0 1024 1024">
            <path fill="currentColor" d="M512 64A510.272 510.272 0 0 0 149.984 213.984L0.032 64v384h384L240.512 304.48A382.784 382.784 0 0 1 512.032 192c212.064 0 384 171.936 384 384 0 114.688-50.304 217.632-130.016 288l84.672 96a510.72 510.72 0 0 0 173.344-384c0-282.784-229.216-512-512-512z"></path>
          </svg></button></div>
      <!--      恢复-->
      <div class="w_edit_tool">
        <button :disabled="isRedoDisabled"
                @mousedown.prevent="onRedo"
                :style="{ color: isRedoDisabled ? '#bbb' : '#333', cursor: isRedoDisabled ? 'not-allowed' : 'pointer' }">
          <svg viewBox="0 0 1024 1024">
            <path fill="currentColor" d="M0.00032 576a510.72 510.72 0 0 0 173.344 384l84.672-96A383.136 383.136 0 0 1 128.00032 576C128.00032 363.936 299.93632 192 512.00032 192c106.048 0 202.048 42.976 271.52 112.48L640.00032 448h384V64l-149.984 149.984A510.272 510.272 0 0 0 512.00032 64C229.21632 64 0.00032 293.216 0.00032 576z"></path>
          </svg></button></div>
      <div class="split_line"></div>
      <!--      字体大小-->
      <div class="w_edit_tool" style="color:#bbb">
        <button disabled style="cursor: not-allowed">
          <svg viewBox="0 0 1024 1024">
            <path fill="currentColor" d="M64 512h384v128h-128V1024h-128V640h-128z m896-256H708.2496v768h-136.4992V256H320V128h640z"></path>
          </svg></button></div>
      <!--      字体加粗-->
      <div class="w_edit_tool">
        <button @mousedown.prevent="onBold">
          <svg viewBox="0 0 1024 1024">
            <path d="M707.872 484.64A254.88 254.88 0 0 0 768 320c0-141.152-114.848-256-256-256H192v896h384c141.152 0 256-114.848 256-256a256.096 256.096 0 0 0-124.128-219.36zM384 192h101.504c55.968 0 101.504 57.408 101.504 128s-45.536 128-101.504 128H384V192z m159.008 640H384v-256h159.008c58.464 0 106.016 57.408 106.016 128s-47.552 128-106.016 128z"></path>
          </svg></button></div>
      <!--      字体斜体-->
      <div class="w_edit_tool">
        <button @mousedown.prevent="onItalic">
          <svg viewBox="0 0 1024 1024">
            <path d="M896 64v64h-128L448 896h128v64H128v-64h128L576 128h-128V64z"></path>
          </svg></button></div>
      <!--      改变字体颜色-->
      <div class="w_edit_tool" style="color:#bbb">
        <button disabled style="cursor: not-allowed"><svg viewBox="0 0 1024 1024">
          <path fill="currentColor" d="M281.44376946 911.02814815l69.91749423-233.01688889 321.32718289 0 69.91749423 233.01688889 137.89628796 0-233.0168889-776.72296296-270.92096947 0-233.0168889 776.72296296 137.92114309 0zM467.85728057 289.64977778l88.31029399 0 69.91749424 233.01688889-228.12042733 0 69.91749423-233.01688889z"></path>
        </svg></button></div>
      <div class="split_line"></div>
      <!--      添加图片-->
      <div class="w_edit_tool">
        <button  @click="onFileButtonClick">
          <svg viewBox="0 0 1024 1024">
            <path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path>
          </svg></button></div>

      <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileInputChange" />

    </div>
  </div>

  <!-- 下面输入内容的整体容器-->
  <div class="scroll_container">
    <div class="content_container">
      <div class="title_container">
        <input type="text" class="title_input" placeholder="未命名标题">
      </div>

      <div  class="edit_container">
        <div ref="editorRef" tabindex="0" contenteditable="true" class="edit"
             @beforeinput="onBeforeInput"
             @compositionstart="onCompositionStart"
             @compositionend="onCompositionEnd">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button, input, textarea{
  outline: none;
  border: none;
  background-color: transparent;
}
/*整体的容器*/
.container{       /*改成fixed即可,.scroll_container的margin-top得改成126px*/
  width: 100%;
  position: fixed;
  top: 0;
}
/*分隔线条*/
.split_line{
  width: 1px;
  height: 26px;
  background-color: #e3e3e3;
}

/*最上面有按钮的container*/
.header_container{
  display: flex;
  align-items: center;       /* 垂直（Y 轴）居中 */
  justify-content: flex-end; /* 水平靠右 */
  gap: 10px;
  padding-right: 240px;       /* 距右边间距，改为200px若需要 */
  width: 100%;
  height: 60px;
  background-color: #293646;
  border-radius: 15px 15px 0 0;
}
.btn{
  width: 58px;
  height: 32px;
  background-color: #00AFE8;
  color: white;
  border-radius: 3px;
}
.btn:hover{
  cursor: pointer;
}
.save{
  color: white;
  background-color: #00afe8;
  border: 1px solid #00afe8;
}
.return{
  color: black;
  background-color: #ececec;
  border: 1px solid #b3b3b3;
}

/*toolbar的内容*/
.tool_container{
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 100%;
  height: 42px;
  padding: 3px 0;
  border-bottom:1px solid #ddd;
  color: #ddd;
}
.w_edit_tool{
  display: flex;
  justify-content: center; /* 水平居中（主轴） */
  align-items: center;     /* 垂直居中（交叉轴） */
  width: 34px;
  height: 34px;
}
.w_edit_tool button{
  width: 100%;
  height: 100%;
}
.w_edit_tool svg{
  width: 16px;
  height: 16px;
}
.w_edit_tool:hover{
  background-color: #f1f1f1;
  cursor: pointer;
}

/*正文输入的容器*/
.scroll_container{
  width:100%;
  margin-top: 126px;
}
.content_container{
  width: 910px;
  margin: 0 auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .3);
  border-radius: 10px 10px 0 0;
}

/*标题输入*/
.title_input{
  width: 910px;
  height: 50px;
  line-height: 50px;
  padding: 0 16px;
  font-size: 16px;
  color: #00AFE8;
  border-bottom: 0.6px solid #ddd;
}
.title_input::placeholder{
  color: #6BCBFF;
}

/*正文内容输入*/
.edit{
  width: 910px;
  padding: 16px;
  font-size: 14px;
  min-height: 1000px;
  user-select: text;
}
.edit:focus{
  outline: none;
}

</style>