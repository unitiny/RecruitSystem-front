<script setup lang="ts">
import {Search} from '@element-plus/icons-vue'
import {ref} from "vue";
import {global} from "@/static/static";
import {request} from "@/utils/axios";
import {demandGroup} from "@/api/api";
import Demand from "@/components/demand/Demand.vue"
import {diffDay, getTags, getPaymentWay} from "@/utils/utils";
import router from "@/router";
import {useGlobalStore} from "@/store/pinia";

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

const store = useGlobalStore()
const scrollerRef = ref(null)
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
  demandRequest.tag = parseInt(searchData.value.optionList[6].value)
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

function scrollerToTop() {
  scrollerRef.value.scrollTop = 0
}
</script>

<template>
  <div class="home-main">
    <el-button class="backTop" circle @click.stop="scrollerToTop">
      <el-icon>
        <ArrowUp/>
      </el-icon>
    </el-button>
    <el-row class="main">
      <div ref="scrollerRef" v-infinite-scroll="getDemandList" infinite-scroll-immediate="true"
           class="demand-list content">
          <!--  搜索板块  -->
          <el-row class="search-board">
            <el-row class="search">
              <el-input
                  v-model="searchData.searchVal"
                  @change="searchDemandList"
                  placeholder="Please input"
                  size="large"
                  class="input">
              </el-input>
              <el-button class="button" type="primary">
                <el-icon>
                  <Search/>
                </el-icon>
                &nbsp;搜索
              </el-button>
            </el-row>
            <el-row>
              <el-col :span="6" :gutter="20" style="margin-bottom: 10px"
                      v-for="item in searchData.optionList">
                <el-select
                    :collapse-tags-tooltip="true"
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
          </el-row>

          <!--  需求列表  -->
          <Demand v-for="item in demandList" :key="item.id" :demand="item"></Demand>
      </div>
      <!--  TODO 分页-->
    </el-row>
  </div>

</template>

<style scoped lang="scss">
.home-main {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.backTop {
  z-index: 100;
  position: fixed;
  width: 45px;
  height: 45px;
  bottom: 50px;
  right: 50px;
}

.main {
  justify-content: center;
  width: 100%;
  height: 100%;
  color: black;
}

.search-board {
  border-radius: 10px;
  //border: solid 1px #2f2f2f;
  background: white;
  width: 80%;
  height: 220px;
  margin: 20px auto;
  padding: 20px 40px;
  box-shadow: var(--el-box-shadow-light);

  .search {
    width: 100%;
    margin-bottom: 40px;

    .input {
      width: 80%;
    }

    .button {
      border-radius: 0 5px 5px 0;
      font-size: 18px;
      width: 20%;
      height: 100%;
    }
  }
}

.demand-list {
  width: 100%;
  height: 80%;
  overflow: auto;
  list-style: none;
  justify-content: center;
}
</style>
