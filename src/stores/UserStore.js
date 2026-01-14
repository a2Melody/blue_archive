import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import defaultPic from "@/assets/images/shiroko_profile.jpg";

export const userStore = defineStore('userStore', () => {
    const user_id = ref(null);
    const user_name = ref('');
    const profile = ref(null);           // 头像 URL
    const accessToken = ref(null);
    const signature = ref(null);
    const unreadMessageNumbers = ref(null);

    /** 兼容原有 setUser，手动设置用户信息 */
    function setUser(id, name, profileUrl, signatureValue = null) {
        user_id.value = id;
        user_name.value = name;
        profile.value = profileUrl;
        signature.value = signatureValue;
    }

    function getUserId() {
        return user_id.value;
    }
    function getUserName() {
        return user_name.value;
    }

    /** 获取头像：如果没有，返回默认图 */
    function getProfile() {
        if (!profile.value) return defaultPic;
        return profile.value;
    }

    /** 新增：统一叫 avatarUrl，方便别处用 */
    function getAvatarUrl() {
        return getProfile();
    }

    function getSignature() {
        return signature.value;
    }
    function getUnreadMessageNumbers() {
        return unreadMessageNumbers;
    }
    function getToken() {
        return accessToken.value;
    }
    function getDefaultProfile() {
        return defaultPic;
    }

    function setSignature(signature_value) {
        signature.value = signature_value;
    }
    function setUnreadMessageNumbers(number) {
        unreadMessageNumbers.value = number;
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
        signature.value = null;
        unreadMessageNumbers.value = null;
    }

    /**
     * 新增：从后端 /api/user/me 加载当前登录用户信息
     * 期望响应结构：{ code, data: { id, username, userAvatarUrl, personalSignature } }
     */
    async function loadCurrentUserInfo() {
        try {
            const res = await axios.get('/api/user/me', { withCredentials: true });
            const dto = res?.data?.data || res?.data;
            if (dto) {
                user_id.value = dto.id ? String(dto.id) : null;
                user_name.value = dto.username || '';
                profile.value = dto.userAvatarUrl || null;
                signature.value = dto.personalSignature || null;
            }
            return dto;
        } catch (e) {
            console.warn('[UserStore] loadCurrentUserInfo failed', e?.response?.data || e?.message);
            return null;
        }
    }

    return {
        accessToken,
        // 原有
        setUser,
        getUserId,
        getUserName,
        getSignature,
        getUnreadMessageNumbers,
        setUnreadMessageNumbers,
        getProfile,
        setProfile,
        setToken,
        setSignature,
        getToken,
        getDefaultProfile,
        clearAll,
        // 新增
        getAvatarUrl,
        loadCurrentUserInfo,
    };
});