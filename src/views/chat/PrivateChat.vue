<script setup lang="ts">
import {GetDemand, GetUser} from "@/api/api";
import {onMounted, ref} from "vue"
import {global} from "@/static/static";
import {useRoute} from "vue-router";
import {Chat, Message, MessageType} from "@/utils/websocket";
import {useGlobalStore} from "@/store/pinia";
import {getTime, diffDay, getTags, getPaymentWay} from "@/utils/utils";

const route = useRoute()
const store = useGlobalStore()
const avatar = global.path.static + "/img/avatar.jpg"
const chatUser = ref({})
const demand = ref({})
const chat = ref({
  ws: new Chat(),
  inputMsg: "",
  privateMsg: {},
  groupMsg: {},
  curChatID: ""
})

function InitChat() {
  if (chatUser.value.id !== 0) {
    chat.value.curChatID = getChatID(chatUser.value.id, store["user"].id)
    console.log(chat.value.curChatID)
  }
  CreateWSConn()
}

function CreateWSConn() {
  chat.value.ws.connWebsocket(store["user"].token)
  chat.value.ws.socket.onmessage = async (event) => {
    let message = JSON.parse(event.data)
    switch (message.type) {
      case MessageType.private:
        receive(message)
        break
      case MessageType.group:
        break
    }
  }
}

function send() {
  let msg = new Message({
    senderID: store["user"].id,
    receiverID: chatUser.value.id,
    chatID: chat.value.curChatID,
    type: MessageType.private,
    content: chat.value.inputMsg,
  })
  receive(msg) //先发给自己
  chat.value.ws.send(msg)
}

function receive(message: Message) {
  if (!chat.value.privateMsg[message.chatID]) {
    chat.value.privateMsg[message.chatID] = []
  }
  chat.value.privateMsg[message.chatID].push(message)
}

function getChatID(a: Number, b: Number) {
  if (a < b) {
    return `${a}-${b}`
  }
  return `${b}-${a}`
}

onMounted(async () => {
  if (route.query.uid !== "") {
    chatUser.value.id = parseInt(route.query.uid as string)
  }
  GetUser(route.query.uid).then(res => {
    chatUser.value = res
  }).catch(error => {
    ElMessage({
      showClose: true,
      inputMsg: "获取聊天用户信息失败",
      type: "error"
    })
  })

  GetDemand(route.query.did).then(res => {
    demand.value = res
    console.log(demand.value)
  }).catch(error => {
    ElMessage({
      showClose: true,
      inputMsg: "获取需求信息失败",
      type: "error"
    })
  })

  InitChat()
})
</script>

