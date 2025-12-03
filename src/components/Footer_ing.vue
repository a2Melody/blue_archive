<script setup lang="js">
import {ref} from "vue";

const member1=ref(true);

</script>

<template>
  <div class="footer_container">
    <ul class="members">
      <li class="title">开发人员</li>

      <li style="margin-left:20px; margin-top:3px">
        <transition mode="out-in"
            enter-active-class="animate__animated animate__backInLeft slow-anim-out"
            leave-active-class="animate__animated animate__backOutLeft slow-anim-in"
        >
          <span v-if="member1" key="member1" @click="member1=!member1" class="member1">Melody_sensei</span>
          <span v-else key="member1_words" @click="member1=!member1" class="member1_words">要玩一辈子的blue archive</span>
        </transition>
      </li>
        <li class="member2" style="margin-left: 20px">NzuCRAS</li>
        <li class="member3" style="margin-left: 20px">小白</li>
    </ul>

  </div>
</template>

<style scoped>
  .footer_container{
    user-select: none;
    width: 100%;
    height: 144px;
    position: relative;
    background-color: #6BCBFF;
    border-radius: 0 0 14px 14px;
    padding-left: 106px;
    padding-top: 20px;
  }
  .members{
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* 关键：子项按内容宽度展示，不拉伸 */
    gap: 7px;                 /* 可选：设置行间距，替代 margin-top */
    width: 300px;
    height: 100px;
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
  }
  .member1:hover,.member1_words:hover{
    color: #ffd1de;
    cursor: pointer;
  }
  .member1_words,.member1{
    display: inline-block;          /*动画效果出现的话得该标签为display:inline-block*/
  }
  .member2:hover{
    color: #27f3b4;
    cursor: pointer;
  }
  .member3:hover{
    color: black;
    cursor: pointer;
  }
  .slow-anim-out {
    --animate-duration: 2.4s;
    animation-timing-function:ease ;
  }
  .slow-anim-in {
    --animate-duration: 2.4s;
    animation-timing-function:ease-out ;
  }
</style>