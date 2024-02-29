<script setup lang="ts">
import {Search} from '@element-plus/icons-vue'
import {ref} from "vue";
import {global} from "@/static/static";
import {request} from "@/utils/axios";
import {demandGroup} from "@/api/api";
import {diffDay, getTags, getPaymentWay} from "@/utils/utils";
import router from "@/router";

const avatar = global.path.static + '/img/avatar.jpg'
const searchData = ref({
  searchVal: "",
  optionList: [
    {
      text: "招募要求",
      value: "",
      options: [
        {
          value: 1,
          label: "UI"
        },
        {
          value: 2,
          label: "前端"
        },
        {
          value: 3,
          label: "后端"
        },
        {
          value: 4,
          label: "运维"
        },
        {
          value: 5,
          label: "产品"
        },
        {
          value: 6,
          label: "测试"
        },
      ]
    },
    {
      text: "招募类型",
      value: "",
      options: [
        {
          value: 1,
          label: "开发者"
        },
        {
          value: 2,
          label: "合伙人"
        },
      ]
    },
    {
      text: "支付金额",
      value: "",
      options: [
        {
          value: 1,
          label: "100以下"
        },
        {
          value: 2,
          label: "101-1000"
        },
        {
          value: 3,
          label: "1001-2000"
        },
      ]
    },
    {
      text: "开发周期",
      value: "",
      options: [
        {
          value: 1,
          label: "3天内"
        },
        {
          value: 2,
          label: "3-7天"
        },
        {
          value: 3,
          label: "两周"
        },
        {
          value: 4,
          label: "一个月"
        },
      ]
    },
    {
      text: "招募人数",
      value: "",
      options: [
        {
          value: 1,
          label: "1"
        },
        {
          value: 2,
          label: "2-5"
        },
        {
          value: 3,
          label: "6-10"
        },
      ]
    },
    {
      text: "需求状态",
      value: "",
      options: [
        {
          value: 1,
          label: "招募中"
        },
        {
          value: 2,
          label: "开发中"
        },
        {
          value: 3,
          label: "已完结"
        },
      ]
    },
    {
      text: "需求标签",
      value: "",
      options: [
        {
          value: 1,
          label: "分期付款"
        },
        {
          value: 2,
          label: "已付款"
        },
      ]
    }]
})

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

function searchDemandList() {
  demandList.value = []
  demandRequest.start = 0
  demandRequest.searchVal = searchData.value.searchVal
  demandRequest.requireTag = parseInt(searchData.value.optionList[0].value)
  demandRequest.typ = parseInt(searchData.value.optionList[1].value)
  demandRequest.remuneration = parseInt(searchData.value.optionList[2].value)
  demandRequest.duration = parseInt(searchData.value.optionList[3].value)
  demandRequest.recruitNum = parseInt(searchData.value.optionList[4].value)
  demandRequest.status = parseInt(searchData.value.optionList[5].value)
  demandRequest.tag  = parseInt(searchData.value.optionList[6].value)
  console.log(searchData.value, demandRequest)

  getDemandList()
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
  <el-row class="container content main">
    <!--  搜索板块  -->
    <el-row :span="24" class="board">
      <el-col class="body">
        <el-row :span="24" style="margin-bottom: 40px">
          <el-input
              v-model="searchData.searchVal"
              @change="searchDemandList"
              placeholder="Please input"
              class="input-with-select"
              size="large">
            <!--            <template #prepend>-->
            <!--              <el-select v-model="select" placeholder="Select" style="width: 115px">-->
            <!--                <el-option label="Restaurant" value="1"/>-->
            <!--                <el-option label="Order No." value="2"/>-->
            <!--                <el-option label="Tel" value="3"/>-->
            <!--              </el-select>-->
            <!--            </template>-->
            <template #append>
              <el-button :icon="Search"/>
            </template>
          </el-input>
        </el-row>
        <el-row>
          <el-col :span="6" :gutter="20" style="margin-bottom: 10px"
                  v-for="item in searchData.optionList">
            <el-select
                v-model="item.value"
                @change="searchDemandList"
                class="m-2"
                :placeholder="item.text"
                clearable
                size="default"
                style="width: 150px">
              <el-option
                  v-for="item1 in item.options"
                  :key="item1.value"
                  :label="item1.label"
                  :value="item1.value"
              />
            </el-select>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!--  需求列表  -->
    <el-row v-infinite-scroll="getDemandList" infinite-scroll-immediate="true" class="demand-list">
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
