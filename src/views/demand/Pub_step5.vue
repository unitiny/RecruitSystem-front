<script setup lang="ts">
import {ref, onMounted, onBeforeMount, defineProps, defineExpose} from "vue"
import {useRoute, useRouter} from "vue-router";
import {request} from "@/utils/axios";
import {API, payGroup} from "@/api/api";
import QRCode from "@/components/common/QRCode.vue"
import {elMsgOption} from "@/utils/utils";

const route = useRoute()
const router = useRouter()
const props = defineProps({
  demand: {
    type: Object,
    required: true
  },
  next: {
    type: Object,
    required: true
  }
})

const pay = ref({
  goodID: 0,
  good: "",
  fee: 0,
  way: 0,
  platform: 2,
  qrCode: "",
  outTradeNo: "",
  checkPayTimer: 0,
  hasPay: false
})

function payment() {
  request({
    url: payGroup.payment,
    method: API.POST,
    data: {
      orderID: pay.value.outTradeNo,
    }
  }).then(res => {
    if (res["message"] === "ok") {
      clearInterval(pay.value.checkPayTimer)
      pay.value.hasPay = true
      ElMessage({
        showClose: true,
        message: "支付成功",
        type: "success"
      })
      setTimeout(() => {
        props.next!(1)
      }, 2000)
    }
  })
}

function paymentIntend() {
  request({
    url: payGroup.paymentIntend,
    method: API.POST,
    data: {
      fee: pay.value.fee,
      platform: pay.value.platform,
      goodID: pay.value.goodID,
      goodName: pay.value.good,
      notes: "",
    }
  }).then(res => {
    pay.value.outTradeNo = res["out_trade_no"]
    pay.value.qrCode = res["qr_code"]
  })
}

function checkPay() {
  pay.value.checkPayTimer = setInterval(() => {
    request({
      url: payGroup.checkPayStatus,
      method: API.POST,
      data: {
        fee: pay.value.fee,
        platform: pay.value.platform,
        goodID: pay.value.goodID,
        goodName: pay.value.good,
        outTradeNo: pay.value.outTradeNo,
        notes: "",
      }
    }).then(res => {
      console.log(res)
      if (res["code"] === "10000") {
        pay.value.hasPay = true
        payment() // 支付成功，更新订单状态
      }
    })
  }, 5000)
}

function check() {
  if(!pay.value.hasPay) {
    ElMessage(elMsgOption("请先支付订单", "error"))
    return false
  }
  return true
}

function updateDemand(dm) {
  dm.value.hasPay = pay.value.hasPay
}

onBeforeMount(() => {
  pay.value.fee = props.demand.remuneration
  pay.value.goodID = props.demand.id
  pay.value.good = props.demand.name

  // pay.value.outTradeNo = "ali__2024-05-148a7969b1"
  // pay.value.good = "123"
  // pay.value.fee = 0.01
  paymentIntend()
  checkPay()
})

defineExpose({updateDemand, check})
</script>

<template>
  <div class="flex-col main">
    <!-- 付款信息 -->
    <div class="pay-info">
      <span class="icon iconfont icon-queren2"></span>
      <div class="tip">
        <p>商品名称：{{ pay.good }}</p>
      </div>
      <div class="amount">
        <span>应付总额：</span>
        <span>¥{{ pay.fee }}</span>
      </div>
    </div>

    <!-- 二维码 -->
    <div class="pay-type">
      <a :class="{'btn-active': pay.platform === 2, btn: true, alipay: true}" @click="selectPlatform(2)"></a>
      <div class="item">
        <QRCode v-if="pay.qrCode" :qrUrl="pay.qrCode"></QRCode>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main {
  width: 80%;
}

.pay-info {
  background: #fff;
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;

  .icon {
    font-size: 80px;
    color: #1dc779;
  }

  .tip {
    padding-left: 10px;
    flex: 1;

    p {
      &:first-child {
        font-size: 20px;
        margin-bottom: 5px;
      }

      &:last-child {
        color: #999;
        font-size: 16px;
      }
    }
  }

  .amount {
    span {
      &:first-child {
        font-size: 16px;
        color: #999;
      }

      &:last-child {
        color: #ea1f1f;
        font-size: 20px;
      }
    }
  }
}

.pay-type {
  margin-top: 20px;
  background-color: #fff;
  //padding-bottom: 20px;

  p {
    line-height: 70px;
    height: 70px;
    padding-left: 30px;
    font-size: 16px;

    &.head {
      border-bottom: 1px solid #f5f5f5;
    }
  }

  .btn {
    width: 150px;
    height: 50px;
    border: 1px solid #e4e4e4;
    text-align: center;
    line-height: 48px;
    margin-left: 30px;
    color: #666666;
    display: inline-block;

    &:hover {
      border-color: #2bd02b;
    }

    &.alipay {
      background: url(https://cdn.cnbj1.fds.api.mi-img.com/mi-mall/7b6b02396368c9314528c0bbd85a2e06.png) no-repeat center / contain;
    }

    &.wx {
      background: url(https://cdn.cnbj1.fds.api.mi-img.com/mi-mall/c66f98cff8649bd5ba722c2e8067c6ca.jpg) no-repeat center / contain;
    }
  }

  .btn-active {
    border-color: #2bd02b;
  }

  .item {
    margin-top: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.pay {
  display: flex;
  justify-content: end;
  align-items: center;
  margin: 20px 0;

  .btn {
    width: 150px;
    height: 50px;
    border: 1px solid #e4e4e4;
    text-align: center;
    line-height: 48px;
    margin-left: 30px;
    color: #ffffff;
    display: inline-block;
    background: #01a901;
  }

  .back {
    color: #01a901;
    background: white;
    border: solid 1px #01a901;
  }
}
</style>
