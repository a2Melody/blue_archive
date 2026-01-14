<script setup lang="js">
import {ref, onBeforeUnmount} from "vue";
import Cropper from 'cropperjs/dist/cropper.esm.js'
import 'cropperjs/dist/cropper.css';
import {userStore} from "@/stores/UserStore.js";
import axios from "axios";


const store=userStore();
const isReady=ref(false);
const preUrl=ref('');
const sourceUrl=ref('');          //保存生成的Url
const CropperRef=ref(null);       //保存Cropper，而不是标签引用
const sourceImgRef=ref(null);     //指向img标签
const inputRef=ref(null);         //获取Input元素
const uploadedFile = ref(null);

//销毁预览图片
const revokeIfNeeded=(url)=>{
  if(url&&url.startsWith('blob:'))URL.revokeObjectURL(url);
}
/*销毁Cropper*/
const destroyCropper=()=>{
  if(CropperRef.value){
    try { CropperRef.value.destroy() } catch (e) {}
    CropperRef.value = null
  }
  isReady.value=false;
}
/*input上传文件*/
function onFileChange(e){
  const file = e.target.files?.[0];
  if (!file) return;
  uploadedFile.value = file;
  if(sourceUrl.value)preUrl.value=sourceUrl.value;

  sourceUrl.value=URL.createObjectURL(file);
  if(CropperRef.value) CropperRef.value.replace(sourceUrl.value); /*更换文件时Cropper改变值，第一次上传时还未初始化Cropper，所以skip*/

  inputRef.value.value=null;
}
function initCropper(){
  isReady.value=true;
  if(preUrl.value){
      revokeIfNeeded(preUrl.value);
      preUrl.value='';
  }
  if(CropperRef.value)return;
  const imgEl=sourceImgRef.value;
  CropperRef.value=new Cropper(imgEl,{
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
  })
}
function onRechoose() {
  inputRef.value.click();
}


/*上传头像*/
function authHeaders() {
  const headers = {};
  if (store.getToken()) headers['Authorization'] = 'Bearer ' + store.getToken();
  return headers;
}
async function uploadToPresigned(putUrl, putHeaders, file, contentType) {
  const uploadHeaders = {};
  for (const k in putHeaders) {
    if (!Object.prototype.hasOwnProperty.call(putHeaders, k)) continue;
    uploadHeaders[k] = putHeaders[k];
  }
  uploadHeaders['Content-Type'] = contentType;

  const uploadRes = await fetch(putUrl, {
    method: 'PUT',
    headers: uploadHeaders,
    body: file,
  });
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(()=>null);
    return false;
  }
  return true;
}
async function onSave() {
  if (!CropperRef.value) return;

  // 1. 先计算尺寸
  const targetSize = 150; // 目标显示大小
  const dpr = window.devicePixelRatio || 1;
  const supersample = 2;
  const outW = Math.round(targetSize * dpr * supersample);
  const outH = Math.round(targetSize * dpr * supersample);

  // 2. 获取裁剪后的 Canvas
  const canvas = CropperRef.value.getCroppedCanvas({
    width: outW,
    height: outH,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });

  // 3. 转换为 Blob 并上传
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    // --- 本地预览更新 ---
    const blobUrl = URL.createObjectURL(blob);
    if (store.profile && store.profile.startsWith('blob:')) {
      try { URL.revokeObjectURL(store.profile); } catch (e) {}
    }
    store.setProfile(blobUrl);

    // --- 上传逻辑 ---
    // 裁剪后我们统一使用 png 格式
    const contentType = 'image/png';
    // 生成一个文件名，保留原名但改后缀为 .png
    const fileName = (uploadedFile.value?.name || 'avatar.png').replace(/\.[^/.]+$/, "") + ".png";

    const presignReq = {
      originalFilename: fileName,
      mimeType: contentType
    };

    try {
      // 第一步：获取预签名 URL
      const res = await axios.post('/api/user/presign', presignReq, {
        headers: authHeaders(),
        withCredentials: true
      });

      const { attachmentId, putUrl, putHeaders } = res.data;

      // 第二步：上传裁剪后的 blob (注意这里传入的是 blob)
      const ok = await uploadToPresigned(putUrl, putHeaders, blob, contentType);
      if (!ok) {
        console.error("上传到存储服务器失败");
        return;
      }

      // 第三步：关联头像到用户
      await axios.post('/api/user/userAvatar', { attachmentId: attachmentId }, {
        headers: authHeaders()
      });

      console.log('头像更新成功！');
    } catch (e) {
      console.error('上传过程出错:', e);
    }
  }, 'image/png');
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
        <div class="image_wrapper" ref="image_wrapper" style="background-color: black">
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

    <div class="btn_save" @click="onSave"><span>保存</span></div>
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
  color: #64CBFF;
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
  background-color: #64CBFF;
  letter-spacing: 4px;
  color: white;
  border-radius: 5px;
}
.btn_save:hover{
  border: 2px solid #ddd;
}
</style>