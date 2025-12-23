<script setup>
import {ref} from "vue";
import Navigator from "@/components/Navigator.vue";
import FirstFolder from "@/components/colocate/FirstFolder.vue";
import axios from "axios";
import {userStore} from "@/stores/UserStore.js";
import {useRouter} from "vue-router";

const router=useRouter();
const store=userStore();
const name=ref('');               //存标题名字
const preUrl=ref('');
const sourceUrl=ref('');          //保存生成的Url
const sourceImgRef=ref(null);     //指向img标签
const inputRef=ref(null);         //获取Input元素
const uploadedFile = ref(null);

//销毁预览图片
const revokeIfNeeded=(url)=>{
  if(url&&url.startsWith('blob:'))URL.revokeObjectURL(url);
}
/*input上传文件*/
function onFileChange(e){
  const file = e.target.files?.[0];
  if (!file) return;
  uploadedFile.value = file;
  if(preUrl.value){
    revokeIfNeeded(preUrl.value);
    preUrl.value='';
  }
  if(sourceUrl.value)preUrl.value=sourceUrl.value;
  sourceUrl.value=URL.createObjectURL(file);
  inputRef.value.value=null;
}

/*上传一级收藏夹名字和图片*/
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
async function onSave(){
  console.log(1111);
  /*第一次上传*/
  const contentType = uploadedFile.value.type || 'application/octet-stream';
  const presignReq = { originalFilename: uploadedFile.value.name, mimeType: contentType };
  try {
    const res = await axios.post('/api/collection/folder/level1/presign', presignReq, {
      withCredentials: true
    });
    console.log(`success_desu`);

    /*第二次上传*/
    const attachmentId=res.data.attachmentId;
    const putUrl=res.data.putUrl;
    const putHeaders=res.data.putHeaders;
    const ok = await uploadToPresigned(putUrl, putHeaders, uploadedFile.value, contentType);
    if (!ok) return;
    console.log(`success_desu_desu`);

    /*第三次上传desu*/
    const presignReq_createNewFolder = { attachmentId: attachmentId,name:name.value};
    console.log(presignReq_createNewFolder)
    const res_createNewFolder = await axios.post('/api/collection/folder/level1/createNewFolder',presignReq_createNewFolder);
    console.log("success_desu_desu_desu");

    router.push('/firstFolders');
  } catch (e) {

    console.error(e);
  }
}


</script>

<template>
    <Navigator></Navigator>
    <div class="body_container">
      <div class="container">

        <div class="top_container">
          <div class="name_input">
            <label style="font-size: 14px">收藏夹名称: </label>
            <input type="text" v-model="name" maxlength="7" style="color: #676767;background-color: rgba(255,255,255,0.8);">
          </div>

          <div class="pic_input_container">
            <label for="input_a" class="input_words iconfont icon-shangchuantuxiang" style="font-size: 12px"><span style="font-size: 12px">上传图片</span></label>
            <input ref="inputRef" id="input_a" type="file" accept="image/*" @change="onFileChange" style="display: none"/>
          </div>
        </div>

        <FirstFolder :bg="sourceUrl" :name="name"></FirstFolder>

        <div class="btn_save" @click="onSave"><span>创建</span></div>
      </div>
    </div>
</template>

<style scoped>
input{
  outline: none;
  border:none;
}
#firstFolder_name{
  background-color: transparent;
  border-bottom: 1px solid white;
  color: black;
}
/*渐变色背景*/
.body_container{
  user-select: none;
  width: 100%;
  height: 90vh;
  background: #E0EAFC;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #CFDEF3, #E0EAFC); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  display: flex;
  justify-content: center; /* 水平居中 .container */
  align-items: flex-start; /* 或 center */
  padding-top: 100px;
}

.container{
  display: inline-block;
  position: relative;
}
/*放名字输入和上传图像的input的*/
.top_container{
  display: flex;
  justify-content: space-between; /* 左右两端对齐 */
  align-items: center;            /* y 轴居中对齐 */
  gap: 16px;                      /* 可选：两项之间的间距 */
  width: 100%;
  height: 56px;
  padding: 0 20px;
  margin-bottom: 20px;
  color: #676767;
}
/*上传图像的样式*/
.pic_input_container{
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  background-color: #f1f2f5;
  border-radius: 5px;
  height: 30px;
  width: 80px;
  color: #99a2aa;
}
.input_words:hover{
    cursor: pointer;
}
.pic_input_container:hover{
  background-color: #e5e9ef;
}
/*最下面的保存按钮*/
.btn_save{
  width: 100px;
  height: 32px;
  margin: 70px auto;
  display: flex;        /* 或 display: flex */
  align-items: center;         /* 垂直居中 */
  justify-content: center;     /* 水平居中 */
  background-color: #64CBFF;
  letter-spacing: 4px;
  color: white;
  border-radius: 5px;
  transform: translateX(5%);
}
.btn_save:hover{
  border: 2px solid #ddd;
  cursor: pointer;
}
</style>