<template>
  <div class="cropper-uploader">
    <div class="controls">
      <label class="btn">
        选择图片
        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="onFileChange"
            hidden
        />
      </label>

      <button class="btn" @click="rotate(-90)" :disabled="!cropper">旋转左</button>
      <button class="btn" @click="rotate(90)" :disabled="!cropper">旋转右</button>
      <button class="btn" @click="zoom(0.1)" :disabled="!cropper">放大</button>
      <button class="btn" @click="zoom(-0.1)" :disabled="!cropper">缩小</button>
      <button class="btn" @click="reset" :disabled="!cropper">重置</button>
      <button class="btn primary" @click="cropImage" :disabled="!cropper">裁剪并显示</button>
    </div>

    <div class="main">
      <div class="crop-area" v-if="imageSrc">
        <!-- Cropper.js 操作的 img 元素 -->
        <img ref="image" :src="imageSrc" alt="待裁剪图片" />
      </div>

      <div class="placeholder" v-else>
        请选择图片后开始裁剪
      </div>

      <div class="result">
        <h4>裁剪结果预览</h4>
        <div v-if="croppedUrl" class="preview">
          <img :src="croppedUrl" alt="裁剪结果" />
        </div>
        <div v-else class="no-preview">等待裁剪结果...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const fileInput = ref(null)
const image = ref(null)
const cropper = ref(null)

const imageSrc = ref('')      // blob:... 或 data:...
const croppedUrl = ref('')    // 裁剪后显示用的 blob URL

let lastImageObjectUrl = null
let lastCroppedObjectUrl = null

function revokeUrl(urlRefName) {
  try {
    if (urlRefName && typeof urlRefName === 'string' && urlRefName.startsWith('blob:')) {
      URL.revokeObjectURL(urlRefName)
    }
  } catch (e) {
    // ignore
  }
}

// 当用户选择文件
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    e.target.value = ''
    return
  }

  // 释放上一次的 image URL
  if (lastImageObjectUrl) {
    revokeUrl(lastImageObjectUrl)
    lastImageObjectUrl = null
  }
  // 释放上一次裁剪预览（如果你想在选择新图时清空）
  if (lastCroppedObjectUrl) {
    revokeUrl(lastCroppedObjectUrl)
    lastCroppedObjectUrl = null
    croppedUrl.value = ''
  }

  const url = URL.createObjectURL(file)
  lastImageObjectUrl = url
  imageSrc.value = url

  // 清空 input 以便后续选择同一文件也能触发 change
  e.target.value = ''
}

// 观察 imageSrc，image 元素加载后初始化 cropper
watch(imageSrc, async (newSrc) => {
  // 销毁旧 cropper（若有）
  if (cropper.value) {
    try { cropper.value.destroy() } catch (e) {}
    cropper.value = null
  }

  if (!newSrc) return

  // 等待 img 元素渲染并加载完成，再初始化 Cropper（确保 image.value 已存在）
  await nextTick()
  const imgEl = image.value
  if (!imgEl) return

  // 若图片未完全加载，等 load 事件后再初始化
  if (!imgEl.complete) {
    imgEl.addEventListener('load', () => {
      initCropper(imgEl)
    }, { once: true })
  } else {
    initCropper(imgEl)
  }
})

function initCropper(imgEl) {
  // 默认选项，你可以按需调整
  cropper.value = new Cropper(imgEl, {
    viewMode: 1,
    autoCropArea: 0.8,
    movable: true,
    zoomable: true,
    scalable: false,
    rotatable: true,
    responsive: true,
    background: true,
  })
}

function rotate(deg) {
  if (!cropper.value) return
  cropper.value.rotate(deg)
}

function zoom(ratio) {
  if (!cropper.value) return
  cropper.value.zoom(ratio)
}

function reset() {
  if (!cropper.value) return
  cropper.value.reset()
}

// 裁剪并把结果显示到另一个 div（使用 blob URL）
function cropImage() {
  if (!cropper.value) return
  // 你可以通过设置 width/height 来控制输出尺寸
  const canvas = cropper.value.getCroppedCanvas({
    // width: 800, height: 600, // 可根据需要设置输出尺寸
    imageSmoothingQuality: 'high',
  })
  if (!canvas) return

  // 释放上一次的裁剪结果 URL
  if (lastCroppedObjectUrl) {
    revokeUrl(lastCroppedObjectUrl)
    lastCroppedObjectUrl = null
    croppedUrl.value = ''
  }

  // 使用 toBlob 避免内存问题（尤其是大图）
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    lastCroppedObjectUrl = url
    croppedUrl.value = url
  }, 'image/png', 0.92)
}

// 清理资源
onBeforeUnmount(() => {
  if (cropper.value) {
    try { cropper.value.destroy() } catch (e) {}
    cropper.value = null
  }
  if (lastImageObjectUrl) {
    revokeUrl(lastImageObjectUrl)
    lastImageObjectUrl = null
  }
  if (lastCroppedObjectUrl) {
    revokeUrl(lastCroppedObjectUrl)
    lastCroppedObjectUrl = null
  }
})
</script>

<style scoped>
.cropper-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #222;
  font-family: sans-serif;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  user-select: none;
}

.btn.primary {
  background: #2e6df6;
  color: #fff;
  border-color: #2e6df6;
}

.main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* 裁剪区域 */
.crop-area {
  width: 520px;
  height: 360px;
  border: 1px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f7f7f7;
}

.crop-area img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

/* 结果区域 */
.result {
  min-width: 240px;
}

.preview img {
  max-width: 320px;
  display: block;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.placeholder, .no-preview {
  color: #888;
  padding: 18px;
  border: 1px dashed #eee;
}
</style>