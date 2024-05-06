<script setup lang="ts">
import {onMounted, ref} from "vue";
import {request} from "@/utils/axios";
import {API, demandGroup} from "@/api/api";
import {useGlobalStore} from "@/store/pinia";
import {useRouter} from "vue-router"
import {diffDay, getTags, getPaymentWay, copy, elMsgOption} from "@/utils/utils";
import {global} from "@/static/static";
import {Delete} from "@element-plus/icons-vue";
import Demand from "@/components/demand/Demand.vue";
import {Action} from "element-plus";

const store = useGlobalStore()
const router = useRouter()

const contentRef = ref()
const scrollerHeight = ref("")

const demandCtl = ref({
  checkDemand: [],
  checkAll: false,
  operateVisible: {}
})
const demandList = ref([])
const demandTotal = ref(-1)
const demandRequest = ref({
  start: 0,
  limit: 10,
  order: "",
  uid: store["user"].id,
  typ: 0,
  duration: 0,
  remuneration: 0,
  status: 0,
  recruitNum: 0,
  requireTag: 0,
  tag: 0,
  searchVal: "",
})
const demandRequestCopy = {
  start: 0,
  limit: 10,
  order: "",
  uid: store["user"].id,
  typ: 0,
  duration: 0,
  remuneration: 0,
  status: 0,
  recruitNum: 0,
  requireTag: 0,
  tag: 0,
  searchVal: "",
}

