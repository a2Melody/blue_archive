<script setup>
import {computed} from "vue";
import axios from "axios";
import {userStore} from "@/stores/UserStore.js";
const emit=defineEmits(['update']);
const props=defineProps({
  name:String,
  id:Number,
  signature:String,
  avatarUrl:String,
  status:String
})

const user=userStore();
const isSelf = computed(() => String(props.id) === String(user.getUserId()));
const isDisabled = computed(() => props.status === 'ALREADY_FRIENDS' || props.status === 'PENDING_REQUEST' || isSelf.value);
const buttonText = computed(() =>
    isSelf.value ? '自己' :
        (props.status === 'ALREADY_FRIENDS' ? '已是好友' : (props.status === 'PENDING_REQUEST' ? '申请中' : ''))
);
async function addFriend(){
  if (props.status !== 'NOT_FRIENDS') return;
  const res = await axios.post('/api/chat/friends/request/send', {
    toUserId: props.id
  });
  emit('update');
}
</script>

<template>
  <div class="searchFriendItem">
    <img :src="props.avatarUrl" class="avatar" title="头像">
    <div class="data">
      <h5 class="name">{{props.name}}</h5>
      <span class="uid font_small_size">uid:{{props.id}}</span>
      <span class="signature font_small_size" style="margin-top: 2px;">{{props.signature??"对方未写个性签名desu"}}</span>
    </div>
    <button
        class="add_button"
        @click="addFriend"
        :disabled="isDisabled"
        :style="{ backgroundColor: isDisabled ? '#ccc' : 'pink', cursor: isDisabled ? 'not-allowed' : 'pointer' }"
    >
      <span v-if="!isDisabled" class="iconfont icon-tianjiahaoyou" style="font-size: 20px"></span>
      <span v-else>{{ buttonText }}</span>
    </button>
  </div>
</template>

<style scoped>
.searchFriendItem{
  display: flex;
  align-items: center;
  width: 100%;
  height: 80px;
  padding: 0.5rem 1.5rem;
  margin-bottom: 6px;
  border-radius: 7px;
  border:1px solid #DCDCDC;
}
.avatar{
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
}
.data{
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
}
.add_button{
  width: 58px;
  height: 35px;
  margin-left: auto;
  align-self: flex-end;
  background-color: pink;
  color: white;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
</style>