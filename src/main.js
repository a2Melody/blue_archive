import './assets/styles/global.css'
import './assets/icons/iconfont.css'
import 'animate.css'

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 你自己创建的 router 实例 (vue-router v4)

const app = createApp(App);
app.use(router); // <--- 关键：全局注册 vue-router 的组件 (RouterLink / RouterView)
app.mount('#app');
