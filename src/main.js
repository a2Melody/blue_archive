import './assets/styles/global.css'
import './assets/icons/iconfont.css'
import 'animate.css'

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import { userStore } from '@/stores/UserStore.js';

// Element Plus 全量引入（最简单用法）
// 如果你已经在别处用按需引入，可以删掉这两行，保持你的原有配置。
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount('#app');

// 请求拦截器：自动注入 Authorization
axios.interceptors.request.use(
    (config) => {
        const store = userStore();
        const token = store.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);