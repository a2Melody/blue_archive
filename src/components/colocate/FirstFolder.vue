<script setup>

</script>

<template>
  <div class="container">
    <div class="img_container">
      <div class="img_bg"></div>
    </div>
    <div class="input_container">
      <div class="icons">
        <span class="iconfont icon-xiaoyuanquan1 icon"></span>
        <span class="iconfont icon-jiahao5 icon" ></span>
        <span class="iconfont icon-closel icon" style="font-size: 11px;"></span>
        <span class="iconfont icon-xingzhuang-sanjiaoxing1 icon" ></span>
      </div>

      <span class="folder_name">默认收藏夹1</span>
    </div>
  </div>
</template>

<style scoped>
.container{
  position: relative;
  margin-top: 80px;
  margin-left: 200px;
  width: 420px;
  height: 210px;
  user-select: none;
}
.container:hover{
  cursor: pointer;
}
.img_container{
  width: 420px;
  height: 210px;
  transform: skewX(-20deg);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .3);
  border-radius: 6px;
  overflow: hidden;
}
.img_bg{
  position: absolute;
  width: calc(100% + 77px);        /* = container width + offset */
  height: 100%;
  left: -77px;                     /* = - height * tan(20deg) */   /* = - height * tan(20deg) */
  background-image: url("src/assets/images/shiroko.png");
  background-size: cover;            /* 保持比例、不变形 */
  background-repeat: no-repeat;
  background-position: center center;

  transform: skewX(20deg);           /* 抵消外层的 -20deg */
  transform-origin: top left;          /* 抵消外层的 -20deg */
}

/*一级收藏夹名字和小图标的容器*/
.input_container{
  position: absolute;
  padding-left: 30px;
  bottom: -15px;
  right: 0;
  z-index: 2;
  width: 240px;
  height: 40px;
  color: black;
  background-color: white;
  transform: skewX(-20deg);
  border-radius: 2px;
}
.input_container span{
  transform: skewX(20deg);
}
.icon{
  float: left;
  width: 12px;
  height: 12px;
  font-size: 10px;
  color: #c5c5c5;
}
/*放全部icon的容器*/
.icons{
  display: inline-block;
  padding-top: 2px;
  position: absolute;
  z-index: 5;
  bottom: 0;
  left: 17px;
  height: 15px;
  width: 50px;
}
.folder_name{
  position: absolute;
  right: 60px;
  bottom: 9px;
}


/* 右上小三角（在 top-right） */
.input_container::before{
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top: 6px solid #c5c5c5;
  border-right: 6px solid #c5c5c5;
  border-left: 6px solid transparent;
  border-bottom: 6px solid transparent;
  transform: translate(0);
  transition: transform 0.8s ease;
  z-index: 3;
  border-radius: 2px;
}
/* 左下小三角（在 bottom-left） */
.input_container::after{
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-right: 6px solid transparent;
  border-left: 6px solid #c5c5c5;
  border-bottom: 6px solid #c5c5c5;
  z-index: 3;
  transform: translate(0);
  transition: transform 0.8s ease;
  border-radius: 2px;
}
/* 伪元素移动使用 translate3d（有时更稳定），并确保整数像素值 */
.input_container::before,
.input_container::after {
  transition: transform 0.8s ease;
  pointer-events: none;
}
/* hover 用整数位移，避免半像素 */
.container:hover .input_container::before{
  transform: translate3d(15px, -12px, 0);
}
.container:hover .input_container::after{
  transform: translate3d(-15px, 12px, 0);
}
</style>