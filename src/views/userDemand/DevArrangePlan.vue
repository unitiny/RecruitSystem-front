<script setup lang="ts">
import {onBeforeMount, onMounted, ref} from "vue"
import {API, GetDemand, PutDemand, userDemandGroup} from "@/api/api";
import {useRoute} from "vue-router";
import {copy, getAliasArr, getDemandPlan} from "@/utils/utils";
import {request} from "@/utils/axios";
import {useGlobalStore} from "@/store/pinia";
import {ElMessage} from "element-plus";

const route = useRoute()
const store = useGlobalStore()
const demand = ref({})
const userDemand = ref({})

const menu = ref([
  {
    index: "0",
    name: "总体进度"
  }
])
const activeIndex = ref("0")

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  activeIndex.value = key
}

function formatTooltip(num: number): number | string {
  let fee = (demand.value.remuneration * num * 0.01).toFixed(2)
  return `${num}% ￥${fee}`
}

function getUserDemand() {
  request({
    url: userDemandGroup.getUserDemand,
    method: API.GET,
    params: {
      did: route.query.did,
      applicantID: store["user"].id,
    }
  }).then(res => {
    userDemand.value = res
    userDemand.value.plan = getDemandPlan(userDemand.value.plan)
    console.log(userDemand.value)
  })
}

function changePlan(way) {
  if (way > 0) {
    demand.value.plan.push({
      time: "",
      title: "",
      content: "",
      fee: 0
    })
  } else {
    demand.value.plan.pop()
  }
}

function changeUserPlan(way) {
  if (way > 0) {
    userDemand.value.plan.push({
      time: "",
      title: "",
      content: "",
      fee: 0
    })
  } else {
    userDemand.value.plan.pop()
  }
}

function savePlan() {
  try {
    PutDemand(copy(demand.value))
    let item = copy(userDemand.value)
    item.plan = JSON.stringify(item.plan)
    request({
      url: userDemandGroup.put,
      method: API.PUT,
      data: item
    })
    ElMessage({
      showClose: true,
      message: "保存成功",
      type: 'success',
    })
  } catch (err) {
    console.log(err)
    ElMessage({
      showClose: true,
      message: "保存失败",
      type: 'error',
    })
  }
}

onBeforeMount(() => {
  GetDemand(route.query.did).then(res => {
    demand.value = res
    demand.value.plan = getDemandPlan(res["plan"])

    let aliasArr = getAliasArr(demand.value.recruitNum)
    for (let i = 0; i < aliasArr.length; i++) {
      menu.value.push({
        index: (i + 1).toString(),
        name: aliasArr[i]
      })
    }
    console.log(demand.value, menu.value, aliasArr)
  })

  getUserDemand()
})
</script>

<template>
  <div class="row flex-col flex-ai-center">
    <el-menu
        :default-active="activeIndex"
        :ellipsis="false"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect">
      <el-menu-item v-for="item in menu" :index="item.index">{{ item.name }}</el-menu-item>
    </el-menu>
    <el-scrollbar v-if="activeIndex === '0'" class="scrollbar">
      <el-timeline>
        <el-timeline-item v-for="item in demand.plan" center>
          <div class="flex-ai-center" style="margin: 5px 0;">
            <el-icon :size="18">
              <Timer/>
            </el-icon>
            &nbsp;
            <el-date-picker
                v-model="item.time"
                type="date"
                placeholder="Pick a day"/>
          </div>
          <el-card class="row">
            <el-row class="row" style="margin-bottom: 15px;">
              <el-col :span="24" class="flex-ai-center">
                <el-row class="row flex-ai-center">
                  <el-col :span="6">
                    <span>标题：</span>
                  </el-col>
                  <el-col :span="18">
                    <el-input
                        v-model="item.title"
                        placeholder="计划标题"
                    />
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-input
                    v-model="item.content"
                    :rows="4"
                    type="textarea"
                    placeholder="计划内容"
                />
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-row>
        <el-button @click.passive="changePlan(1)">
          <el-icon>
            <Plus/>
          </el-icon>
        </el-button>
        <el-button @click.passive="changePlan(-1)">
          <el-icon>
            <Minus/>
          </el-icon>
        </el-button>
      </el-row>
    </el-scrollbar>

    <el-scrollbar v-else class="scrollbar">
      <el-timeline>
        <el-timeline-item v-for="item in userDemand.plan" center>
          <div class="flex-ai-center" style="margin: 5px 0;">
            <el-icon :size="18">
              <Timer/>
            </el-icon>
            &nbsp;
            <el-date-picker
                v-model="item.time"
                type="date"
                placeholder="Pick a day"/>
          </div>
          <el-card>
            <el-row class="row flex-ai-center">
              <el-col :span="12">
                <span>标题：</span>
                <el-col>
                  <el-input
                      v-model="item.title"
                      placeholder="计划标题"
                  />
                </el-col>
              </el-col>
              <el-col :span="12" class="card-right">
                <el-row class="row card-fee">
                  报酬：&nbsp;&nbsp;
                  <el-slider v-model="item.fee" :format-tooltip="formatTooltip"/>
                </el-row>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-input
                    v-model="item.content"
                    :rows="4"
                    type="textarea"
                    placeholder="计划内容"
                />
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-row>
        <el-button @click.passive="changeUserPlan(1)">
          <el-icon>
            <Plus/>
          </el-icon>
        </el-button>
        <el-button @click.passive="changeUserPlan(-1)">
          <el-icon>
            <Minus/>
          </el-icon>
        </el-button>
      </el-row>
    </el-scrollbar>

    <el-button type="primary" @click.passive="savePlan">save</el-button>
  </div>
</template>

<style scoped lang="scss">
.scrollbar {
  height: 550px;
  width: 80%;
}
</style>
