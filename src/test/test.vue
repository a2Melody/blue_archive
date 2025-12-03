<template>
  <div class="uploader">
    <button @click="openFileChooser">选择图片</button>
    <input
        id="avatarChooser"
        ref="fileInput"
        type="file"
        accept="image/*"
        hidden
        @change="onFileChange"
    />

    <div v-if="preview" class="preview">
      <h4>预览</h4>
      <img :src="preview" alt="preview" />
      <p>{{ fileName }} · {{ humanSize(fileSize) }}</p>
      <button @click="clear">移除</button>
      <!-- 如果需要上传到服务器 -->
      <button @click="upload" :disabled="uploading">
        {{ uploading ? '上传中...' : '上传到服务器' }}
      </button>
    </div>

    <div v-else class="no-preview">
      <p>还没有选择图片</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import axios from 'axios' // 如需上传，确保已安装 axios：npm i axios

const fileInput = ref(null)
const preview = ref('')       // 存放图片 URL（object URL 或 data URL）
const fileName = ref('')
const fileSize = ref(0)
const uploading = ref(false)

// 打开隐藏的文件选择框
function openFileChooser() {
  fileInput.value && fileInput.value.click()
}

// 上次创建的 object URL，用于回收
let currentObjectUrl = null

function onFileChange(e) {
  const files = e.target.files
  if (!files || files.length === 0) return
  const file = files[0]

  // 可选：校验类型与大小
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    e.target.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) { // 例如 10MB 限制
    alert('文件过大（>10MB）')
    e.target.value = ''
    return
  }

  fileName.value = file.name
  fileSize.value = file.size

  // 推荐方法一：使用 object URL（高效）——可以实时预览，不占用大量内存
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
  currentObjectUrl = URL.createObjectURL(file)
  preview.value = currentObjectUrl

  fileInput.value._selectedFile = file
}

// 清理预览（并回收 object URL）
function clear() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
  preview.value = ''
  fileName.value = ''
  fileSize.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''     // 清空 input
    fileInput.value._selectedFile = null
  }
}

// 页面卸载时回收 URL 防止内存泄漏
onBeforeUnmount(() => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
  }
})



</script>

<style scoped>
.uploader { max-width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 6px; }
.preview img { max-width: 100%; height: auto; display: block; margin: 8px 0; border-radius: 4px; }
button { margin-right: 8px; }
.no-preview { color: #888; margin-top: 8px; }
</style>