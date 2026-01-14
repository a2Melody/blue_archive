<script setup>
import {onMounted, ref} from "vue";
import Navigator from "@/common/components/Navigator.vue";
import Collection from "@/feature/Collection/components/Collection.vue";
import Add from "@/common/components/Add.vue";
import Delete from "@/common/components/Delete.vue";
import {useRoute, useRouter} from "vue-router";
import axios from "axios";


const route=useRoute();
const router=useRouter();
const currentFolderId = ref(null);
const collections=ref(null);

/*从后端拉取收藏内容*/
async function getCollections(){
  try {
    const res = await axios.post('/api/collection/item/getItems', {
       father_level2_id:currentFolderId.value
    });
    console.log('response (axios):', res.data);
    collections.value=res.data.data;
  } catch (e) {
    console.error(e);
  }
}
/*跳转创建界面*/
function goToAddCollection() {
  router.push({
    path: '/addCollection',
    query: { id: currentFolderId.value } // 使用 query 会在 URL 后面拼接 ?id=xxx，推荐这种方式，更直观
  });
}

// Collections.vue
const isDeleteMode = ref(false); // 控制减号显示的状态
// 切换模式的方法
function toggleDeleteMode() {
  isDeleteMode.value = !isDeleteMode.value;
}
// 执行删除请求的方法
async function handleDelete(id) {
  try {
    await axios.post('/api/collection/item/delete', { id:id });
    // 删除成功后重新拉取列表
    await getCollections();
  } catch (e) {
    console.error("删除失败", e);
  }
}

onMounted(() => {
  // 从 query 中读取 id
  currentFolderId.value = route.query.id;
  console.log("获取到的文件夹ID是:", currentFolderId.value);
  getCollections();
});

</script>

<template>
  <Navigator></Navigator>
  <div class="collections_container" @click="isDeleteMode=false">
    <Add @click="goToAddCollection"></Add>
    <Delete @click.stop="toggleDeleteMode"></Delete>
    <Collection
        v-for="collection in collections"
        :id="collection.id"
        :key="collection.id"
        :bg-url="collection.url"
        :info="collection.description"
        :show-delete="isDeleteMode"
        @delete-item="handleDelete"
    ></Collection>
  </div>
</template>

<style scoped>
.collections_container{
  display: grid;
  grid-template-columns: repeat(3, 33.33%);
  grid-auto-flow: row;
  grid-auto-rows: auto;
  /* 默认就是按行填充：第一行从左到右，再到第二行；显式写出以便理解 */
  gap: 20px;
  justify-items: center;   /* ← 新增：水平把子项居中放在格子里 */
  align-items: center;     /* ← 新增：垂直把子项居中放在格子里 */


  width: 100%;
  min-height: 100vh;
  background: #E0EAFC;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #CFDEF3, #E0EAFC);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #CFDEF3, #E0EAFC); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  padding: 60px 150px 150px 150px;

  position: relative;
}
</style>