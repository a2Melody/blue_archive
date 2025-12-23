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

async function showSecondFolder(event,item){
  event.stopPropagation(); // 阻止事件冒泡到 body_container
  if(folder_show.value){
    folder_show.value = false;
  }
  else {
    folder_show.value = true;
    selectedFolderName.value=item.name;
    selectedFolderId.value=item.id;
    console.log(item.id);
    const res = await axios.post('/api/collection/folder/level2/getFoldersByParent', {
      father_id:item.id
    });
    const responseData = res.data;
    console.log(responseData);
    secondFolders.value=res.data.data;
  }
}



/*每次到这个界面都会拉取一级收藏夹的数据*/
onMounted(()=>{
  getData();
});
</script>

<template>
  <Navigator></Navigator>
  <div class="body_container" @click="folder_show=false">
    <Add @click="router.push('/addFirstView')"></Add>
    <Delete></Delete>
    <SecondFolderContainer
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