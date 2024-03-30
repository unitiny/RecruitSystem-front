<script setup lang="ts">
import {Message} from "@/utils/websocket";
import {defineProps} from "vue";
import {global} from "@/static/static";

const zip = global.path.static + "/img/zip.png"

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
      <el-image class="chat-zip"
                :src="zip"/>
    </template>
  </el-popover>
</template>

<style scoped lang="scss">
.chat-zip {
  margin: 0 5px 5px 5px;
  border-radius: 5px;
  width: 100px;
  height: 100px
}
</style>
