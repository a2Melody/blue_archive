<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Cropper from 'cropperjs'


const props = defineProps({
  file: { type: File, required: true },
  size: { type: Number, default: 256 },      // 输出头像边长（正方形）
  circle: { type: Boolean, default: true },  // 是否导出真正圆形透明 PNG
})

const emit = defineEmits(['done', 'cancel'])

const imgUrl = ref('')
const imgEl = ref(null)
let cropper = null

watch(() => props.file, (f) => {
  if (f) imgUrl.value = URL.createObjectURL(f)
}, { immediate: true })

onMounted(() => {
  cropper = new Cropper(imgEl.value, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 1,
    dragMode: 'move',
    movable: true,
    zoomable: true,
  })
})

onBeforeUnmount(() => {
  cropper && cropper.destroy()
  cropper = null
  if (imgUrl.value) URL.revokeObjectURL(imgUrl.value)
})

function confirmCrop() {
  // 先得到正方形裁剪结果
  const squareCanvas = cropper.getCroppedCanvas({
    width: props.size,
    height: props.size,
    imageSmoothingQuality: 'high',
  })

  if (!props.circle) {
    const dataUrl = squareCanvas.toDataURL('image/png')
    squareCanvas.toBlob(blob => emit('done', dataUrl, blob), 'image/png')
    return
  }

  // 再裁成真正圆形透明 PNG
  const circleCanvas = document.createElement('canvas')
  circleCanvas.width = props.size
  circleCanvas.height = props.size
  const ctx = circleCanvas.getContext('2d')
  ctx.beginPath()
  ctx.arc(props.size/2, props.size/2, props.size/2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(squareCanvas, 0, 0)
  const dataUrl = circleCanvas.toDataURL('image/png')
  circleCanvas.toBlob(blob => emit('done', dataUrl, blob), 'image/png')
}
</script>

<template>
  <!-- 极简版本：一张图片 + 两个按钮 -->
  <div>
    <img :src="imgUrl" ref="imgEl" alt="to-crop" />
    <div>
      <button @click="$emit('cancel')">取消</button>
      <button @click="confirmCrop">确定</button>
    </div>
  </div>
</template>