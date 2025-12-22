import { defineStore } from 'pinia';
import { ref } from 'vue';

const LOCAL_USER_KEY = 'myapp_user'; // 可改为项目命名空间，避免 key 冲突
const LOCAL_TOKEN_KEY = 'myapp_token';

export const userStore = defineStore('navigator', () => {
    // 从 localStorage 恢复
    let storedUser = null;
    try {
        storedUser = JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
    } catch (e) {
        storedUser = null;
    }
    const user_id = ref(storedUser?.id ?? null);
    const user_name = ref(storedUser?.username ?? '');
    const profile = ref(storedUser?.profile ?? null);
    const accessToken = ref(localStorage.getItem(LOCAL_TOKEN_KEY) ?? null);

    function persistUser() {
        try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({
                id: user_id.value,
                username: user_name.value,
                profile: profile.value
            }));
        } catch (e) { /* ignore storage errors */ }
    }
    function clearPersistedUser() {
        try {
            localStorage.removeItem(LOCAL_USER_KEY);
        } catch (e) {}
    }
    function persistToken() {
        try {
            if (accessToken.value) localStorage.setItem(LOCAL_TOKEN_KEY, accessToken.value);
            else localStorage.removeItem(LOCAL_TOKEN_KEY);
        } catch (e) {}
    }

    function setUser(id, name, profileUrl) {
        user_id.value = id;
        user_name.value = name;
        profile.value = profileUrl;
        persistUser();
    }
    function setProfile(url){
        profile.value = url;
        persistUser();
    }
    function setToken(token){
        if(token) accessToken.value = token;
        else accessToken.value = null;
        persistToken();
    }
    function clearAll() {
        user_id.value = null;
        user_name.value = '';
        profile.value = null;
        accessToken.value = null;
        clearPersistedUser();
        try { localStorage.removeItem(LOCAL_TOKEN_KEY); } catch (e) {}
    }
    function getToken(){
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