<script setup lang="js">
import {ref} from "vue";

const member1=ref(true);
const member2=ref(true);
const member3=ref(true);
</script>

<template>
  <div class="footer_container">
    <ul class="members">
      <li class="title" data-tip=":点击下方的名字有小彩蛋">开发人员</li>

      <li style="margin-left:20px; margin-top:0px">
        <transition mode="out-in"
            enter-active-class="animate__animated animate__lightSpeedInRight  slow-anim-out"
            leave-active-class="animate__animated animate__lightSpeedOutLeft slow-anim-in">
          <span v-if="member1" key="member1" @click="member1=!member1" class="member1" title="点击有小彩蛋">Melody_sensei</span>
          <span v-else key="member1_words" @click="member1=!member1" class="member1_words">要玩一辈子的blue archive</span>
        </transition>
      </li>
      <li style="margin-left: 20px">
        <transition mode="out-in"
                    enter-active-class="animate__animated animate__rotateInDownLeft  quick-anim-out"
                    leave-active-class="animate__animated animate__rotateOutDownRight quick-anim-in">
          <span v-if="member2" key="member2" @click="member2=!member2" class="member2" >NzuCRAS</span>
          <span v-else key="member2_words" @click="member2=!member2" class="member2_words">兵败如山倒desuwa</span>
        </transition>
      </li>
      <li class="member3" style="margin-left: 20px">
        <transition mode="out-in"
                    enter-active-class="animate__animated animate__bounceIn  slow-anim-out"
                    leave-active-class="animate__animated animate__bounceOut slow-anim-in">
          <span v-if="member3" key="member3" @click="member3=!member3" class="member3" >小白</span>
          <span v-else key="member3_words" @click="member3=!member3" class="member3_words">木有什么想说的，你们说就好</span>
        </transition>
      </li>
    </ul>

  </div>
</template>

<style scoped>
  .footer_container{
    user-select: none;
    width: 100%;
    height: 160px;
    position: relative;
    background-color: #6BCBFF;
    border-radius: 0 0 14px 14px;
    padding-left: 106px;
    padding-top: 20px;
  }
  .members{
    display: flex;
    flex-direction: column;
/*    align-items: flex-start; !* 关键：子项按内容宽度展示，不拉伸 *!*/
    gap: 7px;                 /* 可选：设置行间距，替代 margin-top */
    width: 270px;
    height: 120px;
    color: white;
    font-size: 14px;
    font-weight: 600;
  }
  .members li {
    display: inline-block;
    width: auto;
    height: 20px;
    line-height: 20px;
    padding: 0 6px;
/*    background-color: pink;*/
  }
  .member1:hover,.member1_words:hover{
    color: #ffd1de;
    cursor: pointer;
  }
  .member1_words,.member1,.member2,.member2_words,.member3,.member3_words{
    display: inline-block;          /*动画效果出现的话得该标签为display:inline-block*/
  }
  .member2:hover,.member2_words:hover{
    color: #27f3b4;
    cursor: pointer;
  }
  .member3:hover{
    color: black;
    cursor: pointer;
  }
  .slow-anim-out {
    --animate-duration: 1s;
    animation-timing-function:ease ;
  }
  .slow-anim-in {
    --animate-duration: 1s;
    animation-timing-function:ease ;
  }
  .quick-anim-out {
    --animate-duration: .4s;
    animation-timing-function:ease ;
  }
  .quick-anim-in {
    --animate-duration: .4s;
    animation-timing-function:ease ;
  }

  .members .title{
    position: relative;
    width: 260px;
    height: 30px;
    line-height: 30px;
/*    background-color: pink;*/
  }
  .title::after{
    content: attr(data-tip);            /* 从 data-tip 读取文本 */
    position: absolute;
    opacity: 0;
    font-size: 14px;
    transition: opacity .8s ease
  }
  .members:hover .title::after{
    opacity: 1;
  }
  /*进来: animate__rotateInDownLeft  出去:animate__rotateOutDownRight*/
</style>