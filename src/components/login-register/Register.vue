<script lang="ts" setup="">
import {ref, defineProps, defineEmits, watchEffect} from 'vue'
import {ElMessage} from 'element-plus'
import {API, loginGroup} from '@/api/api'
import {request} from '@/utils/axios'
import {i18nText, i18nGroup} from '@/utils/i18n'
import {errorText} from "@/utils/utils"
import {global} from "@/static/static";

const emits = defineEmits<{
  exchange: []
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
  repeatPassword: "",
  code: "",
  registerLoading: false,
  identity: global.identity.recruiter
})

function register() {
  if (data.value.password !== data.value.repeatPassword) {
    ElMessage({
      showClose: true,
      message: i18nText("notEqualPassword"),
      type: 'error',
    })
    return
  }

  let messageOption = {
    showClose: true,
    message: i18nText("registerSuccess"),
    type: 'success',
  }
  request({
    url: loginGroup.register,
    method: API.POST,
    data: {
      "username": data.value.account,
      "password": data.value.password,
      "identity": data.value.identity,
      "registerCode": parseInt(data.value.code)
    }
  }).then(res => {
    //跳转登录
    emits("exchange")
  }).catch(error => {
    messageOption.type = "error"
    messageOption.message = errorText(error, i18nText("registerError"))
  }).finally(() => {
    ElMessage(messageOption)
  })
}

function getCode() {
  request({
    url: loginGroup.registerCode,
    method: API.GET,
    params: {
      "username": data.value.account
    }
  })
}

function changeIdentity() {
  data.value.identity = data.value.identity === global.identity.recruiter ?
      global.identity.developer : global.identity.recruiter;
}
</script>

<template>
  <div v-if="visible" class="login-main">
    <div class="login-identity" @click="changeIdentity">
      {{ data.identity === 1 ? i18nText("recruiter") : i18nText("developer") }}
    </div>
    <div class="login-box">
      <el-row justify="space-between">
        <el-col>
          <div :class="{'grid-content': true}">
            {{ i18nGroup("register") }}
          </div>
        </el-col>
      </el-row>
      <el-space direction="vertical" style="width: 100%;" :fill="true">
        <el-row justify="center" style="margin-top: 40px;">
          <el-input v-model="data.account"
                    class="w-50 m-2"
                    size="large"
                    :placeholder="i18nGroup('inputTip', 'phone')"/>
        </el-row>
        <el-row justify="center">
          <el-input v-model="data.code"
                    class="w-50 m-2"
                    size="large"
                    :placeholder="i18nGroup('inputTip', 'code')">
            <template #append>
              <el-button type="primary" @click="getCode">{{ i18nGroup('get', 'code') }}</el-button>
            </template>
          </el-input>
        </el-row>
        <el-row justify="center">
          <el-input v-model="data.password"
                    class="w-50 m-2"
                    size="large"
                    :placeholder="i18nGroup('inputTip', 'password')"/>
        </el-row>
        <el-row justify="center">
          <el-input v-model="data.repeatPassword"
                    class="w-50 m-2"
                    size="large"
                    :placeholder="i18nGroup('again', 'input', 'password')"/>
        </el-row>
      </el-space>
      <el-row justify="space-between" style="margin-top: 20px">
        <el-col v-loading="data.registerLoading">
          <el-button type="primary" size="large" style="width: 100%" @click="register">{{ i18nText('register') }}
          </el-button>
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
}

.selected {
  color: $theme-bgc;
}

</style>
