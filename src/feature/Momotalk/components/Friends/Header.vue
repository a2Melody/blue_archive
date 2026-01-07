<script setup>
const emit = defineEmits(['select','exit']);
const props = defineProps({ active: String });
</script>

<template>
  <div class="head_container">
    <button class="exit_button" @click="emit('exit')"><span class="iconfont icon-chacha" style="font-size: 22px;"></span></button>
    <div class="word">
      <span class="iconfont icon-tiaopifang" style="font-size: 22px;margin-right: 5px"></span>
      <span style="font-size: 16px;font-weight: 600">好友</span>
    </div>
    <div class="buttons">
      <button :class="{ active: props.active === 'search' }"
              @click="emit('select', 'search')">
        <span class="iconfont icon-sousuo4" style="margin-right: 7px"></span>搜寻
      </button>
      <button :class="{ active: props.active === 'agree' }"
              @click="emit('select', 'agree')">
        <span class="iconfont icon-weibiaoti--" style="margin-right: 8px"></span>接收的申请
      </button>
    </div>
  </div>
</template>

<style scoped>
.head_container{
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 16%;
  padding: 10px 24px 0 24px;
  background-color: pink;
  border-radius: 10px 10px 0 0;
}
.exit_button{
  width: 24px;
  height: 24px;
  color: white;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
.word{
  display: flex;
  width: 100%;
  height: 40%;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 20px;
}

.buttons{
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}
.buttons button{
  color: white;
  width: 50%;
  height: 100%;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px 6px 0 0 ;
  transition: all 0.5s ease;
  cursor: pointer;
  padding: 10px;
}
.buttons button.active{
  background-color: white;
  color: pink;
}

</style>