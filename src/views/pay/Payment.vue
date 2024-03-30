<script setup lang="ts">
import {ref, onMounted, onBeforeMount} from "vue"
import {useRoute, useRouter} from "vue-router";
import {request} from "@/utils/axios";
import {API, payGroup} from "@/api/api";
import QRCode from "@/components/common/QRCode.vue"

const route = useRoute()
const router = useRouter()

const pay = ref({
  goodID: 0,
  good: "",
  fee: 0,
  way: 0,
  platform: 2,
  qrCode: "",
  outTradeNo: "",
  checkPayTimer: 0,
})

function payment() {
  request({
    url: payGroup.payment,
    method: API.POST,
    data: {
      orderID: pay.value.outTradeNo,
    }
  }).then(res => {
    if(res["message"] === "ok") {
      clearInterval(pay.value.checkPayTimer)
      ElMessage({
        showClose: true,
        message: "支付成功",
        type: "success"
      })
      setTimeout(() => {
        back()
      }, 1500)
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
        payment() // 支付成功，更新订单状态
      }
    })
  }, 5000)
}

function back() {
  router.push(route.query.returnURL as string)
}

function selectPlatform(val) {
  pay.value.platform = val
}

onBeforeMount(() => {
  pay.value.fee = parseInt(route.query.fee as string)
  pay.value.goodID = parseInt(route.query.goodID as string)
  pay.value.good = route.query.good as string

  // pay.value.outTradeNo = "ali__9a0f8afc-52e0-45c9-a336-640f9fcef21c"
  pay.value.good = "123"
  pay.value.fee = 0.01
  paymentIntend()
  checkPay()
})
</script>

<template>
  <div class="flex-col main">
    <!-- 付款信息 -->
    <el-card shadow="always" style="margin: 20px 0;">
      <div class="pay-info">
        <span class="icon iconfont icon-queren2"></span>
        <div class="tip">
          <p>商品名称：{{ pay.good }}</p>
          <!--          <p>-->
          <!--            支付还剩-->
          <!--            <span>24分59秒</span>-->
          <!--            , 超时后将取消订单-->
          <!--          </p>-->
        </div>
        <div class="amount">
          <span>应付总额：</span>
          <span>¥{{ pay.fee }}</span>
        </div>
      </div>
    </el-card>

    <!-- 付款方式 -->
    <el-card v-if="0" shadow="always">
      <div class="pay-type">
        <p class="head">选择以下支付方式付款</p>
        <div class="item">
          <p>支付平台</p>
          <a :class="{'btn-active': pay.platform === 1, btn: true, wx: true}" @click="selectPlatform(1)"></a>
          <a :class="{'btn-active': pay.platform === 2, btn: true, alipay: true}" @click="selectPlatform(2)"></a>
        </div>
        <div class="item">
          <p>支付方式</p>
          <a class="btn" href="javascript:;">招商银行</a>
          <a class="btn" href="javascript:;">工商银行</a>
          <a class="btn" href="javascript:;">建设银行</a>
          <a class="btn" href="javascript:;">农业银行</a>
          <a class="btn" href="javascript:;">交通银行</a>
        </div>
      </div>
    </el-card>

    <!-- 二维码 -->
    <el-card shadow="always">
      <div class="pay-type">
        <a :class="{'btn-active': pay.platform === 2, btn: true, alipay: true}" @click="selectPlatform(2)"></a>
        <div class="item">
          <QRCode v-if="pay.qrCode" :qrUrl="pay.qrCode"></QRCode>
        </div>
      </div>
    </el-card>

    <el-row class="pay">
      <a class="btn back" @click="back">返回</a>
      <!--      <a class="btn" @click="payment">支付</a>-->
    </el-row>
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
  padding: 0 80px;

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
  //margin-top: 20px;
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