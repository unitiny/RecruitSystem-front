<script setup lang="ts">
import {onBeforeMount, onMounted, ref, watch} from "vue"
import {API, GetDemand, GetEngineerParentSkills, PutDemand, userDemandGroup} from "@/api/api";
import {useRoute} from "vue-router";
import {copy, getAliasArr, deepJSONParse} from "@/utils/utils";
import {request} from "@/utils/axios";
import {useGlobalStore} from "@/store/pinia";
import {ElMessage} from "element-plus";
import router from "@/router";

const route = useRoute()
const store = useGlobalStore()
const demand = ref({})
const userDemand = ref({})
const skills = ref([])
const userDemandList = ref([])
const engineerSkills = ref([])

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
    userDemand.value.plan = deepJSONParse(userDemand.value.plan)
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

function getSkillTags(val: string[]): string[] {
  if (!val || val.length === 0) {
    return []
  }
  let res = []
  for (const v of val) {
    res.push(engineerSkills.value[parseInt(v) - 1].label)
  }
  return res
}

function udIndex(): number {
  return parseInt(activeIndex.value) - 1
}

function privateChat(did, uid) {
  router.push({
    name: "/chat/privatechat",
    query: {
      uid: uid,
      did: did
    }
  })
}

watch(
    () => activeIndex.value,
    (value, oldValue, onCleanup) => {
      let i = udIndex()
      if (demand.value.requires &&
          i < demand.value.requires.length) {
        skills.value = getSkillTags(demand.value.requires[i]?.value)
      }
    }
)

onBeforeMount(() => {
  GetDemand(route.query.did).then(res => {
    demand.value = res
    demand.value.plan = deepJSONParse(res["plan"])

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
  GetEngineerParentSkills().then(res => {
    engineerSkills.value = res
  })
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
                placeholder="Pick a day"
                :disabled="true"/>
          </div>
          <el-card class="row">
            <el-row class="row" style="margin-bottom: 15px;">
              <el-col :span="24" class="flex-ai-center">
                <el-row class="row flex-ai-center">
                  <el-col :span="2">
                    <span>名称：</span>
                  </el-col>
                  <el-col :span="18">
                    <el-input
                        v-model="item.title"
                        placeholder="计划名称"
                        :disabled="true"
                    />
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <span>内容：</span>
              </el-col>
              <el-col :span="24">
                <el-input
                    v-model="item.content"
                    :rows="4"
                    type="textarea"
                    placeholder="计划内容"
                    :disabled="true"
                />
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-scrollbar>

    <el-scrollbar v-else class="scrollbar">
      <el-row class="row skills">
        <el-col :span="2">技能：</el-col>
        <el-col :span="16">
            <span v-for="tag in skills">
              {{ tag }}&nbsp;
            </span>
        </el-col>
      </el-row>
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
                placeholder="Pick a day"
                :disabled="true"
            />
            <el-button type="primary" style="margin-left: 10px;" @click="privateChat(demand.id, demand.uid)">申请更新计划
            </el-button>
          </div>
          <el-card>
            <el-row class="row flex-ai-center" style="margin-bottom: 15px;">
              <el-col :span="10">
                <el-row>
                  <el-col :span="4">名称：</el-col>
                  <el-col :span="16">
                    <el-input
                        v-model="item.title"
                        placeholder="计划名称"
                        :disabled="true"
                    />
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="10" class="card-right">
                <el-row class="row card-fee">
                  <el-col :span="4">完成报酬：</el-col>
                  <el-col :span="16">
                    <span style="color: #ea1515">￥{{ item.fee }}</span>
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="4" class="flex-center">
                  <span class="plan-operate">
                      <span v-if="store['user'].identity === 1">
                        <span v-if="item.status === 1">
                          <el-tag>待完成</el-tag>
                        </span>
                        <span v-else-if="item.status === 2">
                          <div class="flex-center">
                            <el-icon :color="'blue'" :size="20"><Loading/></el-icon>
                            <span>&nbsp;申请中</span>
                          </div>
                        </span>
                        <span v-else-if="item.status === 3">
                          <div class="flex-center">
                            <el-icon :color="'green'" :size="20"><CircleCheck/></el-icon>
                            <span>&nbsp;已完成</span>
                          </div>
                        </span>
                      </span>
                      <span v-else-if="store['user'].identity === 2">
                      <span v-if="item.status === 1">
                          <el-tag>待完成</el-tag>
                      </span>
                      <span v-else-if="item.status === 2">
                        <div class="flex-center">
                          <el-icon :color="'blue'" :size="20"><Loading/></el-icon>
                          <span>&nbsp;申请中</span>
                        </div>
                      </span>
                      <span v-else-if="item.status === 3">
                        <div class="flex-center">
                          <el-icon :color="'green'" :size="20"><CircleCheck/></el-icon>
                          <span>&nbsp;已完成</span>
                        </div>
                      </span>
                    </span>
                  </span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" style="margin-bottom: 8px;">
                <span>内容：</span>
              </el-col>
              <el-col :span="24">
                <el-input
                    v-model="item.content"
                    :rows="4"
                    type="textarea"
                    placeholder="计划内容"
                    :disabled="true"
                />
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.scrollbar {
  height: 550px;
  width: 80%;
}

.skills {
  padding: 10px 0;
}
</style>
