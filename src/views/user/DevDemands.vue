<script setup lang="ts">
import {ref} from "vue";
import {request} from "@/utils/axios";
import {API, demandGroup, userDemandGroup} from "@/api/api";
import {useGlobalStore} from "@/store/pinia";
import {useRouter} from "vue-router"
import {diffDay, getTags, getPaymentWay} from "@/utils/utils";
import {global} from "@/static/static";

const store = useGlobalStore()
const router = useRouter()

const avatar = global.path.static + '/img/avatar.jpg'
const userDemandList = ref([])
const userDemandRequest = {
  start: 0,
  limit: 10,
  order: "",
  applicantID: store["user"].id,
  status: 0,
  searchVal: "",
}
const demandList = ref([])
const demandTotal = ref(-1)

function arrangePlan(did) {
  router.push({
    name: "/userdemand/devarrangeplan",
    query: {
      did: did
    }
  })
}

function getDemandList() {
  if (demandList.value.length === demandTotal.value) {
    return
  }
  request({
    url: userDemandGroup.list,
    params: userDemandRequest
  }).then(res => {
    userDemandList.value.push(...res["list"])
    userDemandRequest.start += userDemandRequest.limit

    for (const val of res["list"]) {
      demandList.value.push(val["Demand"])
    }
    demandTotal.value = res["total"]
    console.log(userDemandList.value, demandList.value)
  })
}
</script>

<template>
  <el-row class="container content">
    <el-row v-infinite-scroll="getDemandList" infinite-scroll-immediate="true" class="demand-list">
      <el-row v-for="item in demandList" :key="item.id"
              @click="arrangePlan(item.id)"
              :span="24" class="board">
        <el-col class="body">
          <el-row :span="24" style="padding: 10px;">
            <el-col :span="20">
              <el-row class="flex-ai-center">
                <el-col :span="6">{{ item.name }}</el-col>
                <el-col :span="6" class="flex-ai-center">
                  <b>1/{{ item.recruitNum }}</b>&nbsp;
                  <el-icon>
                    <UserFilled/>
                  </el-icon>
                </el-col>
                <el-col :span="6" v-if="item.type === 2">
                  <el-tag>合伙人</el-tag>
                </el-col>
              </el-row>
              <el-row style="margin-top: 10px;">
                <el-col :span="4" style="margin: 0 0 10px 0;">
                  <el-tag type="info" style="color: black">￥{{ item.remuneration }}</el-tag>
                </el-col>
                <el-col :span="4" style="margin: 0 0 10px 0;">
                  <el-tag type="info" style="color: black">{{ diffDay(item.start, item.end) }}天</el-tag>
                </el-col>
                <el-col :span="4" style="margin: 0 0 10px 0;" v-if="item.paymentWay !== 0">
                  <el-tag type="info" style="color: black">{{ getPaymentWay(item.paymentWay) }}</el-tag>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="4">
              <el-avatar :size="40" :src="avatar" style="margin-right: 10px;"/>
            </el-col>
          </el-row>
          <el-row>
            {{ item.demand }}
          </el-row>
        </el-col>
        <el-row class="footer flex-ai-center">
          <span v-for="item1 in getTags(item.requireTags)" style="margin-right: 10px;">{{ item1 }}</span>
        </el-row>
      </el-row>
    </el-row>
  </el-row>
</template>

<style scoped lang="scss">
.main {
  justify-content: center;
}

.board {
  border-radius: 10px;
  border: solid 1px #2f2f2f;
  width: 80%;
  height: 220px;
  margin: 20px 0;

  .body {
    padding: 20px;
  }

  .footer {
    width: 100%;
    padding: 10px 20px;
    background: #cbedef;
    border-radius: 0 0 5px 5px;
  }
}

.demand-list {
  width: 100%;
  height: 400px;
  overflow: auto;
  list-style: none;
  justify-content: center;
}
</style>
