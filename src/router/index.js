import { createRouter, createWebHistory } from 'vue-router';
import LoginView from "@/view/LoginView.vue";

const routes = [{ path: '/', name: 'Home', component: LoginView }];
const router = createRouter({ history: createWebHistory(), routes });
export default router;