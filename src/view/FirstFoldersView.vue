<script setup>
import {onMounted, ref} from "vue";
import FirstFolder from "@/components/colocate/FirstFolder.vue";
import Navigator from "@/components/Navigator.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";
import SecondFolderContainer from "@/components/SecondFolderContainer.vue";

import {useRouter} from "vue-router";
import axios from "axios";


const router=useRouter();

/*拉取该用户的所有一级收藏夹*/
const folders = ref([]);
async function getData(){
  /*第一次上传*/
  try {
    const res = await axios.post('/api/collection/folder/level1/getUserFolders', {});
    console.log('response (axios):', res.data);
    if (res.data.isSuccess) {
      folders.value = res.data.data;
    }
  } catch (e) {
    console.error(e);
  }
}


const folder_show = ref(false);
const secondFolders = ref([]); // 新增：存放二级列表数据
const selectedFolderName = ref(""); // 新增：存放当前选中的一级文件夹名字
const selectedFolderId =ref(null);
/*拉取该一级收藏夹的二级收藏夹*/
// 将拉取二级文件夹的逻辑独立出来，方便复用
async function updateSecondFolders(fatherId) {
  try {
    const res = await axios.post('/api/collection/folder/level2/getFoldersByParent', {
      father_id: fatherId
    });
    console.log(res.data);
    secondFolders.value = res.data.data;
  } catch (e) {
    console.error("刷新二级菜单失败", e);
  }
}
async function showSecondFolder(event,item){
  event.stopPropagation(); // 阻止事件冒泡到 body_container
  if(folder_show.value){
    folder_show.value = false;
  }
  else {
    folder_show.value = true;
    selectedFolderName.value = item.name;
    selectedFolderId.value = item.id;
    // 调用封装好的函数
    await updateSecondFolders(item.id);
  }
}

// 删除功能
const isDeleteMode = ref(false); // 控制减号显示的状态
function toggleDeleteMode() {
  isDeleteMode.value = !isDeleteMode.value;
}
// 执行删除请求的方法
async function handleDelete(id) {
  try {
    await axios.post('/api/collection/folder/level1/deleteFolder', { id:id });
    // 删除成功后重新拉取列表
    await getData();
  } catch (e) {
    console.error("删除失败", e);
  }
}
/*点击全局container会让减号和二级收藏夹容器消失*/
function containerClick(){
  folder_show.value=false;
  isDeleteMode.value=false;
}

/*每次到这个界面都会拉取一级收藏夹的数据*/
onMounted(()=>{
  getData();
});
</script>

<template>
  <Navigator></Navigator>
  <div class="body_container" @click="containerClick">
    <Add @click="router.push('/addFirstView')"></Add>
    <Delete @click.stop="toggleDeleteMode"></Delete>
    <SecondFolderContainer
        @refresh="updateSecondFolders(selectedFolderId)"
        :father_id="selectedFolderId"
        :first-folder-name="selectedFolderName"
        :data="secondFolders"
        v-if="folder_show"
        class="second-folder-overlay"
        @click.stop
    ></SecondFolderContainer>
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
          @click="showSecondFolder($event,item)"
          @delete-firstFolder="handleDelete"
          :show-delete="isDeleteMode"
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