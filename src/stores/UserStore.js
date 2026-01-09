import { defineStore } from 'pinia';
import { ref } from 'vue';
import mika from "@/assets/images/mika_profile.jpg"

export const userStore = defineStore('userStore', () => {
    const user_id = ref(null);
    const user_name = ref('');
    const profile = ref(null);
    const accessToken = ref(null);
    const signature=ref(null);
    const unreadMessageNumbers=ref(null);

    function setUser(id, name, profileUrl) {
        user_id.value = id;
        user_name.value = name;
        profile.value = profileUrl;
        signature.value=signature;
    }
    function getUserId(){
        return user_id.value;
    }
    function getUserName(){
        return user_name.value;
    }
    function getProfile(){
        if(profile===null||profile.value===null)return mika;
        return profile.value;
    }
    function getSignature(){
        return signature.value;
    }
    function getUnreadMessageNumbers(){
        return unreadMessageNumbers;
    }
    function getToken() {
        return accessToken.value;
    }
    function getDefaultProfile(){
        return mika;
    }

    function setUnreadMessageNumbers(number){
        unreadMessageNumbers.value=number;
    }
    function setProfile(url) {
        profile.value = url;
    }
    function setToken(token) {
        accessToken.value = token || null;
    }


    function clearAll() {
        user_id.value = null;
        user_name.value = '';
        profile.value = null;
        accessToken.value = null;
    }


    return {
        accessToken,
        setUser,
        getUserId,
        getUserName,
        getSignature,
        getUnreadMessageNumbers,
        setUnreadMessageNumbers,
        getProfile,
        setProfile,
        setToken,
        getToken,
        getDefaultProfile,
        clearAll
    };
});