<script setup lang="ts">
import {ref, onBeforeMount} from "vue"
import {useGlobalStore} from "@/store/pinia";
import {useRoute} from "vue-router";
import {request} from "@/utils/axios";
import {userDemandGroup} from "@/api/api";
import {getDateTime} from "@/utils/utils";

const store = useGlobalStore()
const route = useRoute()

const rates = ref([])

function getRates() {
  let uid = route.query.uid > 0 ? route.query.uid : store['user'].id
  request({
    url: userDemandGroup.getRates,
    params: {
      uid
    }
  }).then(res => {
    rates.value = res as any
  })
}

onBeforeMount(() => {
  getRates()
})

</script>

<template>
  <el-row class="main">
    <el-card class="card" v-for="item in rates">
      <el-row class="flex-ai-center">
        <el-col :span="3">
          {{getDateTime(item.rate.time)}}
        </el-col>
        <el-col :span="6">
          <el-rate v-model="item.rate.star"/>
        </el-col>
      </el-row>
      <el-row class="origin">
        {{item.name}} / {{item.nickName}} :
      </el-row>
      <el-row>
        {{item.rate.evaluate}}
      </el-row>
    </el-card>
  </el-row>
</template>

<style scoped lang="scss">
.main {
  width: 70%;

  .card {
    width: 100%;
    margin: 20px 0;

    .origin {
      font-weight: 500;
    }
  }

}
</style>
