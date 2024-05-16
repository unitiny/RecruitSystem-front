<script setup lang="ts">
import {onBeforeMount, onMounted, ref, watch} from "vue"
import {API, GetDemand, GetEngineerParentSkills, PutDemand, userDemandGroup} from "@/api/api";
import {useRoute} from "vue-router";
import {copy, getAliasArr, deepJSONParse} from "@/utils/utils";
import {request} from "@/utils/axios";
import {useGlobalStore} from "@/store/pinia";
import {ElMessage} from "element-plus";

interface Plan {
  time: string,
  title: string,
  content: string,
  fee: number,
  process: number,
  status: number,
}

const route = useRoute()
const store = useGlobalStore()
const demand = ref({})
const skills = ref([])
const userDemandList = ref([])
const engineerSkills = ref([])

const statusSelect = [
  {
    label: "待完成",
    value: "1"
  },
  {
    label: "已完成",
    value: "3"
  }
]
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

function udIndex(): number {
  let i = parseInt(activeIndex.value)
  if (i > 0) {
    return i - 1
  }
  return i
}

function formatTooltip(num: number): number | string {
  let fee = (demand.value.remuneration * num * 0.01).toFixed(2)
  return `${num}% ￥${fee}`
}

function changePlanStatus(i) {

}

function changePlan(way) {
  if (way > 0) {
    demand.value.plan.push(<Plan>{
      time: "",
      title: "",
      content: "",
      fee: 0,
      process: 0,
      status: 1,
    })
  } else {
    demand.value.plan.pop()
  }
}

function changeUserPlan(way) {
  if (way > 0) {
    userDemandList.value[udIndex()].plan.push(<Plan>{
      time: "",
      title: "",
      content: "",
      fee: 0,
      process: 0,
      status: 1,
    })
  } else {
    userDemandList.value[udIndex()].plan.pop()
  }
}

function savePlan() {
  try {
    PutDemand(demand.value)

    let sum = 0
    for (let i = 0; i < userDemandList.value.length; i++) {
      let item = userDemandList.value[i]
      for (let j = 0; j < item.plan.length; j++) {
        sum += item.plan[j].fee
      }
    }
    if (sum > demand.value.remuneration) {
      ElMessage({
        showClose: true,
        message: "计划总金额不得超过需求佣金",
        type: 'error',
      })
      return
    }

    for (let i = 0; i < userDemandList.value.length; i++) {
      let item = copy(userDemandList.value[i])
      item.plan = JSON.stringify(item.plan)
      request({
        url: userDemandGroup.put,
        method: API.PUT,
        data: item
      })
    }
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

async function getUserDemandList() {
  request({
    url: userDemandGroup.list,
    method: API.GET,
    params: {
      did: demand.value.id,
      publisherID: demand.value.uid,
      order: "role asc"
    }
  }).then(res => {
    userDemandList.value = res["list"]
    for (let i = 0; i < userDemandList.value.length; i++) {
      if (userDemandList.value[i].plan) {
        userDemandList.value[i].plan = JSON.parse(userDemandList.value[i].plan)
        let plan = userDemandList.value[i].plan
        for (let j = 0; j < plan.length; j++) {
          plan[j].process = (plan[j].fee / demand.value.remuneration) * 100
        }
      } else {
        userDemandList.value[i].plan = [<Plan>{
          time: "",
          title: "",
          content: "",
          fee: 0,
          process: 0,
          status: 1,
        }]
      }
    }
    console.log(userDemandList.value)
  })
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

function getFee(item) {
  item.fee = demand.value.remuneration * item.process * 0.01
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
    demand.value.requires = deepJSONParse(res["requires"])
    let aliasArr = getAliasArr(demand.value.recruitNum)
    for (let i = 0; i < aliasArr.length; i++) {
      menu.value.push({
        index: (i + 1).toString(),
        name: aliasArr[i]
      })
    }
    getUserDemandList()
    console.log(demand.value)
  })

  GetEngineerParentSkills().then(res => {
    engineerSkills.value = res
    console.log(engineerSkills.value)
  })
})
</script>

<template>
  <div class="row flex-col flex-ai-center">
    <el-row class="header flex-center">
      <el-button class="savePlan" type="primary" @click.passive="savePlan">保存计划</el-button>
      <el-menu
          :default-active="activeIndex"
          :ellipsis="false"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect">
        <el-menu-item v-for="item in menu" :index="item.index">{{ item.name }}</el-menu-item>
      </el-menu>
    </el-row>

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
                  <el-col :span="2">
                    <span>名称：</span>
                  </el-col>
                  <el-col :span="22">
                    <el-input
                        v-model="item.title"
                        placeholder="计划名称"
                    />
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24" style="margin-bottom: 8px;">
                <span>内容：</span>
              </el-col>
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
      <el-row class="row skills">
        <el-col :span="2">技能：</el-col>
        <el-col :span="16">
            <span v-for="tag in skills">
              {{ tag }}&nbsp;
            </span>
        </el-col>
      </el-row>
      <el-timeline>
        <el-timeline-item v-for="(item, index) in userDemandList[udIndex()].plan" center>
          <div class="flex-ai-center" style="margin: 5px 0;">
            <el-icon :size="18">
              <Timer/>
            </el-icon>
            &nbsp;
            <el-date-picker
                v-model="item.time"
                type="date"
                placeholder="Pick a day"/>

            <!--            <el-select-->
            <!--                class="m-2"-->
            <!--                placeholder="更新状态"-->
            <!--                @change="changePlanStatus(index)"-->
            <!--            >-->
            <!--              <el-option-->
            <!--                  v-for="item in statusSelect"-->
            <!--                  :key="item.value"-->
            <!--                  :label="item.label"-->
            <!--                  :value="item.value"-->
            <!--              />-->
            <!--            </el-select>-->
          </div>
          <el-card>
            <el-row class="row flex-ai-center" style="margin-bottom: 15px;">
              <el-col :span="10">
                <el-row>
                  <el-col :span="4">名称：</el-col>
                  <el-col :span="18">
                    <el-input
                        v-model="item.title"
                        placeholder="计划标题"
                    />
                  </el-col>
                </el-row>
              </el-col>
              <el-col :span="10" class="card-right">
                <el-row class="row card-fee">
                  <el-col :span="4">报酬：</el-col>
                  <el-col :span="18">
                    <el-slider show-input
                               v-model="item.process"
                               @change="getFee(item)"
                               :disabled="item.status !== 1"
                               :format-tooltip="formatTooltip"/>
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
  </div>
</template>

<style scoped lang="scss">
.header {
  position: relative;
  width: 80%;

  .savePlan {
    position: absolute;
    right: 0;
  }
}

.scrollbar {
  height: 550px;
  width: 80%;
}

.skills {
  padding: 10px 0;
}
</style>
