<script setup lang="ts">
import {global} from "@/static/static";
import {onBeforeMount, ref} from "vue"
import {useRouter} from "vue-router";
import {useRoute} from "vue-router";
import {getPaymentWay, diffDay, getDemandPlan} from "@/utils/utils";
import {GetDemand, GetUser} from "@/api/api";
import {TabsPaneContext} from "element-plus";

const route = useRoute()
const router = useRouter()
const avatar = global.path.static + "/img/avatar.jpg"
const activities = [
  {
    content: '需求概述',
    time: '',
    hollow: true,
    // size: 'large',
    // type: 'primary',
    // icon: MoreFilled,
  },
  {
    content: '开发计划',
    time: '',
    // color: '#0bbd87',
  }
]
const tabs = ref({
  activeName: "1",
})
const planTabs = ref({
  activeName: "1",
})

const demand = ref({})
const user = ref({})

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

onBeforeMount(() => {
  GetDemand(route.query.did).then(res => {
    demand.value = res
    demand.value.plan = getDemandPlan(res["plan"])

    GetUser(demand.value.uid).then(res => {
      user.value = res
      console.log(demand.value, user.value)
    })
  })
})

</script>

<template>
  <el-row class="detail-main row column">
    <el-row class="row header">
      <el-col :span="20" class="basic-content">
        <el-row class="row title">{{ demand.name }}</el-row>
        <el-row class="row introduce">
          <el-col :span="6" class="description">
            <span>总金额</span>
            <span>{{ demand.remuneration }}</span>
          </el-col>
          <el-col :span="6" class="description">
            <span>时间</span>
            <span>{{ demand.remuneration }}</span>
          </el-col>
          <el-col :span="6" class="description">
            <span>人数</span>
            <span>1/{{ demand.recruitNum }}</span>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="4" class="flex-center flex-col">
        <el-avatar :size="60" :src="avatar"/>
        <span>{{ user?.nickname }}</span>
        <el-button v-if="user?.identity !== 1" @click="privateChat(demand?.id, demand?.uid)" type="primary">立即沟通
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
                    {{ demand.description }}
                  </div>
                </div>
                <div class="card-content">
                  <span class="title">
                    要求
                  </span>
                  <div>
                    <div>
                      <span>甲</span>
                      <span>后端工程师</span>
                      <span>前端工程师</span>
                    </div>
                  </div>
                </div>
                <div class="card-content">
                  <span class="title">
                    备注
                  </span>
                  <div>
                    {{ demand?.notes }}
                  </div>
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
                  @tab-click=""
              >
                <el-tab-pane label="总体计划" name="1">
                  <el-timeline>
                    <el-timeline-item v-for="item in demand?.plan" center>
                      <div class="flex-ai-center" style="margin: 5px 0;">
                        <el-icon :size="18">
                          <Timer/>
                        </el-icon>
                        &nbsp;
                        <el-date-picker
                            v-model="item.time"
                            type="date"
                            placeholder="Pick a day"
                        />
                      </div>
                      <el-card>
                        <el-row class="row" style="margin-bottom: 15px;">
                          <el-col :span="24" class="flex-ai-center">
                            <el-row class="row flex-ai-center">
                              <el-col :span="2">
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
                        <el-row class="row">
                          <el-col :span="24" class="flex-ai-center">
                            <el-row class="row flex-ai-center">
                              <el-col :span="2">
                                <span>内容：</span>
                              </el-col>
                              <el-col :span="18">
                                <el-input
                                    v-model="item.content"
                                    :rows="2"
                                    type="textarea"
                                    placeholder="计划内容"
                                />
                              </el-col>
                            </el-row>
                          </el-col>
                        </el-row>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </el-tab-pane>
                <el-tab-pane label="甲" name="2">甲</el-tab-pane>
                <el-tab-pane label="乙" name="3">乙</el-tab-pane>
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
    .basic-content {
      display: flex;
      justify-content: space-between;
      flex-direction: column;

      .title {
        font-size: 24px;
        font-weight: 500;
      }

      .introduce {
        display: flex;
        justify-content: start;
        align-items: center;

        .description {
          display: flex;
          justify-content: center;
          align-items: start;
          flex-direction: column;
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
        .plan-tabs {
          width: 100%;
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


.tag {
  margin: 5px 10px;
}

</style>
