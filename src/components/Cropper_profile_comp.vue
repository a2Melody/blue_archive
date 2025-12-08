<script setup lang="js">
import {ref, onBeforeUnmount} from "vue";
import Cropper from 'cropperjs/dist/cropper.esm.js'
import 'cropperjs/dist/cropper.css'

const isReady=ref(false);
const sourceUrl=ref('');          //保存生成的Url
const CropperUrl=ref(null);       //保存Cropper，而不是标签引用
const sourceImgRef=ref(null);     //指向左侧要被遮罩/裁剪的容器
const inputRef=ref(null);         //获取Input元素

//销毁预览图片
const revokeIfNeeded=(url)=>{
  if(url&&url.startsWith('blob:'))URL.revokeObjectURL(url);
}
/*销毁Cropper*/
const destroyCropper=()=>{
    if(CropperUrl.value){
      try { CropperUrl.value.destroy() } catch (e) {}
      CropperUrl.value = null
    }
  isReady.value=false;
}

/*input上传文件*/
function onFileChange(e){
  const file=e.target.files?.[0]  //如果没有files或files为空，则file为undefined
  if (!file)return
  revokeIfNeeded(sourceUrl.value);
  destroyCropper();

  sourceUrl.value=URL.createObjectURL(file);
  isReady.value=true;
  inputRef.value.value=null;
}
function initCropper(){
  const imgEl=sourceImgRef.value;
  if(CropperUrl.value)destroyCropper();
  CropperUrl.value=new Cropper(imgEl,{
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
    },
  })
}
function onRechoose() {
  inputRef.value.click();
}

onBeforeUnmount(() => {
  destroyCropper()
  revokeIfNeeded(sourceUrl.value)
})

</script>

<template>
    <div class="container">
      <!--最上面的input上传图片-->

      <!--      左侧的裁剪框-->
      <div class="left_container">

        <div class="pic_input_container" v-show="!isReady">
          <label for="input" class="input_words iconfont icon-shangchuantuxiang">上传图像</label>
          <input ref="inputRef" id="input" type="file" accept="image/*" @change="onFileChange" style="display: none"/>
        </div>
        <div class="pic_show" v-show="isReady" style="margin-top: 23px">
          <div class="image_wrapper" ref="image_wrapper">
            <img ref="sourceImgRef" :src="sourceUrl" @load="initCropper"/>
          </div>
          <!--        重新选择图片-->
          <div class="controls" style="margin-top:4px;text-align: center">
            <span class="words iconfont icon-zhongxinjiazai1" @click="onRechoose">重新选择</span>
          </div>
        </div>

      </div>

      <!--      右侧的实际效果显示框-->
      <div class="right_container">
         <div class="result"></div>
         <span style="font-size: 12px;color: #99a2aa;font-weight: 500;margin-top: 12px">当前头像</span>
      </div>

      <div class="btn_save"><span>保存</span></div>
    </div>

</template>

<style scoped>
.container{
  position: relative;
  width: 100%;
  height: 600px;
  padding: 80px;
  user-select: none;
}
/*重新选择这四个字*/
.words{
  display: inline-block;
  font-size: 12px;
  color: #99a2aa;
  font-weight: 500;
}
.words::before{
  font-size: 13px;
  margin-right: 2px;
  margin-top: 1px;
}
.words:hover{
  color: #6BCBFF;
  cursor: pointer;
}
/*左侧容器*/
.left_container{
  position: absolute;
  left: 460px;
  top: 80px;
  padding: 2px 40px;
  width: 280px;
  height: 250px;
/*  background-color: pink;*/
  border-right: 2px solid #f1f2f5;
}
.image_wrapper{
  width: 200px;
  height: 200px;
  background-color: white;
  border-radius: 6px;
  overflow: hidden;
}
.image_wrapper img{
  display: block;
  width:100%;
}
/*上传图像的样式*/
.pic_input_container{
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  background-color: #f1f2f5;
  margin-top: 40%;
  margin-left: 50px;
  border-radius: 5px;
  height: 60px;
  width: 140px;
  color: #99a2aa;
}
.pic_input_container:hover{
    background-color: #e5e9ef;
}
.input_words{
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  width: 100%;
  height: 100%;
  gap: 4px;
}
.input_words::before{
  font-size: 24px;
  transform: translateY(2px);
}

/*右侧容器*/
.right_container{
  display: flex;
  flex-direction: column;      /* 垂直排列 li */
  align-items: center;         /* 交叉轴(水平)居中每个 li */
  position: absolute;
  left: 770px;
  top: 140px;
  width: 100px;
/*  background-color: pink;*/
}
/*动态显示头像的区域*/
.result{
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #f1f2f5;
}

/*最下面的保存按钮*/
.btn_save{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top:370px;
  width: 100px;
  height: 32px;
  display: inline-flex;        /* 或 display: flex */
  align-items: center;         /* 垂直居中 */
  justify-content: center;     /* 水平居中 */
  background-color: #6BCBFF;
  letter-spacing: 4px;
  color: white;
  border-radius: 5px;
}
.btn_save:hover{
  border: 2px solid #ddd;
}
</style>