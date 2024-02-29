<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import PubStep1 from "./Pub_step1.vue"
import PubStep2 from "./Pub_step2.vue"
import PubStep3 from "./Pub_step3.vue"
import PubFinish from "./Pub_finish.vue"
import {request} from "@/utils/axios";
import {API, demandGroup} from "@/api/api";
import {useGlobalStore} from "@/store/pinia";
import {useRoute, useRouter} from "vue-router"
import {ElMessage} from "element-plus";

const route = useRoute()
const router = useRouter()
const store = useGlobalStore()

const stepData = ref({
  hasPub: false,
  active: 1,
  list: [
    {
      title: "身份选择",
      description: ""
    },
    {
      title: "需求填写",
      description: ""
    },
    {
      title: "开发规划",
      description: ""
    },
    {
      title: "完成",
      description: ""
    },
  ]
})
const demand = ref({})
const pubStep1 = ref()
const pubStep2 = ref()
const pubStep3 = ref()
const pubFinish = ref()

function updateDemand(dm) {
  demand.value = dm
}

function changeDemand() {
  switch (stepData.value.active) {
    case 1:
      pubStep1.value.updateDemand(demand)
      break
    case 2:
      pubStep2.value.updateDemand(demand)
      break
    case 3:
      pubStep3.value.updateDemand(demand)
      break
    case 4:
      pubFinish.value.updateDemand(demand)
      break
  }
}

function putDemand() {
  console.log(demand.value)
  demand.value.uid = store["user"].id
  request({
    url: demandGroup.put,
    method: API.PUT,
    data: demand.value
  }).catch(err => {
    console.log(err)
    ElMessage({
      showClose: true,
      inputMsg: "更新需求错误",
      type: 'error',
    })
  })
}

function pubDemand() {
  demand.value.uid = store["user"].id
  request({
    method: API.POST,
    url: demandGroup.pub,
    data: demand.value
  }).then(res => {
    demand.value = res["demand"]
    stepData.value.hasPub = true
    console.log(demand.value)
  }).catch(err => {
    console.log(err)
    ElMessage({
      showClose: true,
      inputMsg: "更新需求错误",
      type: 'error',
    })
  })
}

function getDemand(did) {
  demand.value.uid = store["user"].id
  request({
    method: API.GET,
    url: demandGroup.get,
    params: {
      did: did.toString()
    }
  }).then(res => {
    demand.value = res
    console.log(demand.value)
  }).catch(err => {
    console.log(err)
    ElMessage({
      showClose: true,
      inputMsg: "获取需求错误",
      type: 'error',
    })
  })
}

function changeStep(num: Number) {
  let nextActive = stepData.value.active + num
  if (nextActive >= 1 && nextActive < 5) {
    if (num > 0) {
      changeDemand()
    }

    if (stepData.value.active === 1 && !stepData.value.hasPub) {
      pubDemand()
    } else if (num > 0) {
      putDemand()
    }
    stepData.value.active = nextActive
  }
}

function finish() {
  putDemand()
  router.push("/")
}

function payIntend() {
  router.push("/dev/dev")
}

onMounted(() => {
  if (route.query.did) {
    stepData.value.hasPub = true
    getDemand(route.query.did)
  }
})
</script>

<template>
  <el-row class="container" justify="start">
    <el-row class="row" justify="center">
      <el-steps style="width: 100%" :active="stepData.active" align-center>
        <el-step v-for="item in stepData.list" :title="item.title" :description="item.description"/>
      </el-steps>
    </el-row>

    <el-row class="row">
      <el-scrollbar max-height="400px" style="width: 100%">
        <PubStep1 v-if="stepData.active === 1" ref="pubStep1" :demand="demand"></PubStep1>
        <PubStep2 v-else-if="stepData.active === 2" ref="pubStep2" :demand="demand"></PubStep2>
        <PubStep3 v-else-if="stepData.active === 3" ref="pubStep3" :demand="demand"></PubStep3>
        <PubFinish v-else :demand="demand" ref="pubFinish"></PubFinish>
      </el-scrollbar>
    </el-row>

    <el-row v-if="stepData.active <= 4" class="row" justify="center" :gutter="10">
      <el-col :span="6" align="middle">
        <el-button @click="changeStep(-1)" type="primary" size="large">上一步</el-button>
      </el-col>
      <el-col :span="6" align="middle">
        <el-button @click="changeStep(1)" type="primary" size="large">下一步</el-button>
      </el-col>
    </el-row>
    <el-row class="row" justify="center" :gutter="10">
      <el-col :span="6" align="middle">
        <el-button @click="payIntend" type="primary" size="large">预支付</el-button>
      </el-col>
      <el-col :span="6" align="middle">
        <el-button @click="finish" type="primary" size="large">发布</el-button>
      </el-col>
    </el-row>
  </el-row>
</template>

<style scoped lang="scss">
.header {
  display: inline-block;
  position: absolute;
  top: 20px;
}
</style>
