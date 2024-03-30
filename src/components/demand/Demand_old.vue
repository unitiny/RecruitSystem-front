<script setup lang="ts">
import {ref} from "vue/dist/vue";
import {request} from "@/utils/axios";
import {demandGroup} from "@/api/api";
import router from "@/router";
import {diffDay, getTags, getPaymentWay} from "@/utils/utils";


const demandList = ref([])
const demandTotal = ref(-1)
const demandRequest = {
  start: 0,
  limit: 10,
  order: "",
  uid: 0,
  typ: 0,
  duration: 0,
  remuneration: 0,
  status: 0,
  recruitNum: 0,
  requireTag: 0,
  tag: 0,
  searchVal: "",
}

function getDemandList() {
  if (demandList.value.length === demandTotal.value) {
    return
  }
  request({
    url: demandGroup.list,
    params: demandRequest
  }).then(res => {
    demandList.value.push(...res["list"])
    demandTotal.value = ref["total"]
    console.log(demandList.value)
    demandRequest.start += demandRequest.limit
  })
}

function demandDetail(did) {
  router.push({
    name: "/demand/detail",
    query: {
      did: did
    }
  })
}

</script>

<template>
  <el-row v-for="item in demandList" :key="item.id"
          :span="24"
          @click="demandDetail(item.id)"
          class="board">
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
            <el-col :span="4" style="margin: 0 0 10px 0;" v-if="item.hasPay">
              <el-tag type="info" style="color: black">已付款</el-tag>
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
</template>

<style scoped lang="scss">

</style>
