<script setup lang="ts">
import {ref} from "vue";
import {request} from "@/utils/axios";
import {API, demandGroup} from "@/api/api";
import {useGlobalStore} from "@/store/pinia";
import {useRouter} from "vue-router"
import {diffDay, getTags, getPaymentWay} from "@/utils/utils";
import {global} from "@/static/static";
import {Delete} from "@element-plus/icons-vue";

const store = useGlobalStore()
const router = useRouter()

const avatar = global.path.static + '/img/avatar.jpg'
const demandList = ref([])
const demandTotal = ref(-1)
const demandRequest = {
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

function editDemand(did) {
  router.push({
    path: "/demand/pub",
    query: {
      "did": did
    }
  })
}

function delDemand(did) {
  request({
    url: demandGroup.del,
    method: API.DELETE,
    params: {
      did: did
    }
  }).then(res => {
    demandList.value = demandList.value.filter(d => d.id !== did)
  })
}
</script>

<template>
  <el-row class="container content">
    <el-row v-infinite-scroll="getDemandList" infinite-scroll-immediate="true" class="demand-list">
      <el-row v-for="item in demandList" :key="item.id" :span="24" class="board">
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
          <el-icon @click="editDemand(item.id)">
            <EditPen/>
          </el-icon>
          &nbsp;
          <el-popconfirm @confirm="delDemand(item.id)" title="Are you sure to delete this?">
            <template #reference>
              <el-icon>
                <Delete/>
              </el-icon>
            </template>
          </el-popconfirm>
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
