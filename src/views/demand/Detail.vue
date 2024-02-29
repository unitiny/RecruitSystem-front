<script setup lang="ts">
import {MoreFilled} from '@element-plus/icons-vue'
import {global} from "@/static/static";
import {onBeforeMount, ref} from "vue"
import {useRouter} from "vue-router";
import {useRoute} from "vue-router";
import {getPaymentWay, diffDay} from "@/utils/utils";
import {GetDemand} from "@/api/api";

const route = useRoute()
const router = useRouter()
const avatar = global.path.static + "/img/avatar.jpg"
const activities = [
  {
    content: '需求概述',
    timestamp: '',
    hollow: true,
    // size: 'large',
    // type: 'primary',
    // icon: MoreFilled,
  },
  {
    content: '开发计划',
    timestamp: '',
    // color: '#0bbd87',
  }
]
const demand = ref()


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
            :timestamp="activity.timestamp">
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
                    <span class="tag">￥{{demand?.remuneration}}</span>
                    <span class="tag">{{ getPaymentWay(demand?.paymentWay) }}</span>
                  </div>
                </div>
                <div>
                   <span class="title">
                      工期
                   </span>
                   <div>
                     <span class="tag">{{diffDay(demand?.start, demand?.end)}}天</span>
                     <span class="tag">起 {{demand?.start}}</span>
                     <span class="tag">末 {{demand?.end}}</span>
                   </div>
                </div>
                <div>
                  <span class="title">
                    描述
                  </span>
                  <div>
                        {{demand?.decription}}
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
                    {{demand?.notes}}
                  </div>
                </div>
              </div>
            </el-card>
          </el-row>

          <!--  开发计划  -->
          <el-row class="board row">
            <div class="card-header">开发计划</div>
            <el-card shadow="always" class="card box-card">
              <div class="card-content">
                <el-timeline>
                  <el-timeline-item center timestamp="2018/4/12" placement="top">
                    <el-card>
                      <h4>Update Github template</h4>
                      <p>Tom committed 2018/4/12 20:46</p>
                    </el-card>
                  </el-timeline-item>
                  <el-timeline-item timestamp="2018/4/3" placement="top">
                    <el-card>
                      <h4>Update Github template</h4>
                      <p>Tom committed 2018/4/3 20:46</p>
                    </el-card>
                  </el-timeline-item>
                  <el-timeline-item center timestamp="2018/4/2" placement="top">
                    Event start
                  </el-timeline-item>
                  <el-timeline-item timestamp="2018/4/2" placement="top">
                    Event end
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-row>
        </el-row>
      </el-scrollbar>
    </el-col>
    <el-col :span="6">
      <el-card shadow="always">
        <el-avatar :size="60" :src="avatar" style="margin-right: 10px;"/>
        <el-button @click="privateChat(demand?.id, demand?.uid)" type="primary">立即沟通</el-button>
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
