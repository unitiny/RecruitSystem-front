<script setup lang="ts">
import {Message} from "@/utils/websocket";
import {defineProps} from "vue";

const props = defineProps({
  message: {
    type: Message,
    required: true
  },
  downloadFile: {
    type: Function,
    required: true
  }
})
</script>

<template>
  <el-popover placement="top" :width="160">
    <div style="text-align: right; margin: 0">
      <el-button size="small" type="primary"
                 @click="downloadFile(props.message?.privateContent)">下载</el-button>
      <el-button size="small" type="primary" @click="">撤回</el-button>
    </div>
    <template #reference>
      <el-image class="chat-image"
                :src="props.message?.privateContent"
                :preview-src-list="[props.message?.privateContent]"/>
    </template>
  </el-popover>
</template>

<style scoped lang="scss">
.chat-image {
  margin: 0 5px 5px 5px;
  border: 1px solid #777777;
  border-radius: 5px;
  width: 120px;
  height: 150px;
}
</style>
