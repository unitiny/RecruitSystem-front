<script setup lang="ts">
import {global} from "@/static/static";
import {onBeforeMount, ref, watch} from "vue"
import {useRouter} from "vue-router";
import {useRoute} from "vue-router";
import {getFileName, diffDay, deepJSONParse, elMsgOption} from "@/utils/utils";
import {API, GetDemand, GetEngineerParentSkills, GetUser, DownloadFile, userDemandGroup} from "@/api/api";
import {TabsPaneContext} from "element-plus";
import {useGlobalStore} from "@/store/pinia";
import Plan from "@/components/demand/Plan.vue";
import ArrangePlan from "@/views/userDemand/ArrangePlan.vue";
import {request} from "@/utils/axios";

const route = useRoute()
const router = useRouter()
const store = useGlobalStore()
const tabs = ref({
  activeName: "1",
})
const planTabs = ref({
  activeName: "0",
  tabs: [
    {
      name: "0",
      label: "总体进度"
    }
  ]
})

const demand = ref({})
const user = ref({})
const skills = ref([])
const userDemandList = ref([])
const engineerSkills = ref([])

function handleClick(tab: TabsPaneContext, event: Event) {
  console.log(tab, event)
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

function getSkillTags(val: string[]): string[] {
  if (!val || val.length === 0) {
    return []
  }
  let res = []
  for (const v of val) {
    if (parseInt(v) - 1 < engineerSkills.value.length) {
      res.push(engineerSkills.value[parseInt(v) - 1].label)
    }
  }
  return res
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

function udIndex(): number {
  let i = parseInt(planTabs.value.activeName)
  if (i > 0) {
    return i - 1
  }
  return i
}

function downloadFile(path) {
  DownloadFile(path).catch(err => {
    ElMessage(elMsgOption("下载失败", "error"))
  })
}

watch(
    () => planTabs.value.activeName,
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
    demand.value.requires.forEach((v, i) => {
      planTabs.value.tabs.push({
        name: (i + 1).toString(),
        label: v.name
      })
    })

    GetUser(demand.value.uid).then(res => {
      user.value = res
    })

    getUserDemandList()
  })
  GetEngineerParentSkills().then(res => {
    engineerSkills.value = res
  })
})

</script>

<template>
  <el-row class="detail-main row column">
    <el-row class="row header">
      <el-col :span="16" class="basic-content">
        <el-row class="row title">{{ demand.name }}</el-row>
        <el-row class="row introduce">
          <div class="description">
            <span>总金额</span>
            <span style="color: #e70b0b">￥{{ demand.remuneration }}</span>
          </div>
          <div class="description">
            <span>开发时间</span>
            <span>{{ diffDay(demand.start, demand.end) }}天</span>
          </div>
          <div class="description">
            <span>招募人数</span>
            <span>{{ demand.hasRecruitNum }}/{{ demand.recruitNum }}</span>
          </div>
        </el-row>
      </el-col>
      <el-col :span="4" class="flex-center flex-col">
        <el-avatar :size="60" :src="user?.avatar"/>
        <span>{{ user?.nickname }}</span>
        <el-button v-if="store['user'].identity !== 1" @click="privateChat(demand?.id, demand?.uid)" type="primary">立即沟通
        </el-button>
      </el-col>
    </el-row>
    <el-tabs v-model="tabs.activeName" class="tabs" @tab-click="handleClick">
      <el-tab-pane label="需求详情" name="1">
        <el-scrollbar class="scrollbar">
          <el-row class="main row">
            <!--  需求详情  -->
            <el-row class="board row">
              <div class="card box-card">
                <div class="card-content">
                  <span class="title">
                    描述
                  </span>
                  <div>
                    {{ demand.demand ? demand.demand : "无" }}
                  </div>
                </div>
                <div class="card-content">
                  <span class="title">
                    要求
                  </span>
                  <div>
                    <div v-for="(item, index) in demand?.requires"
                         :key="index"
                         class="flex-ai-center">
                      <span>{{ item.name }}： &nbsp;</span>
                      <span v-for="tag in getSkillTags(item.value)">{{ tag }}&nbsp;</span>
                    </div>
                  </div>
                </div>
                <div class="card-content">
                  <span class="title">
                    备注
                  </span>
                  <div>
                    {{ demand?.notes !== "" ? demand.notes : "无" }}
                  </div>
                </div>
                <div class="card-content">
                  <span class="title">
                    附件
                  </span>
                  <el-row>
                    {{ getFileName(demand.materialPath) }}
                  </el-row>
                  <el-row>
                    <el-button @click="downloadFile(demand.materialPath)">下载附件</el-button>
                  </el-row>
                </div>
              </div>
            </el-row>
          </el-row>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="开发计划" name="2">
        <el-scrollbar class="scrollbar">
          <el-row class="main row">
            <!--  开发计划  -->
            <el-row class="board row">
              <el-tabs
                  v-model="planTabs.activeName"
                  type="card"
                  class="plan-tabs"
                  @tab-click="">
                <el-tab-pane v-for="(item, index) in planTabs.tabs"
                             :label="item.label"
                             :name="item.name">
                  <div v-if="index === 0">
                    <Plan :plan="demand?.plan ?? {}"></Plan>
                  </div>
                  <div v-else>
                    <el-row class="row skills">
                      <el-col :span="2">技能：</el-col>
                      <el-col :span="16">
                      <span v-for="tag in skills">
                        {{ tag }}&nbsp;
                      </span>
                      </el-col>
                    </el-row>
                    <Plan :plan="userDemandList[udIndex()]?.plan ?? {}" :show-fee="true"></Plan>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-row>
          </el-row>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>

<style scoped lang="scss">
.detail-main {
  color: black;
  padding: 10px 150px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .basic-content {
      display: flex;
      justify-content: space-between;
      flex-direction: column;

      .title {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 15px;
      }

      .introduce {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;

        .description {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;

          span:nth-child(2) {
            font-size: 20px;
          }
        }
      }
    }
  }

  .tabs {
    width: 100%;
    margin-top: 18px;

    .scrollbar {
      height: 400px;
      width: 100%;

      .board {
        .card {
          padding: 0 10px;
          width: 100%;

          .card-content {
            .title {
              font-size: 18px;
              font-weight: 500;
            }

            div {
              margin: 10px 0;
            }
          }
        }

        .plan-tabs {
          width: 100%;
        }
      }
    }
  }
}

.sidebar-ctl {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main {
  .board {
    min-width: 400px;
    width: 80%;
    margin: 10px 0;
  }
}

.skills {
  padding: 10px 0;
}

.tag {
  margin: 5px 10px;
}

</style>
