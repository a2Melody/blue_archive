<script setup>
import {ref} from "vue";
import Navigator from "@/components/Navigator.vue";
import Collection from "@/components/colocate/Collection.vue";

const info=ref('');               //存标题名字

const preUrl=ref('');
const sourceUrl=ref('');          //保存生成的Url
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
  info.value='';
}
</script>

<template>
  <Navigator></Navigator>
  <div class="body_container">
    <div class="container">

      <div class="top_container">
        <div class="name_input">
          <label  style="font-size: 14px">内容: </label>
          <textarea  class="info_textarea" v-model="info" ></textarea>
        </div>

        <div class="pic_input_container">
          <label for="input_c" class="input_words iconfont icon-shangchuantuxiang" style="font-size: 12px"><span style="font-size: 12px">上传图片</span></label>
          <input ref="inputRef" id="input_c" type="file" accept="image/*" @change="onFileChange" style="display: none"/>
        </div>
      </div>

      <Collection :bgUrl="sourceUrl" :info="info"></Collection>

      <div class="btn_save" @click="onSave"><span>创建</span></div>
    </div>
  </div>
</template>

<style scoped>
input,textarea{
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
  padding-top: 50px;
}

.container{
  display: flex;
  max-width: 600px;
  flex-direction: column; /* 新增：让子项竖直排列 */
  position: relative;
  justify-content: center;
  align-items: center;     /* 保持：在 x 轴（横向）居中子项 */
/*  background-color: pink;*/
}
/*放名字输入和上传图像的input的*/
.top_container{
  display: flex;
  justify-content: space-between; /* 左右两端对齐 */
  align-items: flex-end;          /* 改为靠底部对齐（最小修改） */
  gap: 30px;                      /* 可选：两项之间的间距 */
  width: 100%;
  height: 56px;

  margin-bottom: 20px;
  color: #676767;
}
.name_input{
  display: flex;
  align-items: flex-end; /* 底部对齐 */
  gap: 8px;              /* 可选，label 与 textarea 间距 */

}
.info_textarea{
  width: 200px;
  height: auto;
  background-color: rgba(255,255,255,0.8);
  opacity: 0.7;
  border-radius: 4px;
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
  margin: 40px auto;
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