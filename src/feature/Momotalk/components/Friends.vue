<script setup>
import PhoneContainer from "@/feature/Momotalk/components/Friends/PhoneContainer.vue";
const emit=defineEmits(['close'])

</script>

<template>
  <PhoneContainer @close="emit('close')"></PhoneContainer>
</template>

<style scoped>

</style>