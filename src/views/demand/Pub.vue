<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue";
import PubStep1 from "./Pub_step1.vue"
import PubStep2 from "./Pub_step2.vue"
import PubStep3 from "./Pub_step3.vue"
import PubStep4 from "./Pub_step4.vue"
import PubStep5 from "./Pub_step5.vue"
import PubFinish from "./Pub_finish.vue"
import {request} from "@/utils/axios";
import {API, demandGroup, PutDemand} from "@/api/api";
import {useGlobalStore} from "@/store/pinia";
import {useRoute, useRouter} from "vue-router"
import {ElMessage} from "element-plus";

const route = useRoute()
const router = useRouter()
const store = useGlobalStore()

const page = [2, 3, 4, 5, 6]
const steps = {
  step1: 1,
  step2: 2,
  step3: 3,
  step4: 4,
  step5: 5,
  finish: 6
}

const stepData = ref({
  hasPub: false,
  active: 0,
  list: [
    // {
    //   title: "选择身份",
    //   description: ""
    // },
    {
      title: "填写需求",
      description: ""
    },
    {
      title: "开发规划",
      description: ""
    },
    {
      title: "安排任务",
      description: ""
    },
    {
      title: "支付佣金",
      description: ""
    },
    {
      title: "完成",
      description: ""
    },
  ]
})
const currentStep = computed(() => page[stepData.value.active])

const demand = ref({})
const pubStep1 = ref()
const pubStep2 = ref()
const pubStep3 = ref()
const pubStep4 = ref()
const pubStep5 = ref()
const pubFinish = ref()
const formCardRef = ref()
const scrollerHeight = ref("550px")

function updateDemand(dm) {
  demand.value = dm
}

function checkDemand() {
  switch (currentStep.value) {
    case 1:
      return pubStep1.value.check()
    case 2:
      return pubStep2.value.check()
    case 3:
      return pubStep3.value.check()
    case 4:
      return pubStep4.value.check()
    case 5:
      return pubStep5.value.check()
  }
  return true
}

function changeDemand() {
  switch (currentStep.value) {
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
      pubStep4.value.updateDemand(demand)
      break
    case 5:
      pubStep5.value.updateDemand(demand)
      break
    case 6:
      pubFinish.value.updateDemand(demand)
      break
  }
}

function putDemand() {
  demand.value.uid = store["user"].id
  if (typeof demand.value.remuneration === "string") {
    demand.value.remuneration = parseInt(demand.value.remuneration)
    demand.value.leftFee = parseInt(demand.value.leftFee)
  }
  PutDemand(demand.value).catch(err => {
    console.log(err)
    ElMessage({
      showClose: true,
      message: "更新需求错误",
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

function changeStep(num: number) {
  if(num > 0 && !checkDemand()) {
    return
  }
  let nextActive = stepData.value.active + num
  if (nextActive >= 0 && nextActive < page.length) {
    if (num > 0) {
      changeDemand()
    }

    if (stepData.value.active === 0 && !stepData.value.hasPub) {
      pubDemand()
    } else if (num > 0) {
      putDemand()
    }
    stepData.value.active = nextActive
  }
}

onMounted(() => {
  if (route.query.did) {
    stepData.value.hasPub = true
    getDemand(route.query.did)
  } else if (stepData.value.active === 0 && !stepData.value.hasPub) {
    pubDemand()
  }

  scrollerHeight.value = `${formCardRef.value.offsetHeight * 0.9}px`
})
</script>

<template>
  <el-row class="pub-container" justify="start">
    <el-col :span="3" class="steps">
      <el-steps class="column" direction="vertical" :active="stepData.active" align-center>
        <el-step v-for="item in stepData.list" :title="item.title" :description="item.description"/>
      </el-steps>
    </el-col>
    <el-col :span="14" class="column">
      <div ref="formCardRef" class="column">
        <el-card shadow="never" class="column">
          <el-row class="row">
            <el-scrollbar :max-height="scrollerHeight" style="width: 100%">
              <PubStep1 v-if="currentStep === steps.step1" ref="pubStep1" :demand="demand"></PubStep1>
              <PubStep2 v-else-if="currentStep === steps.step2" ref="pubStep2" :demand="demand"></PubStep2>
              <PubStep3 v-else-if="currentStep === steps.step3" ref="pubStep3" :demand="demand"></PubStep3>
              <PubStep4 v-else-if="currentStep === steps.step4" ref="pubStep4" :demand="demand"></PubStep4>
              <PubStep5 v-else-if="currentStep === steps.step5" ref="pubStep5" :demand="demand" :next="changeStep"></PubStep5>
              <PubFinish v-else :demand="demand" ref="pubFinish"></PubFinish>
            </el-scrollbar>
          </el-row>
        </el-card>
      </div>
    </el-col>
    <el-col :span="4" class="column">
      <el-card shadow="never" class="column">
        <el-row v-if="stepData.active <= stepData.list.length" class="row" justify="center" :gutter="10">
          <el-col :span="20">
            <el-button @click="changeStep(-1)" class="row btn" type="primary" size="large">上一步</el-button>
          </el-col>
          <el-col :span="20">
            <el-button @click="changeStep(1)" class="row btn" type="primary" size="large">下一步</el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.pub-container {
  position: relative;
  width: 100%;
  height: 90%;
  padding: 20px 0;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  color: black;

  .steps {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
  }
}

.header {
  display: inline-block;
  position: absolute;
  top: 20px;
}

.btn {
  margin: 10px 10px;
}
</style>
