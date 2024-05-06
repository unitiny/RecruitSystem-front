<script setup lang="ts">

import {defineProps} from "vue";

const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  showFee: {
    type: Boolean,
    required: false
  }
})
</script>

<template>
  <el-timeline v-if="props.plan">
    <el-timeline-item v-for="item in props.plan" center>
      <div class="flex-ai-center" style="margin: 5px 0;">
        <el-icon :size="18">
          <Timer/>
        </el-icon>
        &nbsp;
        <span>{{ item.time }}</span>
      </div>
      <el-row class="row plan-content">
        <span class="plan-card">
          <el-card>
          <el-row style="margin-bottom: 15px; font-size: 16px;">
            <el-row class="row" v-if="showFee">
              <el-col :span="12">
                名称：{{ item.title }}
              </el-col>
              <el-col :span="12">
                完成报酬：
                <span style="color: #ea1515">￥{{ item.fee }}</span>
              </el-col>
            </el-row>
            <el-row class="row" v-else>
              <el-col :span="24">
                名称：{{ item.title }}
              </el-col>
            </el-row>
          </el-row>
          <el-row class="row">
            内容：{{ item.content }}
          </el-row>
        </el-card>
        </span>
        <span class="plan-operate">
          <span v-if="item.status === 3" class="flex-center">
            <el-icon :color="'green'" :size="20"><CircleCheck/></el-icon>
            已完成
          </span>
          <slot v-else></slot>
        </span>
      </el-row>
    </el-timeline-item>
  </el-timeline>
</template>

<style scoped lang="scss">
.plan-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .plan-card {
    min-width: 80%;
    max-width: 100%;
  }
}
</style>
