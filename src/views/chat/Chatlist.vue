<script setup lang="ts">
import {defineProps} from "vue";
import {global} from "@/static/static";
import {getBackTime} from "@/utils/utils";

const props = defineProps({
  rooms: {
    type: Object,
    required: true
  },
  exchangeChatUser: {
    type: Function,
    required: true
  }
})

function lastMessage(room) {
  let l = room?.messages.length
  if (l > 0) {
    return room?.messages[l - 1].privateContent //TODO 由type确定content
  }
  return ""
}

function lastTime(room) {
  let l = room?.messages.length
  if (l > 0) {
    return getBackTime(room?.messages[l - 1].time)
  }
  return ""
}

</script>

<template>
  <el-card shadow="always" class="chat-list">
    <el-row v-for="item in props.rooms"
            @click="props.exchangeChatUser(item?.chatID)"
            class="row chat-item">
      <el-col :span="4" class="flex-center flex-col">
        <el-avatar :size="50" :src="item?.chatUser?.avatar"/>
      </el-col>
      <el-col :span="16" class="content">
        <div>{{ item?.chatUser?.nickname }}</div>
        <div class="row flex-ai-center">
          <el-text truncated>
            {{ lastMessage(item) }}
          </el-text>
        </div>
      </el-col>
      <el-col :span="4" class="flex-center">
        {{ lastTime(item) }}
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped lang="scss">
.chat-list {
  min-height: 600px;
  max-height: 600px;
  .chat-item {
    padding: 10px 5px;
    border-bottom: solid 1px #999999;

    .content {
      display: flex;
      justify-content: center;
      align-items: start;
      flex-direction: column;
    }
  }
}
</style>
