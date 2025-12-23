import { defineStore } from 'pinia';
import { ref } from 'vue';

export const userStore = defineStore('userStore', () => {
    // 1. 直接初始化响应式引用，不再从 localStorage 读取
    const user_id = ref(null);
    const user_name = ref('');
    const profile = ref(null);
    const accessToken = ref(null);

    // 2. 更新状态的方法（删除了所有调用 persist 的逻辑）
    function setUser(id, name, profileUrl) {
        user_id.value = id;
        user_name.value = name;
        profile.value = profileUrl;
    }

    function setProfile(url) {
        profile.value = url;
    }

    function setToken(token) {
        accessToken.value = token || null;
    }

    // 3. 清理方法（只清理内存中的变量）
    function clearAll() {
        user_id.value = null;
        user_name.value = '';
        profile.value = null;
        accessToken.value = null;
    }

    function getToken() {
        return accessToken.value;
    }

    return {
        user_id,
        user_name,
        profile,
        setUser,
        setProfile,
        setToken,
        getToken,
        clearAll
    };
});