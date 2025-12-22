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
];
const router = createRouter({ history: createWebHistory(), routes });
export default router;