<script setup lang="ts">
import {computed, defineEmits, defineExpose, defineProps, onBeforeMount, onMounted, ref, watch} from "vue"
import {baseURL, request} from "@/utils/axios";
import {API, demandGroup, GetDemand, GetEngineerParentSkills, PutDemand, userDemandGroup} from "@/api/api";
import {ElMessage, ElMessageBox} from 'element-plus'
import {useGlobalStore} from "@/store/pinia";
import {copy, getAliasArr, deepJSONParse} from "@/utils/utils";

interface Plan {
  time: string,
  title: string,
  content: string,
  fee: number,
  status: number,
}

const props = defineProps({
  demand: {}
})
const store = useGlobalStore()

const demand = computed(() => props.demand)
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
const curPlan = computed(() => {
  if (udIndex() >= userDemandList.value.length) {
    return []
  }
  return userDemandList.value[udIndex()]?.plan
})

const handleSelect = (key: string, keyPath: string[]) => {
  activeIndex.value = key
}

function udIndex(): number {
  return parseInt(activeIndex.value) - 1
}

function formatTooltip(num: number): number | string {
  let fee = (demand.value.remuneration * num * 0.01).toFixed(2)
  return `${num}% ￥${fee}`
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
      } else {
        userDemandList.value[i].plan = [<Plan>{
          time: "",
          title: "",
          content: "",
          fee: 0,
          status: 1,
        }]
      }
    }
    console.log(userDemandList.value)
  })
}

function changePlan(way) {
  if (way > 0) {
    demand.value.plan.push(<Plan>{
      time: "",
      title: "",
      content: "",
      fee: 0,
      status: 1,
    })
  } else {
    demand.value.plan.pop()
  }
}

function changeUserPlan(way) {
  if (udIndex() >= userDemandList.value.length) {
    return []
  }
  if (way > 0) {
    userDemandList.value[udIndex()].plan.push(<Plan>{
      time: "",
      title: "",
      content: "",
      fee: 0,
      status: 1,
    })
  } else {
    userDemandList.value[udIndex()].plan.pop()
  }
}

function savePlan() {
  try {
    PutDemand(demand.value)

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

function updateDemand(dm) {
  dm.value.plan = JSON.stringify(demand.value.plan)
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

function setData() {
  demand.value.plan = deepJSONParse(demand.value.plan)
  demand.value.requires = deepJSONParse(demand.value.requires)
  demand.value.requires.forEach((v, i) => {
    menu.value.push({
      index: (i + 1).toString(),
      name: v.name
    })
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

function check() {
  return true
}

onBeforeMount(() => {
  getUserDemandList()
  GetEngineerParentSkills().then(res => {
    engineerSkills.value = res
  })
  setData()
})
defineExpose({updateDemand, check})
</script>

<template>
  <el-row class="row content" justify="center">
    <div class="row flex-col flex-ai-center">
      <el-menu
          :default-active="activeIndex"
          :ellipsis="false"
          class="menu"
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
                      <span>名称：</span>
                    </el-col>
                    <el-col :span="18">
                      <el-input
                          v-model="item.title"
                          placeholder="计划名称"
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
        <el-row class="row skills">
          <el-col :span="2">技能：</el-col>
          <el-col :span="16">
            <span v-for="tag in skills">
              {{ tag }}&nbsp;
            </span>
          </el-col>
        </el-row>
        <el-timeline>
          <el-timeline-item v-for="item in curPlan" center>
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
                  <span>名称：</span>
                  <el-col>
                    <el-input
                        v-model="item.title"
                        placeholder="计划名称"
                    />
                  </el-col>
                </el-col>
                <el-col :span="12" class="card-right">
                  <el-row class="row card-fee">
                    报酬：&nbsp;&nbsp;
                    <el-slider show-input v-model="item.fee" :format-tooltip="formatTooltip"/>
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
      <el-button type="primary" @click.passive="savePlan">保存</el-button>
    </div>
  </el-row>
</template>

<style scoped lang="scss">
.content {
  padding: 10px 120px;
}

.menu {
  margin-bottom: 8px;
}

.skills {
  padding: 10px 0;
}

.inputItem {
  width: 100%;
  margin: 10px 0;
}

.scrollbar {
  width: 100%;
}
</style>
