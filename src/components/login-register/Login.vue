<script lang="ts" setup="">
import {ref, defineProps, defineEmits, watchEffect} from 'vue'
import {ElMessage} from 'element-plus'
import {API, loginGroup} from '@/api/api'
import {request} from '@/utils/axios'
import {i18nText, i18nGroup} from '@/utils/i18n'
import {errorText} from "@/utils/utils"
import {global} from "@/static/static.ts"
import {useGlobalStore} from "@/store/pinia"

const emits = defineEmits<{
  exchange: [],
  successHook: [firstLogin: boolean]
}>()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const visible = ref(false)
watchEffect(() => visible.value = props.visible)

const data = ref({
  account: "",
  password: "",
  loginWay: 0,
  loginLoading: false,
  identity: global.identity.recruiter, // 1招募者 2开发者
})

const store = useGlobalStore()

function login() {
  console.log(data.value)
  // todo 表单校验

  let messageOption = {
    showClose: true,
    inputMsg: i18nText("loginSuccess"),
    type: 'success',
  }
  data.value.loginLoading = true
  request({
    url: loginGroup.login,
    method: API.POST,
    data: {
      "username": data.value.account.toString(),
      "password": data.value.password.toString(),
      "identity": data.value.identity
    },
  }).then(res => {
    console.log(res)

    let user = res["user"]
    user.token = res["token"]
    store.updateUser(user)
    let firstLogin = res["firstLogin"]

    request.defaults.headers.token = user.token //方便api鉴权
    emits("successHook", firstLogin)
  }).catch(error => {
    console.log(error)
    messageOption.message = errorText(error, i18nText("loginError"))
    messageOption.type = "error"
  }).finally(() => {
    data.value.loginLoading = false
    ElMessage(messageOption)
  })
}

function changeIdentity() {
  data.value.identity = data.value.identity === global.identity.recruiter ?
      global.identity.developer : global.identity.recruiter;
}

function close() {
  emits("exchange")
}
</script>

<template>
  <div v-if="visible" class="login-main">
    <div class="login-identity" @click="changeIdentity">
      {{ data.identity === 1 ? i18nText("recruiter") : i18nText("developer") }}
    </div>
    <div class="login-box">
      <el-row justify="space-between">
        <el-col :span="6">
          <div :class="{'grid-content': true, 'selected': data.loginWay === 0}">
            {{ i18nGroup("password", "login") }}
          </div>
        </el-col>
        <el-col :span="6">
          <div :class="{'grid-content': true, 'selected': data.loginWay === 1}">
            {{ i18nGroup("letter", "login") }}
          </div>
        </el-col>
      </el-row>
      <el-space direction="vertical" style="width: 100%;" :fill="true">
        <el-row justify="center" style="margin-top: 40px;">
          <el-input v-model="data.account"
                    class="w-50 m-2"
                    size="large"
                    :placeholder="i18nGroup('inputTip', 'account')"/>
        </el-row>
        <el-row justify="center">
          <el-input v-model="data.password"
                    class="w-50 m-2"
                    size="large"
                    :placeholder="i18nGroup('inputTip', 'password')"/>
        </el-row>
      </el-space>
      <el-row justify="space-between" style="margin-top: 20px">
        <el-col :span="10">
          <el-button size="large" style="width: 100%" @click="close">{{ i18nGroup("register") }}</el-button>
        </el-col>
        <el-col :span="10" v-loading="data.loginLoading">
          <el-button type="primary" size="large" style="width: 100%" @click="login">{{ i18nGroup("login") }}</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-main {
  margin: 0 auto;
  width: 45%;
  height: 50%;
  background: #ffffff;
  min-width: 500px;
  min-height: 300px;
  color: black;
  padding: 20px 50px;
  @include flex(row, center, center);
}

.login-identity {
  width: 35%;
  @include flex(row, center, center);
}

.login-box {
  width: 65%;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
  font-size: 18px;
  @include flex(row, center, center);
  //@include flex-test;
}

.selected {
  color: $theme-bgc;
}

</style>
