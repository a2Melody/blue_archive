import { defineStore } from 'pinia';
import { ref } from 'vue';

export const userStore = defineStore('navigator', () => {
    const user_id=ref(null);
    const user_name=ref('');
    const profile=ref(null);

    function setUser(id, name, profileUrl) {
        user_id.value = id;
        user_name.value = name;
        profile.value = profileUrl;
    }
    function setProfile(url){
        profile.value=url;
    }
    return {
        user_id,
        user_name,
        profile,
        setUser,
        setProfile
    };
});