<template>
  <el-row class="row flex-jc-center" :gutter="50">
    <el-col :span="6">
      <el-card shadow="always" class="chat-list">
        <el-row class="row chat-item">
          <el-col :span="4" class="flex-center flex-col">
            <el-avatar :size="50" :src="avatar"/>
          </el-col>
          <el-col :span="16" class="content">
            <div>胡源</div>
            <el-text truncated>
              Squeezed by parent element ddddddddddfsdkdffaeafefa
            </el-text>
          </el-col>
          <el-col :span="4" class="flex-center">
            {{ getTime() }}
          </el-col>
        </el-row>
        <el-row class="row chat-item">
          <el-col :span="4" class="flex-center flex-col">
            <el-avatar :size="50" :src="avatar"/>
          </el-col>
          <el-col :span="16" class="content">
            <div>胡源</div>
            <el-text truncated>
              Squeezed by parent element ddddddddddfsdkdffaeafefa
            </el-text>
          </el-col>
          <el-col :span="4" class="flex-center">
            {{ getTime() }}
          </el-col>
        </el-row>
      </el-card>
    </el-col>
    <el-col :span="14">
      <el-card shadow="always" class="chat-card">
        <el-row class="row chat-board">
          <el-row class="row demand">
            <el-row class="body">
              <el-row class="row">
                <el-col :span="20">
                  <el-row class="flex-ai-center">
                    <el-col :span="6">{{ demand?.name }}</el-col>
                    <el-col :span="6" class="flex-ai-center">
                      <b>1/{{ demand?.recruitNum }}</b>&nbsp;
                      <el-icon>
                        <UserFilled/>
                      </el-icon>
                    </el-col>
                    <el-col :span="6" v-if="demand?.type === 2">
                      <el-tag>合伙人</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
                <el-col :span="4">
                  <el-avatar :size="40" :src="avatar" style="margin-right: 10px;"/>
                </el-col>
              </el-row>
              <el-row class="row">
                <el-col :span="4" style="margin: 0 0 10px 0;">
                  <el-tag type="info" style="color: black">￥{{ demand?.remuneration }}</el-tag>
                </el-col>
                <el-col :span="4" style="margin: 0 0 10px 0;">
                  <el-tag type="info" style="color: black">{{ diffDay(demand?.start, demand?.end) }}天</el-tag>
                </el-col>
                <el-col :span="4" style="margin: 0 0 10px 0;" v-if="demand?.paymentWay !== 0">
                  <el-tag type="info" style="color: black">{{ getPaymentWay(demand?.paymentWay) }}</el-tag>
                </el-col>
                <el-col :span="4" style="margin: 0 0 10px 0;" v-if="demand?.hasPay">
                  <el-tag type="info" style="color: black">已付款</el-tag>
                </el-col>
              </el-row>
              <el-row class="row">
                {{ demand?.demand }}
              </el-row>
            </el-row>
            <el-row class="footer flex-ai-center">
              <span v-for="item1 in getTags(demand?.requireTags)" style="margin-right: 10px;">{{ item1 }}</span>
            </el-row>
          </el-row>
          <el-row class="row">
            <el-scrollbar class="scrollbar">
              <el-row v-for="item in chat.privateMsg[chat.curChatID]" class="chat-block">
                <el-row class="row flex-center">{{ getTime() }}</el-row>
                <el-row :class="{row: true, line: true,
                self: item.senderID === store['user'].id}">
                  <el-avatar :size="50" :src="avatar"/>
                  <span class="chat-content">
                    {{ item.content }}
                  </span>
                </el-row>
              </el-row>
            </el-scrollbar>
          </el-row>
          <el-row class="row chat-input">
            <el-col :span="20">
              <el-input v-model="chat.inputMsg" placeholder="Please input"/>
            </el-col>
            <el-col :span="4">
              <el-button @click="send" class="row" type="primary" color="#b7e896">
                发送
              </el-button>
            </el-col>
          </el-row>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.chat-list, .chat-board {
  min-height: 600px;
  max-height: 600px;
}

.chat-card {
  max-height: 600px;

  .chat-board {
    display: flex;
    flex-direction: column;
    align-items: center;

    .chat-block {
      div {
        margin-bottom: 8px;
      }

      .chat-content {
        margin: 0px 5px 5px 5px;
        background: #b7e896;
        padding: 8px;
        border-radius: 10px;
        max-width: 400px;
        overflow-wrap: break-word;
      }

      .line {
        display: flex;
        justify-content: start;
        align-items: start;
      }

      .self {
        justify-content: end;
        flex-direction: row-reverse;
      }
    }

    .chat-input {
      position: absolute;
      bottom: 35px;
    }
  }
}

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

.demand {
  border-radius: 10px;
  border: solid 1px #2f2f2f;
  width: 100%;
  margin: 20px 0;

  .body {
    width: 100%;
    padding: 5px 20px;
  }

  .footer {
    width: 100%;
    padding: 10px 20px;
    background: #cbedef;
    border-radius: 0 0 5px 5px;
  }
}

.scrollbar {
  min-height: 200px;
  max-height: 300px;
  height: 300px;
  width: 100%;
  padding: 10px 0;
}
</style>
