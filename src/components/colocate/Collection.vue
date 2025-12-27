<script setup>

const props=defineProps({
  id:{
    type:Number,
  },
  bgUrl:{
    type:String,
    required:true
  },
  info:{
    type:String,
    default:""
  },
  showDelete: Boolean
});
const emit = defineEmits(['delete-item']);

function onClickDelete() {
  emit('delete-item', props.id); // 把要删除的 id 传回给父组件
}

</script>

<template>
  <div class="collection_container">
    <div ref="jianhao" class="container" v-show="props.showDelete" @click.stop="onClickDelete">
      <span class="jianhao iconfont icon-jianhao3" ></span>
    </div>
    <img class="bg_img" :src="props.bgUrl" alt="" :style="!props.bgUrl ? { border: 'none' } : {}"/>
    <div class="info">
      <div class="info_text">{{ props.info }}</div>
    </div>
  </div>
</template>

<style scoped>
/* .collection_container：去掉固定尺寸，改为内容自适应收缩 */
.collection_container{
  display: inline-flex;       /* ← 改为 inline-flex，使容器随内容收缩 */
  align-items: center;
  justify-content: center;

  position: relative;
  width: max-content;         /* shrink-to-fit，但受下面的 max-width 限制 */
  max-width: 100%;            /* 不会超出父格子的可用宽度 */
  user-select: none;
}

/* .bg_img：改为等比例显示（不裁切），并保留白色边框 */
.bg_img{
  display: block;
  width: auto;           /* ← 新增：优先使用图片自身宽度，受容器 max-width 限制 */
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
  border: 2px solid white;
  border-radius: 8px;
  z-index: 1;
}

.info{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 8px;

  background-color: rgba(0,0,0,0); /* 初始完全透明背景 */
  transition: background-color .6s ease;
  z-index: 2;

  white-space: pre-wrap;    /* ← 新增：保留换行符并自动换行 */
}
/* 单独控制文字颜色的透明度（用 rgba 实现） */
.info_text{
  width: 100%;
  height: 100%;
  color: rgba(255,255,255,0); /* 初始文字透明 */

  transition: color .6s ease;
  padding: 25px;

}

/* hover 时分别改变背景和文字 alpha */
.collection_container:hover .info{
  background-color: rgba(0,0,0,0.4); /* 背景 40% 不透明 */
}
.collection_container:hover .info .info_text{
  color: rgba(255,255,255,1); /* 文字完全不透明 */
}

.container{
  position: absolute;     /* 改成fixed*/
  left: 5px;
  top: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #bababa;
  border-radius: 50%;
  z-index: 5;
  user-select: none;
}
.jianhao{
  display: inline-block;
  color: white;
  font-size: 14px;
}
.container:hover{
  cursor: pointer;
}
</style>