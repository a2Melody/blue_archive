import { defineStore } from 'pinia';
import { ref } from 'vue';

export const userStore = defineStore('userStore', () => {
    const user_id = ref(null);
    const user_name = ref('');
    const profile = ref(null);
    const accessToken = ref(null);
    const messages=ref(null);

    function setUser(id, name, profileUrl) {
        user_id.value = id;
        user_name.value = name;
        profile.value = profileUrl;
    }
    function getUserName(){
        return user_name.value;
    }
    function getUserId(){
        return user_id.value;
    }
    function getMessages(){
        return messages;
    }
    function getProfile(){
        return profile.value;
    }
    function setProfile(url) {
        profile.value = url;
    }
    function setToken(token) {
        accessToken.value = token || null;
    }
    function getToken() {
        return accessToken.value;
    }

    function clearAll() {
        user_id.value = null;
        user_name.value = '';
        profile.value = null;
        accessToken.value = null;
    }

    return {
        accessToken,
        profile,
        setUser,
        getUserId,
        getUserName,
        getMessages,
        getProfile,
        setProfile,
        setToken,
        getToken,
        clearAll
    };
});