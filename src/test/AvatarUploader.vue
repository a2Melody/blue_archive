<script setup>
import { ref } from 'vue'
import CropperDialog from './CropperDialog.vue'

const avatarSrc = ref('')       // 显示裁剪后的结果（dataURL）
const showDialog = ref(false)   // 控制是否显示裁剪子组件
const fileToCrop = ref(null)    // 传给子组件的原始文件

function openFileChooser() {
  document.getElementById('avatarChooser').click()
}
function onFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return
  fileToCrop.value = f
  showDialog.value = true
  e.target.value = '' // 允许选择同一文件再次触发
}
function handleDone(dataUrl, blob) {
  avatarSrc.value = dataUrl      // 立刻显示裁剪结果
  // TODO: 需要上传时在这里用 blob 走 FormData 上传
  showDialog.value = false
}
</script>

<template>
  <!-- 触发选择文件 -->
  <button @click="openFileChooser">选择图片</button>

  <input id="avatarChooser" type="file" accept="image/*" hidden @change="onFileChange" />

  <!-- 展示裁剪后的结果 -->
  <div v-if="avatarSrc">
    <p>裁剪结果：</p>
    <img :src="avatarSrc" alt="avatar result" />
  </div>

  <!-- 子组件：裁剪对话框（无样式版本） -->
  <CropperDialog
      v-if="showDialog"
      :file="fileToCrop"
      :size="1000"
      :circle="true"
      @done="handleDone"
      @cancel="showDialog = false"
  />
</template>