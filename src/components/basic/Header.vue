<script setup lang="ts">
import {ref} from "vue"
import {global} from "@/static/static"
import {Message, Plus} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {useGlobalStore} from "@/store/pinia";
import PersonInformation from "@/components/PersonInformation.vue"

const router = useRouter()
const store = useGlobalStore()
const logo = global.path.static + '/img/logo.jpeg'
const avatar = global.path.static + '/img/avatar.jpg'
const navData = ref({
  list: [{
    text: "需求列表",
    class: "nav nav-active",
    route: "/"
  },
    {
      text: "开发者",
      class: "nav",
      route: "/dev/dev"
    },
  ],
  curNav: 0
})

const loginData = ref({
  maskVisible: false,
  infoMaskVisible: false,
  loginVisible: true,
  registerVisible: false,
})

const messageData = ref([
  {
    text: "系统通知",
    path: "/demand/pub"
  },
  {
    text: "群聊消息",
    path: "/demand/pub"
  },
  {
    text: "我的消息",
    path: "/demand/pub"
  },
])

const userData = ref([
  {
    text: "我的资料",
    path: "/user/information"
  },
  {
    text: "我的需求",
    path: "/user/demands"
  },
  {
    text: "我的订单",
    path: "/demand/pub"
  },
  {
    text: "退出登录",
    path: "/demand/pub"
  },
])

function login() {
  maskTick()
}

function exchangeWay() {
  loginData.value.loginVisible = !loginData.value.loginVisible
  loginData.value.registerVisible = !loginData.value.registerVisible
}

function successHook(firstLogin) {
  maskTick()
  if(firstLogin) {
    loginData.value.infoMaskVisible = true
  }
}

function maskTick() {
  loginData.value.maskVisible = !loginData.value.maskVisible
  loginData.value.loginVisible = true
  loginData.value.registerVisible = false
}

function exchangeNav(index: Number) {
  navData.value.list[navData.value.curNav].class = navData.value.list[navData.value.curNav].class.replace("nav-active", "")

  navData.value.curNav = index
  navData.value.list[navData.value.curNav].class += " nav-active"
  router.push(navData.value.list  [navData.value.curNav].route)
}

function pubDemand() {
  router.push("/demand/pub")
}

function skip(path) {
  router.push(path)
}
</script>

<template>
  <el-row class="header nav">
    <el-col :span="2" class="logo">
      <el-image :src="logo" fit="scale-down"></el-image>
    </el-col>
    <el-col :span="16">
      <el-row style="height: 100%" justify="start">
        <el-col :span="4" v-for="(item, index) in navData.list" :class="item.class" @click="exchangeNav(index)">
          {{ item.text }}
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="6">
      <el-row justify="start" align="middle">
        <el-button @click="pubDemand" type="primary" style="margin-right: 20px;">
          发布需求
          <el-icon class="el-icon--right">
            <Plus/>
          </el-icon>
        </el-button>
        <el-dropdown>
          <el-icon :size="30" style="margin-right: 20px;">
            <Message/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in messageData" @click="skip(item.path)" >{{ item.text }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown>
          <el-avatar @click="login" :size="40" :src="avatar" style="margin-right: 10px;"/>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in userData" @click="skip(item.path)" >{{ item.text }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-row>
    </el-col>
    <Mask @nextTick="maskTick" :visible="loginData.maskVisible">
      <Login @exchange="exchangeWay"
             @success-hook="successHook"
             :visible="loginData.loginVisible"/>
      <Register @exchange="exchangeWay"
                @success-hook="maskTick"
                :visible="loginData.registerVisible"/>
    </Mask>
    <Mask @nextTick="maskTick" :visible="loginData.infoMaskVisible">
      <PersonInformation></PersonInformation>
    </Mask>

  </el-row>
</template>

<style scoped lang="scss">
.header {
  width: 100%;
  height: 65px;
  min-height: 60px;
  background: white;
  border-bottom: black 1px;
}

.nav {
  color: black;
  font-size: 16px;
  @include flex(row, center, center);
}

.nav-active {
  color: $theme-bgc;
}

.logo {
  width: 100%;
  height: 100%;
}
</style>
