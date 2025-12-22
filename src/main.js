import './assets/styles/global.css'
import './assets/icons/iconfont.css'
import 'animate.css'
import { userStore } from '@/stores/UserStore.js';
import axios from 'axios';

import { createApp } from 'vue';
import {createPinia} from "pinia";
import App from './App.vue';
import router from './router'; // 你自己创建的 router 实例 (vue-router v4)

const app = createApp(App);
const pinia=createPinia();
app.use(pinia);
app.use(router); // <--- 关键：全局注册 vue-router 的组件 (RouterLink / RouterView)
app.mount('#app');

// 恢复并设置 axios 默认 Authorization（在 pinia 注册后再调用 store）
const store = userStore();
const token = store.getToken();
if (token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}
