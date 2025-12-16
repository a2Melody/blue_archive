<script setup>
import {ref} from "vue";
import Navigator from "@/components/Navigator.vue";
import FirstFolder from "@/components/colocate/FirstFolder.vue";

const name=ref('');               //存标题名字

const preUrl=ref('');
const sourceUrl=ref('');          //保存生成的Url
const sourceImgRef=ref(null);     //指向img标签
const inputRef=ref(null);         //获取Input元素


//销毁预览图片
const revokeIfNeeded=(url)=>{
  if(url&&url.startsWith('blob:'))URL.revokeObjectURL(url);
}
/*input上传文件*/
function onFileChange(e){
  const file=e.target.files?.[0]  //如果没有files或files为空，则file为undefined
  if (!file)return
  if(preUrl.value){
    revokeIfNeeded(preUrl.value);
    preUrl.value='';
  }
  if(sourceUrl.value)preUrl.value=sourceUrl.value;
  sourceUrl.value=URL.createObjectURL(file);
  inputRef.value.value=null;
}
</script>

<template>
    <Navigator></Navigator>
    <div class="body_container">
      <div class="container">

        <div class="name_input" style="float: left">
          <label for="firstFolder_name" style="font-size: 14px">收藏夹名称: </label>
          <input id="firstFolder_name" type="text" v-model="name" >
        </div>

        <div class="pic_input_container" style="float: right;">
          <label for="input_a" class="input_words iconfont icon-shangchuantuxiang">上传图像</label>
          <input ref="inputRef" id="input_a" type="file" accept="image/*" @change="onFileChange" style="display: none"/>
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
  background-color: pink;
}
/*上传图像的样式*/
.pic_input_container{
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  background-color: #f1f2f5;
  border-radius: 5px;
  height: 40px;
  width: 100px;
  color: #99a2aa;

}
.pic_input_container:hover{
  background-color: #e5e9ef;
}
/*最下面的保存按钮*/
.btn_save{
  /*position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top:370px;*/
  width: 100px;
  height: 32px;
  display: flex;        /* 或 display: flex */
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