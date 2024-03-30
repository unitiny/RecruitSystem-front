<script setup lang="ts">
import router from "@/router";
import {diffDay, getTags, getPaymentWay} from "@/utils/utils";
import {defineProps} from "vue";
import {global} from "@/static/static";
import {useGlobalStore} from "@/store/pinia";

const props = defineProps({
  demand: {
    type: Object,
    required: true
  }
})

const avatar = global.path.static + '/img/avatar.jpg'
const store = useGlobalStore()

function demandDetail(did) {
  router.push({
    name: "/demand/detail",
    query: {
      did: did
    }
  })
}



</script>

<template>
  <el-row @click="demandDetail(props.demand.id)"
          class="row demand-card">
    <el-card shadow="never" class="row card">
      <el-row>
        <el-col :span="6" class="title">{{ props.demand.name }}</el-col>
        <el-col :span="18">
          <el-row class="basic-content">
            <el-col :span="4" class="money">
              ￥{{ props.demand.remuneration }}
            </el-col>
            <el-col :span="4" class="flex-ai-center">
              <el-icon>
                <Timer/>
              </el-icon>
              &nbsp;
              {{ diffDay(props.demand.start, props.demand.end) }}天
            </el-col>
            <el-col :span="4" class="flex-ai-center">
              <el-icon>
                <UserFilled/>
              </el-icon>
              &nbsp;
              <b>1/{{ props.demand.recruitNum }}</b>&nbsp;
            </el-col>
          </el-row>

        </el-col>
      </el-row>
    </el-card>
  </el-row>
</template>

<style scoped lang="scss">
.demand-card {
  .card {
    background: #cfeff3;

    .title {
      font-size: 18px;
      font-weight: 500;
    }

    .money {
      color: $money-color;
    }
  }

}
</style>
