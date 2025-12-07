<template>
  <div class="cropper-demo">
    <input type="file" accept="image/*" @change="onFileChange" />

    <div class="containers">
      <div class="preview-container">
        <h3>原图（可裁剪）</h3>
        <div class="image-wrapper">
          <img ref="sourceImgRef" :src="sourceUrl" alt="待裁剪图片" @load="initCropper" />
        </div>
        <div class="controls" v-if="isReady">
          <button @click="zoomIn">放大</button>
          <button @click="zoomOut">缩小</button>
          <button @click="rotateLeft">左旋90°</button>
          <button @click="rotateRight">右旋90°</button>
          <button @click="reset">重置</button>
          <button class="primary" @click="doCrop">裁剪并生成（可下载）</button>
        </div>
      </div>

      <div class="result-container">
        <h3>裁剪结果（实时预览）</h3>
        <!-- 使用 Cropper 的 preview 功能：这个容器将实时显示裁剪框内容 -->
        <div class="image-wrapper result">
          <div class="result-preview"></div>
        </div>

        <!-- 这里是点击“裁剪并生成”后的最终导出结果（可下载） -->
        <div class="final-output" v-if="croppedUrl">
          <h4>导出结果</h4>
          <img :src="croppedUrl" alt="裁剪后的图片" />
          <div class="result-actions">
            <a :href="croppedUrl" download="cropped.png">下载裁剪图片</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
// 建议继续使用 v1.6.2 的 ESM 入口
import Cropper from 'cropperjs/dist/cropper.esm.js'
import 'cropperjs/dist/cropper.css'

const sourceImgRef = ref(null)
const sourceUrl = ref('')
const croppedUrl = ref('')
const cropperRef = ref(null)
const isReady = ref(false)

const revokeIfNeeded = (url) => {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
}

const destroyCropper = () => {
  isReady.value = false
  if (cropperRef.value) {
    cropperRef.value.destroy()
    cropperRef.value = null
  }
}

const initCropper = () => {
  if (!sourceImgRef.value || !sourceUrl.value) return
  destroyCropper()
  const imgEl = sourceImgRef.value
  if (!(imgEl instanceof HTMLImageElement)) {
    console.error('sourceImgRef.value 不是 HTMLImageElement', imgEl)
    return
  }
  cropperRef.value = new Cropper(imgEl, {
    viewMode: 1,
    dragMode: 'move',
    aspectRatio: NaN,
    autoCropArea: 0.8,
    background: true,
    zoomOnWheel: true,
    movable: true,
    scalable: true,
    rotatable: true,
    responsive: true,
    checkOrientation: true,
    guides: true,
    center: true,
    highlight: true,
    // 关键：开启预览容器（可以是选择器、元素、节点列表或数组）
    preview: '.result-preview',
    ready() {
      isReady.value = true
    },
  })
}

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  revokeIfNeeded(croppedUrl.value)
  croppedUrl.value = ''

  revokeIfNeeded(sourceUrl.value)
  sourceUrl.value = URL.createObjectURL(file)
}

const doCrop = () => {
  const cropper = cropperRef.value
  if (!cropper || !isReady.value) return
  // 导出最终结果（用于下载或上传）
  const canvas = cropper.getCroppedCanvas({ fillColor: '#fff' })
  if (!canvas) return
  canvas.toBlob((blob) => {
    if (!blob) return
    revokeIfNeeded(croppedUrl.value)
    croppedUrl.value = URL.createObjectURL(blob)
  }, 'image/png', 0.92)
}

const zoomIn = () => isReady.value && cropperRef.value?.zoom(0.1)
const zoomOut = () => isReady.value && cropperRef.value?.zoom(-0.1)
const rotateLeft = () => isReady.value && cropperRef.value?.rotate(-90)
const rotateRight = () => isReady.value && cropperRef.value?.rotate(90)
const reset = () => isReady.value && cropperRef.value?.reset()

onBeforeUnmount(() => {
  destroyCropper()
  revokeIfNeeded(sourceUrl.value)
  revokeIfNeeded(croppedUrl.value)
})
</script>

<style scoped>
.cropper-demo { display: flex; flex-direction: column; gap: 16px; }
.containers { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.preview-container, .result-container { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; }

.image-wrapper {
  position: relative;
  width: 100%;
  min-height: 300px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background-color: #f8fafc;
}
.image-wrapper img { max-width: 100%; display: block; }

.image-wrapper.result { min-height: 220px; }

/* 预览容器样式：Cropper 会在里面放置克隆图像并应用 transform 实现实时预览 */
.result-preview {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

/* 最终导出结果区域（点击按钮后显示） */
.final-output { margin-top: 12px; }
.final-output img { max-width: 100%; display: block; border: 1px solid #e5e7eb; border-radius: 8px; }
.result-actions { margin-top: 10px; }
.result-actions a { color: #2563eb; text-decoration: none; }
</style>