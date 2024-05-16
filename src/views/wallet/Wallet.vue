<script setup lang="ts">
import {onMounted, ref} from "vue"
import {TabsPaneContext} from "element-plus";
import {request} from "@/utils/axios";
import {API, payGroup, walletGroup} from "@/api/api";
import {getMoney} from "@/utils/utils";
import {useGlobalStore} from "@/store/pinia";

const store = useGlobalStore()
const tabActiveName = ref('pay')
const wallet = ref({})
const payList = ref([])
const payTotal = ref(0)

function handleClick(tab: TabsPaneContext, event: Event) {
  console.log(tab, event)
}

onMounted(() => {
  request({
    url: walletGroup.getBasicData
  }).then(res => {
    wallet.value = res
  })

  request({
    url: walletGroup.list,
    params: {
      uid: store["user"].id,
      type: "pay"
    }
  }).then(res => {
    payList.value = res["list"]
    payTotal.value = res["total"]
  })
})
</script>

<template>
  <div class="main">
    <el-row class="row wallet" :gutter="20">
      <el-col :span="12" class="column">
        <el-card>
          <div>总支出</div>
          <div>
            ￥{{ wallet["wallet"]?.outcome }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="column">
        <el-card>
          <div>当月支出</div>
          <div>￥{{ wallet["wallet"]?.outcome }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="row">
      <el-card class="row">
        <el-tabs v-model="tabActiveName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="支出" name="pay">
            <el-table :data="payList" style="width: 100%">
              <el-table-column prop="orderID" label="流水号" width="200"/>
              <el-table-column prop="date" label="日期" width="150"/>
              <el-table-column prop="goodName" label="商品" width="120"/>
              <el-table-column prop="fee" label="金额" width="100"/>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.main {
  width: 70%;
}

.wallet {
  margin-bottom: 15px;
}
</style>
