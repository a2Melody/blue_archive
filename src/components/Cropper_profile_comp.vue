<script setup lang="js">
import {ref, onBeforeUnmount} from "vue";
import Cropper from 'cropperjs/dist/cropper.esm.js'
import 'cropperjs/dist/cropper.css'

const isReady=ref(false);
const sourceUrl=ref('');
const cropperUrl=ref('');
const sourceImgRef=ref(null);
const image_wrapper=ref(null);

//销毁预览图片
const revokeIfNeeded=(url)=>{
  if(url&&url.startsWith('blob:'))URL.revokeObjectURL(url);
  image_wrapper.value.style.backgroundColor="white";
}
const destroyCropper=()=>{
  isReady.value=false;
  image_wrapper.value.style.backgroundColor="white";
}

function onFileChange(e){
  const file=e.target.files?.[0]  //如果没有files或files为空，则file为undefined
  if (!file)return
  revokeIfNeeded(cropperUrl.value);
  cropperUrl.value='';
  revokeIfNeeded(sourceUrl.value);
  sourceUrl.value=URL.createObjectURL(file);
  e.target.value='';
}
function initCropper(){
  if (!sourceImgRef.value||!sourceUrl.value) return
  const imgEl = sourceImgRef.value;
  new Cropper(imgEl,{
    viewMode: 1,
    dragMode: 'move',
    aspectRatio: 1,
    autoCropArea: 1,
    background: false,
    zoomOnWheel: true,
    movable: true,
    scalable: true,
    rotatable: true,
    responsive: true,
    checkOrientation: true,
    guides: true,
    center: true,
    highlight: true,
    // 关键：开启预览容器（可以是选择器、元素、节点列表或数组）
    preview: '.result',
    ready() {
      isReady.value=true;
      image_wrapper.value.style.backgroundColor="black";
    },
  })
}
onBeforeUnmount(() => {
  destroyCropper()
  revokeIfNeeded(sourceUrl.value)
  revokeIfNeeded(cropperUrl.value)
})

</script>

<template>
    <div class="container">
      <!--最上面的input上传图片-->

      <!--      左侧的裁剪框-->
      <div class="left_container">
        <div class="pic_input"><input type="file" accept="image/*" @change="onFileChange" /></div>
        <div class="image_wrapper" ref="image_wrapper">
          <img ref="sourceImgRef" :src="sourceUrl" @load="initCropper">
        </div>
        <!--        控制按钮-->
        <div class="controls" v-if="isReady">
          <button @click="reset">重置</button>
          <button @click="submit">保存</button>
        </div>
      </div>

      <!--      右侧的实际效果显示框-->
      <div class="right_container">
        <div class="result"></div>
        <div>预览头像</div>
      </div>
    </div>

</template>

<style scoped>
.container{
  width: 100%;
  height: 600px;
  padding: 80px;
}
/*左侧容器*/
.left_container{
  float: left;
  margin-left: 410px;
  padding: 2px 25px;
  width: 250px;
  height: 250px;
/*  background-color: pink;*/
  border-right: 2px solid #f1f2f5;
}
.image_wrapper{
  width: 200px;
  height: 200px;
  background-color: white;
}
.image_wrapper img{
  display: block;
  width:100%;
}

/*右侧容器*/
.right_container{
  float: left;
  width: 250px;
  height: 250px;
  background-color: pink;
  font-size: 14px;
  font-weight: 600;
  margin-left: 30px;
}
.result{
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #27f3b4;
}

</style>