<script setup lang="ts">
import {computed, defineEmits, defineExpose, defineProps, ref} from "vue";

const emits = defineEmits(["updateDemand"])
const props = defineProps({
  demand: {}
})

const demand = computed(() => props.demand)

function selectIdentity(i) {
  console.log(demand.value)
  demand.value.type = i
  // emits("updateDemand", demand.value)
}

function updateDemand(dm) {
  dm.value.type = demand.value.type
  dm.value.status = 1
}

function check() {
  return true
}

defineExpose({updateDemand, check})
</script>

<template>
  <el-row class="row" justify="center" :gutter="50">
    <el-col :span="10" align="middle">
      <el-button @click="selectIdentity(1)" :class="{'identity-btn': true, active: demand.type === 1}" type="primary"
                 plain circle>雇主
      </el-button>
    </el-col>
    <el-col :span="10" align="middle">
      <el-button @click="selectIdentity(2)" :class="{'identity-btn': true, active: demand.type === 2}" type="primary"
                 plain circle>合伙人
      </el-button>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.identity-btn {
  height: 200px;
  width: 200px;
  font-size: 30px;
}

.active {
  background: $theme-bgc;
  color: white;
}
</style>
