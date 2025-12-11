import { defineStore } from 'pinia';
import { ref } from 'vue';

export const userStore = defineStore('navigator', () => {
    const user_id=ref(null);
    const user_name=ref("Melody_sensei");
    const profile=ref(null);
    function profile_set(url){
            profile.value=url;
            console.log(profile.value)
    }

    return {
        user_name,profile,profile_set
    };
});