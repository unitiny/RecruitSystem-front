<script setup lang="ts">
import {onMounted, ref} from "vue"
import {TabsPaneContext} from "element-plus";
import {request} from "@/utils/axios";
import {API, payGroup, walletGroup} from "@/api/api";
import {getMoney} from "@/utils/utils";
import {useGlobalStore} from "@/store/pinia";

const store = useGlobalStore()
const tabActiveName = ref('income')
const wallet = ref({})
const incomeList = ref([])
const incomeTotal = ref(0)

const drawList = ref([])
const drawTotal = ref(0)

const withdraw = ref({
  visible: false,
  fee: 0,
  account: ""
})

function draw() {
  request({
    url: walletGroup.draw,
    method: API.POST,
    data: {
      fee: withdraw.value.fee.toString(),
      notes: "支付宝：" + withdraw.value.account
    }
  }).then(res => {
    withdraw.value.visible = false
    wallet.value.balanceFee -= withdraw.value.fee
    withdraw.value.fee = 0
    ElMessage({
      showClose: true,
      message: "提交成功，等待审核",
      type: "success"
    })
  })
}

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
      type: "income"
    }
  }).then(res => {
    incomeList.value = res["list"]
    incomeTotal.value = res["total"]
  })

  request({
    url: walletGroup.list,
    params: {
      uid: store["user"].id,
      type: "draw"
    }
  }).then(res => {
    drawList.value = res["list"]
    drawTotal.value = res["total"]
  })
})
</script>

<template>
  <div>
    <el-row class="row wallet" :gutter="20">
      <el-col :span="8" class="column">
        <el-card>
          <div>可用金额</div>
          <div>
            ￥{{ getMoney(wallet["wallet"]?.balanceFee) }}
          </div>
          <div>
            <el-button @click="withdraw.visible=true" type="success">提现</el-button>
            <el-dialog
                v-model="withdraw.visible"
                title="提现"
                width="500">
              <div>
                <span>可用金额：</span>
                <span>￥{{ getMoney(wallet["wallet"]?.balanceFee) }}</span>
              </div>
              <div>
                <span>支付宝账号：</span>
                <span>
                   <el-input v-model="withdraw.account"></el-input>
                </span>
              </div>
              <div>
                <span>提现金额：</span>
                <span>
                   <el-input v-model="withdraw.fee"></el-input>
                </span>
              </div>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="withdraw.visible = false">Cancel</el-button>
                  <el-button type="primary" @click="draw">
                    Confirm
                  </el-button>
                </div>
              </template>
            </el-dialog>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="column">
        <el-card>
          <div>当月收入</div>
          <div>￥{{ getMoney(wallet["wallet"]?.balanceFee) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8" class="column">
        <el-card>
          <div>当月提现</div>
          <div>￥{{ getMoney(wallet["wallet"]?.balanceFee) }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="row">
      <el-card>
        <el-tabs v-model="tabActiveName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="收款" name="income">
            <el-table :data="incomeList" style="width: 100%">
              <el-table-column prop="orderID" label="流水号" width="200"/>
              <el-table-column prop="date" label="日期" width="150"/>
              <el-table-column prop="originUserName" label="付款方" width="120"/>
              <el-table-column prop="fee" label="金额" width="100"/>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="提现" name="withdraw">
            <el-table :data="drawList" style="width: 100%">
              <el-table-column prop="orderID" label="流水号" width="200"/>
              <el-table-column prop="date" label="日期" width="150"/>
              <el-table-column prop="originUserName" label="付款方" width="120"/>
              <el-table-column prop="fee" label="金额" width="100"/>
              <el-table-column prop="status" label="状态" width="100"/>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.wallet {
  margin-bottom: 15px;
}
</style>
