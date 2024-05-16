<script setup>
import {onMounted, ref} from "vue";
import {systemMessageGroup} from "@/api/api";
import {request} from "@/utils/axios";
import {getDateTime} from "@/utils/utils";
import {useRouter} from "vue-router";

const router = useRouter()
const systemMessages = ref([])

function getSystemMessages() {
  request({
    url: systemMessageGroup.list,
  }).then(res => {
    console.log(res)
    systemMessages.value = res["data"]
  })
}

function skip(targetUrl) {
  router.push(targetUrl)
}

onMounted(() => {
  getSystemMessages()
})
</script>

<template>
  <el-row class="row flex-jc-center">
    <el-card class="message"
             v-for="item in systemMessages"
             @click="skip(item.targetUrl)">
      <el-row class="row">
        {{ getDateTime(item.createdAt) }}
      </el-row>
      <el-row class="row">
        {{ item.content }}
      </el-row>
    </el-card>
  </el-row>
</template>

<style scoped lang="scss">
.message {
  width: 80%;
  margin: 15px 0;
}
</style>
