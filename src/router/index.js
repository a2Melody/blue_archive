import { createRouter, createWebHistory } from 'vue-router';
import Login from "@/feature/Login/Login.vue";
import Diaries from "@/feature/Diary/Diaries.vue";
import Lazying from "@/feature/Lazy/Lazying.vue";
import FirstFolders from "@/feature/FirstFolder/FirstFolders.vue";
import Register from "@/feature/Register/Register.vue";
import AddFirstFolder from "@/feature/FirstFolder/AddFirstFolder.vue";
import CroppingProfile from "@/feature/Profile/CroppingProfile.vue";
import DiaryWriting from "@/feature/Diary/DiaryWriting.vue";
import Collections from "@/feature/Collection/Collections.vue";
import AddCollectionvue from "@/feature/Collection/AddCollection.vue";
import {userStore} from "@/stores/UserStore.js";
import Test from "@/test/Test.vue";

const routes = [
    { path: '/', name: 'Home', component:Login },
    { path: '/test', name: 'Test', component: Lazying },
    { path: '/diary', name: 'Diary', component: Diaries },
    { path: '/firstFolders', name: 'firstFolders', component: FirstFolders },
    { path: '/register', name: 'Register', component: Register },
    { path: '/addFirstView', name: 'addFirstView', component: AddFirstFolder },
    { path: '/cropProfile', name: 'cropProfile', component: CroppingProfile },
    { path: '/diaryWriting', name: 'diaryWriting', component: DiaryWriting },
    { path: '/diaryShow', name: 'diaryShow', component: Diaries },
    { path: '/collectionsShow', name: 'collectionShow', component: Collections },
    { path: '/addCollection', name: 'addCollection', component: AddCollectionvue },
];
const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach((to, from, next) => {
    // ✅ 保持在这里调用，这是安全的，因为此时 Pinia 已经随应用启动了
    const user = userStore();

    // 如果去往的页面不是登录页/注册页，且没有 token
    // 建议加上对注册页 '/register' 的排除，否则新用户无法注册
    if (to.path !== '/' && to.path !== '/register' && !user.accessToken) {
        alert("请先登录(๑╹◡╹๑)");
        next('/');
    } else {
        next();
    }
});
export default router;