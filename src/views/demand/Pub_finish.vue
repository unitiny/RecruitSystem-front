<script setup lang="ts">
import {defineExpose, defineProps} from "vue";
import {Vue3Lottie} from "vue3-lottie"
import animationData from "@/assets/lottie/right.json"
import {useRouter} from "vue-router";

const props = defineProps({
  demand: {
    type: Object
  }
})
const router = useRouter()

function updateDemand(dm) {
  // dm.type = demand.value.type
}

function finish() {
  router.push("/")
}

function payIntend() {
  router.push({
    name: "/pay/payment",
    query: {
      fee: props.demand.remuneration,
      goodID: props.demand.id,
      good: props.demand.name,
      returnURL: "/"
    }
  })
}


defineExpose({updateDemand})
</script>

<template>
  <el-row class="row" justify="center" :gutter="50">
    <Vue3Lottie
        width="350px"
        height="350px"
        :animation-data="animationData"
        :loop="1"
        :auto-play="true"
        :speed="2"
    />
  </el-row>
  <el-row class="row operate" :gutter="10">
    <el-col :span="6" align="middle">
      <el-button @click="payIntend" class="row btn" type="primary" size="large">预支付</el-button>
    </el-col>
    <el-col :span="6" align="middle">
      <el-button @click="finish" class="row btn" type="primary" size="large">发布</el-button>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.operate {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
</style>
