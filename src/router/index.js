import { createRouter, createWebHistory } from 'vue-router';
import LoginView from "@/view/LoginView.vue";
import DiaryShowView from "@/view/DiaryShowView.vue";
import LazyingView from "@/view/LazyingView.vue";
import FirstFoldersView from "@/view/FirstFoldersView.vue";
import RegisterView from "@/view/RegisterView.vue";
import AddFirstFolderView from "@/view/AddFirstFolderView.vue";
import CroppingProfileView from "@/view/CroppingProfileView.vue";
import DiaryWritingView from "@/view/DiaryWritingView.vue";
import CollectionsView from "@/view/CollectionsView.vue";
import AddCollectionView from "@/view/AddCollectionView.vue";
import {userStore} from "@/stores/UserStore.js";

const routes = [
    { path: '/', name: 'Home', component: LoginView },
    { path: '/test', name: 'Test', component: LazyingView },
    { path: '/diary', name: 'Diary', component: DiaryShowView },
    { path: '/firstFolders', name: 'firstFolders', component: FirstFoldersView },
    { path: '/register', name: 'Register', component: RegisterView },
    { path: '/addFirstView', name: 'addFirstView', component: AddFirstFolderView },
    { path: '/cropProfile', name: 'cropProfile', component: CroppingProfileView },
    { path: '/diaryWriting', name: 'diaryWriting', component: DiaryWritingView },
    { path: '/diaryShow', name: 'diaryShow', component: DiaryShowView },
    { path: '/collectionsShow', name: 'collectionShow', component: CollectionsView },
    { path: '/addCollection', name: 'addCollection', component: AddCollectionView },
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