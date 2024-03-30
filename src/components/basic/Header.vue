<script setup lang="ts">
import {ref, onMounted} from "vue"
import {global} from "@/static/static"
import {Message, Plus} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import config from "/config.json";
import {useGlobalStore} from "@/store/pinia";
import PersonInformation from "@/components/PersonInformation.vue"

const router = useRouter()
const store = useGlobalStore()
const logo = global.path.static + '/img/logo.jpeg'
const avatar = global.path.static + '/img/avatar.jpg'
const es = ref(new EventSource(config.baseURL + "/notify/sse"))

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
    path: "/chat/privatechat",
    notify: 0,
  },
  {
    text: "群聊消息",
    path: "/chat/privatechat",
    notify: 0,
  },
  {
    text: "我的消息",
    path: "/chat/privatechat",
    notify: 0,
  },
])

const userData = ref([
  {
    text: "我的资料",
    path: "/user/information"
  },
  {
    text: "我的需求",
    path: userDemandPath
  },
  {
    text: "我的钱包",
    path: walletPath
  },
  {
    text: "退出登录",
    path: loginOut
  },
])

function userDemandPath() {
  if (store["user"].identity === 1) {
    return "/user/demands"
  }
  return "/user/devdemands"
}

function walletPath() {
  console.log(store["user"])
  if (store["user"].identity === 1) {
    return "/wallet/wallet"
  }
  return "/wallet/devwallet"
}

function loginOut() {
  store.updateUser({})
}

function login() {
  maskTick()
}

function exchangeWay() {
  loginData.value.loginVisible = !loginData.value.loginVisible
  loginData.value.registerVisible = !loginData.value.registerVisible
}

function successHook(firstLogin) {
  maskTick()
  if (firstLogin) {
    loginData.value.infoMaskVisible = true
  }
}

function maskTick() {
  loginData.value.maskVisible = !loginData.value.maskVisible
  loginData.value.loginVisible = true
  loginData.value.registerVisible = false
}

function exchangeNav(index: number) {
  navData.value.list[navData.value.curNav].class = navData.value.list[navData.value.curNav].class.replace("nav-active", "")

  navData.value.curNav = index
  navData.value.list[navData.value.curNav].class += " nav-active"
  router.push(navData.value.list  [navData.value.curNav].route)
}

function pubDemand() {
  router.push("/demand/pub")
}

function goHome() {
  router.push('/')
  exchangeNav(0)
}

function skip(item) {
  if (item.notify && item.notify > 0) {
    item.notify = 0
  }
  if (typeof item.path === "string") {
    router.push(item.path)
  } else {
    router.push(item.path())
  }
}

onMounted(() => {
  //TODO 路由为聊天界面不通知
  let key = "Private" + store["user"].id
  es.value.addEventListener(key, (event) => {
    let message = JSON.parse(event["data"])
    switch (message.type) {
      case "Private":
        messageData.value[2].notify += 1
        break
      case "Group":
        break
      case "Broadcast":
        break
    }
  })
})
</script>

<template>
  <el-row class="header nav">
    <el-col :span="2" class="logo" @click="goHome">
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
        <el-button v-if="store['user'].identity === 1"  @click="pubDemand" type="primary" style="margin-right: 20px;">
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
              <el-dropdown-item v-for="item in messageData" @click="skip(item)">
                <el-badge :value="item.notify" :hidden="item.notify === 0"
                          :max="10" :show-zero="false">
                  {{ item.text }}
                </el-badge>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown>
          <el-avatar @click="login" :size="40" :src="avatar" style="margin-right: 10px;"/>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in userData" @click="skip(item)">{{ item.text }}</el-dropdown-item>
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
  .el-image{
    width: 100%;
    height: 100%;
  }
}
</style>
