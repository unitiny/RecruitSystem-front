<script setup lang="ts">
import {defineExpose} from "vue";
import {Vue3Lottie} from "vue3-lottie"
import animationData from "@/assets/lottie/right.json"

function updateDemand(dm) {
  // dm.type = demand.value.type
}

defineExpose({updateDemand})
</script>

<template>
  <el-row class="row" justify="center" :gutter="50">
    <Vue3Lottie
        width="300px"
        height="300px"
        :animation-data="animationData"
        :loop="1"
        :auto-play="true"
        :speed="2"
    />
  </el-row>
</template>

<style scoped lang="scss">

</style>