const searchData = ref({
  searchVal: "",
  optionList: [
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

const demandOpts = ref([
  {
    text: "更新进度",
    path: "/userdemand/arrangeplan",
  }
])

function getDemandList() {
  if (demandList.value.length === demandTotal.value) {
    return
  }
  request({
    url: demandGroup.list,
    params: demandRequest.value
  }).then(res => {
    demandList.value.push(...res["list"])
    demandTotal.value = res["total"]
    console.log(res)
    demandRequest.value.start += demandRequest.value.limit
  })
}

function searchDemandList() {
  demandList.value = []
  demandRequest.value.start = 0
  demandRequest.value.searchVal = searchData.value.searchVal
  demandRequest.value.typ = parseInt(searchData.value.optionList[0].value)
  demandRequest.value.duration = parseInt(searchData.value.optionList[1].value)
  demandRequest.value.status = parseInt(searchData.value.optionList[2].value)
  demandRequest.value.tag = parseInt(searchData.value.optionList[3].value)
  console.log(searchData.value, demandRequest)
  getDemandList()
}

function resetSearch() {
  demandRequest.value = copy(demandRequestCopy)
  demandTotal.value = -1
  searchData.value.searchVal = ""
  for (const item of searchData.value.optionList) {
    item.value = ""
  }
  getDemandList()
}

function editDemand(did) {
  router.push({
    path: "/demand/pub",
    query: {
      "did": did
    }
  })
}

function editDemandPlan(did) {
  router.push({
    path: "/userdemand/arrangeplan",
    query: {
      "did": did
    }
  })
}

function delDemand(did: number) {
  let msg = {
    showClose: true,
    message: "删除成功",
    type: "success"
  }
  request({
    url: demandGroup.del,
    method: API.DELETE,
    params: {
      did: did
    }
  }).then(res => {
    demandList.value = demandList.value.filter(d => d.id !== did)
    demandTotal.value = demandList.value.length
  }).catch(err => {
    msg.type = "error"
    msg.message = err
  }).finally(() => {
    ElMessage(msg)
  })
}

function delList() {
  request({
    url: demandGroup.delList,
    method: API.DELETE,
    params: {
      didArr: demandCtl.value.checkDemand.join(",")
    }
  }).then(res => {
    ElMessage(elMsgOption("删除成功"))
    demandList.value = demandList.value.filter(function (item) {
      return demandCtl.value.checkDemand.indexOf(item.id) === -1
    })
    demandTotal.value = demandList.value.length
    demandCtl.value.checkDemand = []
  }).catch(err => {
    ElMessage(elMsgOption("删除失败", "error"))
  })
}

function skip(path, query) {
  router.push({
    name: path,
    query: query
  })
}

function getScrollerHeight() {
  scrollerHeight.value = `${contentRef.value.offsetHeight * 0.88}px`
}

function checkAllDemand(val: boolean) {
  demandCtl.value.checkDemand = []
  if (!val) {
    return
  }

  for (const item of demandList.value) {
    demandCtl.value.checkDemand.push(item.id)
  }
}

function showDelAllTip() {
  ElMessageBox.alert('是否要删除所选项', '提示', {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: 'OK',
    callback: (action: Action) => {
      if (action === "confirm") {
        delList()
      }
    },
  })
}

function showDelTip(did) {
  ElMessageBox.alert('是否要删除所选项', '提示', {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: 'OK',
    callback: (action: Action) => {
      if (action === "confirm") {
        delDemand(did)
      }
    },
  })
}

function operateVisible(did, visible) {
  demandCtl.value.operateVisible[did] = visible
}

onMounted(() => {
  getScrollerHeight()
})
</script>

<template>
  <el-row class="demands-main">
    <el-col :span="4" class="sidebar column">
      <el-card class="column row sidebar-card">
        <div>筛选</div>
        <div>
          <el-input
              v-model="searchData.searchVal"
              @change="searchDemandList"
              placeholder="Type something">
            <template #prefix>
              <el-icon class="el-input__icon">
                <search/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <div v-for="item in searchData.optionList">
          <el-select
              :collapse-tags-tooltip="true"
              v-model="item.value"
              @change="searchDemandList"
              class="m-2"
              :placeholder="item.text"
              clearable
              size="default"
              style="width: 100%;">
            <el-option
                v-for="item1 in item.options"
                :key="item1.value"
                :label="item1.label"
                :value="item1.value"
            />
          </el-select>
        </div>
        <div>
          <el-button @click="resetSearch" type="primary" style="width: 100%;">清空条件</el-button>
        </div>
      </el-card>
    </el-col>
    <el-col :span="18" class="demands-content column">
      <div ref="contentRef" style="height: 100%;width: 100%;">
        <el-row class="row">
          <el-card class="header">
            <span>
              <el-checkbox
                  size="large"
                  v-model="demandCtl.checkAll"
                  :indeterminate="demandCtl.checkDemand.length > 0 &&
                demandCtl.checkDemand.length !== demandList.length"
                  @change="checkAllDemand"></el-checkbox>
              <span>&nbsp;全选</span>
            </span>
            <span><el-button type="danger" @click="showDelAllTip">全部删除</el-button></span>
          </el-card>
        </el-row>
        <el-row v-if="demandList.length <= 0 && demandTotal === 0"
                class="row column">
          <el-empty description="暂无数据" style="width: 100%;"/>
        </el-row>
        <el-row v-else v-infinite-scroll="getDemandList"
                infinite-scroll-immediate="true"
                :style="{height: scrollerHeight}"
                class="demand-list">
          <el-checkbox-group
              class="check-group"
              v-model="demandCtl.checkDemand">
            <div v-for="item in demandList"
                 :key="item.id" class="row demand-block">
              <el-checkbox size="large"
                           :label="item?.id"
                           :value="item?.id"></el-checkbox>
              <Demand
                  @mouseover="operateVisible(item?.id, true)"
                  @mouseleave="operateVisible(item?.id, false)"
                  :demand="item"
                  class="demand">
                <transition name="slide-right">
                  <div v-if="demandCtl.operateVisible[item?.id]" class="slide-item">
                    <div class="demand-operate" @click.stop="">
                      <span @click.stop="editDemand(item?.id)">编辑</span>
                      <span @click.stop="editDemandPlan(item?.id)">进度</span>
                      <span @click.stop="showDelTip(item?.id)">删除</span>
                    </div>
                    <div class="tri"></div>
                  </div>
                </transition>
              </Demand>
            </div>
          </el-checkbox-group>
        </el-row>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.demands-main {
  padding: 20px 40px;
  height: 92%;
  width: 100%;

  .sidebar {
    .sidebar-card {
      display: flex;
      justify-content: center;
      align-items: start;

      div {
        width: 100%;
        margin-bottom: 10px;
      }
    }
  }

  .demands-content {
    padding-left: 15px;

    .header {
      width: 100%;
      margin-bottom: 10px;
      display: flex;
      justify-content: start;
      align-items: center;

      span {
        margin-right: 10px;
      }
    }

    .demand-list {
      //max-height: 700px;
      .check-group {
        width: 100%;

        .demand-block {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .demand {
            width: 95%;
            color: black;

            .demand-operate {
              display: flex !important;
              background: #a3d4d7 !important;
              color: black;
              justify-content: space-around;
              align-items: center;
              padding-left: 20px;
              width: 100%;
              height: 100%;

              span {
                width: 60px;
                font-size: 16px;
              }
            }

            .tri {
              position: absolute;
              left: -10%;
              top: 0;
              height: 100%;
              width: 20%;
              background: $demand-footer;
              transform: skewX(-30deg);
            }
          }
        }
      }
    }
  }
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-thumb {
  display: none;
  position: absolute;
  margin-left: 46px;
  background-color: #c5c5c5;
  border-radius: 3px;
}

:deep(.el-checkbox__label) {
  display: none;
}

.el-checkbox__label {
  width: 100%;
}

.demand-list {
  width: 100%;
  //height: 400px;
  overflow: auto;
  list-style: none;
  justify-content: start;
}

.slide-item {
  position: absolute;
  right: 0;
  width: 90%;
  height: 100%;
}

.slide-right-enter-active {
  transition: all 0.7s ease;
  transform: translateX(100%);
}

.slide-right-leave-active {
  transition: all 0.7s ease;
  transform: translateX(0);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to {
  transform: translateX(0);
}

.slide-top-enter-active {
  transition: all 0.7s ease;
  transform: translateY(100%);
}

.slide-top-leave-active {
  transition: all 0.7s ease;
  transform: translateY(0);
}

.slide-top-leave-to {
  transform: translateY(100%);
}

.slide-top-enter-to {
  transform: translateY(0);
}
</style>
