<script setup lang="ts">
import {MoreFilled} from '@element-plus/icons-vue'
import {global} from "@/static/static";
import {onBeforeMount, ref} from "vue"
import {useRouter} from "vue-router";
import {useRoute} from "vue-router";
import {getPaymentWay, diffDay} from "@/utils/utils";
import {GetDemand, GetUser} from "@/api/api";

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
const demand = ref({})
const user = ref({})

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
    demand.value.plan = JSON.parse(res["plan"])

    GetUser(demand.value.uid).then(res => {
      console.log(demand.value, res, user.value)
      user.value = res
    })
  })
})
</script>

<template>
  <el-row class="row column">
    <el-col :span="4" class="sidebar-ctl">
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :icon="activity.icon"
            :type="activity.type"
            :color="activity.color"
            :size="activity.size"
            :hollow="activity.hollow"
            :timestamp="activity.time">
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-col>
    <el-col :span="12">
      <el-scrollbar class="scrollbar">
        <el-row class="main row flex-jc-center">
          <!--  需求详情  -->
          <el-row class="board row">
            <div class="card-header">需求详情</div>
            <el-card shadow="always" class="card box-card">
              <div class="card-content">
                <div class="row">
                  <el-row>
                    <el-col :span="6">
                      {{ demand?.name }}
                    </el-col>
                    <el-col :span="12">
                      <el-tag v-if="demand?.type === 2">合伙人</el-tag>
                    </el-col>
                    <el-col :span="6">
                      1 / {{ demand?.recruitNum }}
                    </el-col>
                  </el-row>
                </div>
                <div>
                  <span class="title">
                    酬劳
                  </span>
                  <div>
                    <span class="tag">￥{{ demand?.remuneration }}</span>
                    <span class="tag">{{ getPaymentWay(demand?.paymentWay) }}</span>
                  </div>
                </div>
                <div>
                   <span class="title">
                      工期
                   </span>
                  <div>
                    <span class="tag">{{ diffDay(demand?.start, demand?.end) }}天</span>
                    <span class="tag">起 {{ demand?.start }}</span>
                    <span class="tag">末 {{ demand?.end }}</span>
                  </div>
                </div>
                <div>
                  <span class="title">
                    描述
                  </span>
                  <div>
                    {{ demand?.decription }}
                  </div>
                </div>
                <div>
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
                <div>
                  <span class="title">
                    备注
                  </span>
                  <div>
                    {{ demand?.notes }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-row>

          <!--  开发计划  -->
          <el-row class="board row">
            <div class="card-header">开发计划</div>
            <el-card shadow="always" class="card box-card">
              <template style="display: block;">
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
              </template>
            </el-card>
          </el-row>
        </el-row>
      </el-scrollbar>
    </el-col>
    <el-col :span="6">
      <el-card shadow="always">
        <el-row>
          <el-col :span="8">
            <el-avatar :size="60" :src="avatar" style="margin-right: 10px;"/>
          </el-col>
          <el-col :span="16" class="flex-col flex-jc-center">
            <span>{{ user?.nickname }}</span>
            <el-button v-if="user?.identity !== 1" @click="privateChat(demand?.id, demand?.uid)" type="primary">立即沟通</el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>

</template>

<style scoped lang="scss">
.sidebar-ctl {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scrollbar {
  height: 550px;
  width: 100%;
}

.main {
  .board {
    min-width: 400px;
    width: 80%;
    margin: 10px 0;
  }
}

.card-header {
  background: $theme-bgc;
  width: 100%;
  height: 50px;
  padding: 10px;
  color: black;
  font-weight: 500;
}

.card {
  width: 100%;

  .card-content {
    div {
      margin: 10px 0;
    }
  }
}

.title {
  background: #D9D9D9;
  padding: 5px 8px;
}

.tag {
  margin: 5px 10px;
}

</style>
