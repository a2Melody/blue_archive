import { createRouter, createWebHistory } from 'vue-router';
import LoginView from "@/view/LoginView.vue";
import DiaryShowView from "@/view/DiaryShowView.vue";
import Register from "@/components/Register.vue";
import LazyingView from "@/view/LazyingView.vue";
import FirstFoldersView from "@/view/FirstFoldersView.vue";

const routes = [
    { path: '/', name: 'Home', component: LoginView },
    { path: '/test', name: 'Test', component: LazyingView },
    { path: '/diary', name: 'Diary', component: DiaryShowView },
    { path: '/firstFolders', name: 'firstFolders', component: FirstFoldersView },
    { path: '/register', name: 'Register', component: Register },
];
const router = createRouter({ history: createWebHistory(), routes });
export default router;