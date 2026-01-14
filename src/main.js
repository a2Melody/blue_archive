import './assets/styles/global.css'
import './assets/icons/iconfont.css'
import 'animate.css'
import { userStore } from '@/stores/UserStore.js';
import axios from 'axios';

import { createApp } from 'vue';
import {createPinia} from "pinia";
import App from './App.vue';
import router from './router';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
const pinia=createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 请求拦截器：注入 Authorization
axios.interceptors.request.use(config => {
    const store = userStore();
    const token = store.getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// **这里新增：先尝试加载当前用户信息，再挂载应用**
const store = userStore();
store.loadCurrentUserInfo().finally(() => {
    app.mount('#app');
});