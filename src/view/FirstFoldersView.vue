<script setup>
import {onMounted, ref} from "vue";
import FirstFolder from "@/components/colocate/FirstFolder.vue";
import Navigator from "@/components/Navigator.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";
import SecondFolderContainer from "@/components/SecondFolderContainer.vue";

import profile from "@/assets/images/profile_test.jpg"
import xia from "@/assets/images/夏.png"
import zhanfushaonu from "@/assets/images/zhanfushaonu.png"
import arona from "@/assets/images/arona.png"
import zhigengniao from "@/assets/images/知更鸟2.jpg"
import test1 from "@/assets/images/test1.jpg"
import {useRouter} from "vue-router";
import {userStore} from "@/stores/UserStore.js";
import axios from "axios";


const store=userStore();
const folder_show = ref(false);
const router=useRouter();

// 显示 SecondFolderContainer
const showSecondFolder = (event) => {
  event.stopPropagation(); // 阻止事件冒泡到 body_container
  folder_show.value = !folder_show.value;
  console.log(1);
};
// 阻止 SecondFolderContainer 内部点击关闭自己
const preventClose = (event) => {
  event.stopPropagation();
};


/*上传一级收藏夹名字和图片*/
function authHeaders() {
  const headers = {};
  if (store.getToken()) headers['Authorization'] = 'Bearer ' + store.getToken();
  return headers;
}
const folders = ref([]);
async function getData(){
  /*第一次上传*/
  try {
    const res = await axios.post('/api/collection/folder/level1/getUserFolders', {
      headers: authHeaders(),
    });
    console.log('response (axios):', res.data);
    if (res.data.isSuccess) {
      folders.value = res.data.data;
    }
  } catch (e) {
    console.log(1111)
    console.error(e);
  }
}


onMounted(()=>{
  getData();
});
</script>

<template>
  <Navigator></Navigator>
  <div class="body_container" @click="folder_show=false">
    <Add @click="router.push('/addFirstView')"></Add>
    <Delete></Delete>
    <SecondFolderContainer v-show="folder_show"  class="second-folder-overlay" @click="preventClose"></SecondFolderContainer>
    <div class="grid_container" :class="{ 'scroll-locked': folder_show }">
      <FirstFolder
          v-for="(item, index) in folders"
          :key="item.id"
          :id="item.id"
          :bg="item.url"
          :name="item.name"
          :row="(index % 2) === 0 ? 2 : 1"
          :col="index + 1"
          :left="index === 0 ? 100 : 0"
          @click="showSecondFolder"
      >
        {{ item.name }}
      </FirstFolder>
    </div>
  </div>
</template>

<style scoped>
.body_container {
  position: relative;
  width:  100%;
  height: 90vh;
  background: #E0EAFC;
  background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);
  background: linear-gradient(to right, #CFDEF3, #E0EAFC);
}

.grid_container {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  padding-bottom: 16px;
  padding-right: 200px;
  grid-template-rows: repeat(2, 320px);
  grid-auto-columns: 450px;
  place-items: center;
  overflow-x: auto;
}

/* 锁定滚动状态 */
.grid_container.scroll-locked {
  overflow-x: hidden;
}


</style>