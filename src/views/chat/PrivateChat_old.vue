<script setup lang="ts">
import {API, chatGroup, GetDemand, GetUser, GetEngineerParentSkills, userDemandGroup} from "@/api/api";
import {onBeforeMount, ref} from "vue"
import {global} from "@/static/static";
import {useRoute} from "vue-router";
import {Chat, Message, MessageType} from "@/utils/websocket";
import {useGlobalStore} from "@/store/pinia";
import {getTime, diffDay, getTags, getPaymentWay, getBackTime, getAlias, copy} from "@/utils/utils";
import {request} from "@/utils/axios";
import Rate from "@/components/common/Rate.vue"

//数据太散太乱，不好渲染，重构了
const route = useRoute()
const store = useGlobalStore()
const apply = {
  join: 1,
  finishPlan: 2,
  finishItem: 3
}
const avatar = global.path.static + "/img/avatar.jpg"

const chatUser = ref({})
const demand = ref({})
const userDemandList = ref([])
const userDemandRequest = {
  start: 0,
  limit: 10,
  order: "",
  publisherID: 0,
  applicantID: 0,
  status: 0,
  searchVal: "",
}
const engineerSkills = ref([])
const rooms = ref([])

const chat = ref({
  ws: new Chat(),
  inputMsg: "",
  privateMsg: {},
  groupMsg: {},
  curUser: 0,
  curChatID: ""
})
const cooperate = ref({
  visible: false,
  agree: false,
  role: 0,
})
const finishPlan = ref({
  visible: false,
  agree: false
})
const finishItem = ref({
  visible: false,
  agree: false
})

// TODO 聊天界面显示对应需求内容 赋值cooperate.role

function initChat() {
  if (chatUser.value.id !== 0) {
    chat.value.curChatID = getChatID(chatUser.value.id, store["user"].id)
  }
  setWS()
}

function setWS() {
  chat.value.ws.connWebsocket(store["user"].token)
  chat.value.ws.socket.onmessage = async (event) => {
    let message = JSON.parse(event.data)
    console.log(message)
    switch (message.type) {
      case MessageType.private:
        privateReceive(message)
        break
      case MessageType.group:
        break
      case MessageType.system:
        break
      case MessageType.apply:
        getApplyMsgData(message)
        privateReceive(message)
        break
      case MessageType.tag:
        privateReceive(message)
        break
    }
  }
}

function send(type, content) {
  let msg = new Message({
    senderID: store["user"].id,
    receiverID: chatUser.value.id,
    chatID: chat.value.curChatID,
    type: type,
    content: content
  })
  privateReceive(msg) //先发给自己
  chat.value.ws.send(msg)
}

function privateSend() {
  send(MessageType.private, chat.value.inputMsg)
  chat.value.inputMsg = ""
}

function privateReceive(message: Message) {
  if (!chat.value.privateMsg[message.chatID]) {
    chat.value.privateMsg[message.chatID] = []
  }
  chat.value.privateMsg[message.chatID].push(message)
}

function initRooms() {
  request({
    url: chatGroup.getRooms,
  }).then(res => {
    console.log(res)
    rooms.value = res["rooms"]
  })
}

function getChatID(a: number, b: number) {
  if (a < b) {
    return `${a}-${b}`
  }
  return `${b}-${a}`
}

function getChatUserID(room: string) {
  let split = room.split("-")
  if (parseInt(split[0]) === store["user"].id) {
    return parseInt(split[1])
  }
  return parseInt(split[0])
}

function getSkillTags(val: string[]): string[] {
  let res = []
  for (const v of val) {
    res.push(engineerSkills.value[parseInt(v) - 1].label)
  }
  return res
}

function getApplyMsgData(message: Message) {
  switch (message.applyContent.type) {
    case apply.join:
      cooperate.value.role = message.applyContent.data.role
      break
    case apply.finishPlan:
      break
    case apply.finishItem:
      break
  }
}

function exchangeChatUser(chatID, chatUserID) {
  chat.value.curChatID = chatID
  chatUser.value.id = chatUserID
}

function cooperateCtl(show) {
  cooperate.value.visible = show
}

function selectRole() {
  cooperateCtl(false)
  applyJoin(cooperate.value.role)
}

function applyJoin(role) {
  let alias = getAlias(role - 1)
  send(MessageType.apply, {
    type: apply.join,
    data: {
      role: role,
      selfContent: `我发起接手需求申请，身份为${alias}，等待对方同意`,
      otherContent: `对方发起接手需求申请，身份为${alias}，是否同意`,
    }
  })
}

function agreeJoin() {
  cooperate.value.agree = true
  request({
    url: userDemandGroup.put,
    method: API.PUT,
    data: {
      did: demand.value.id,
      publisherID: demand.value.uid,
      applicantID: chatUser.value.id,
      joinDate: new Date(),
      role: cooperate.value.role,
      status: 2,
    }
  }).then(res => {
    sendTag({
      selfContent: "已同意接手需求",
      otherContent: "对方已同意接手需求"
    })
  })
}

function applyFinishPlan() {
  send(MessageType.apply, apply.finishPlan)
}

function agreeFinishPlan() {
  finishPlan.value.agree = true
}

function applyFinishItem() {
  if(cooperate.value.role === 0) {
    ElMessage({
      showClose: true,
      message: "未接手需求",
      type: "error"
    })
    return
  }
  send(MessageType.apply, {
    type: apply.finishItem,
    data: {
      selfContent: `我发起完成计划申请，等待对方同意`,
      otherContent: `对方发起完成计划申请，是否同意？`,
    }
  })
}

function agreeFinishItem() {
  finishItem.value.agree = true
  request({
    url: userDemandGroup.finishUserDemand,
    method: API.POST,
    data: {
      did: demand.value.id,
      publisherID: demand.value.uid,
      applicantID: chatUser.value.id,
      role: cooperate.value.role,
    }
  }).then(res => {
    sendTag({
      selfContent: "已同意完结项目申请",
      otherContent: "对方已同意完结项目申请"
    })
  })
}

function sendTag({selfContent = "", otherContent = ""}) {
  send(MessageType.tag, {
    data: {
      selfContent: selfContent,
      otherContent: otherContent,
    }
  })
}

onBeforeMount(async () => {
  if (route.query.uid) {
    chatUser.value.id = parseInt(route.query.uid as string)
  } else {
    if (store["user"].id === 1) {
      route.query.uid = "3"
    } else {
      route.query.uid = "1"
    }
    route.query.did = "19"
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
    demand.value.plan = JSON.parse(demand.value.plan)
    demand.value.requires = JSON.parse(demand.value.requires)
    console.log(demand.value)
  }).catch(error => {
    ElMessage({
      showClose: true,
      inputMsg: "获取需求信息失败",
      type: "error"
    })
  })

  GetEngineerParentSkills().then(res => {
    engineerSkills.value = res
  })
  request({
    url: userDemandGroup.list,
    params: userDemandRequest
  }).then(res => {
    console.log(res["list"])
    userDemandList.value = res["list"]
  })

  initChat()
  initRooms()
})
</script>

<template>
  <el-row class="row flex-jc-center" :gutter="50">
    <el-col :span="6">
      <el-card shadow="always" class="chat-list">
        <el-row v-for="item in rooms"
                @click="exchangeChatUser(item.chatID, item.chatUserID)"
                class="row chat-item">
          <el-col :span="4" class="flex-center flex-col">
            <el-avatar :size="50" :src="avatar"/>
          </el-col>
          <el-col :span="16" class="content">
            <div>{{ item?.chatUserName }}</div>
            <div class="row flex-ai-center">
              <el-text truncated>
                {{ item?.lastMessage }}
              </el-text>
            </div>
          </el-col>
          <el-col :span="4" class="flex-center">
            {{ getBackTime(item?.lastTime) }}
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
                  <el-avatar v-if="item.type !== MessageType.tag" :size="50" :src="avatar"/>
                  <span v-if="item.type === MessageType.private" class="chat-content">
                    {{ item.privateContent }}
                  </span>
                  <span v-else-if="item.type === MessageType.apply">
                    <el-card v-if="item.applyContent.type === apply.join" shadow="always" class="chat-card">
                      <div v-if="item.senderID === store['user'].id">{{ item.applyContent.data.selfContent }}</div>
                      <div v-else>{{ item.applyContent.data.otherContent }}</div>
                      <div class="flex-center" style="justify-content: space-around;">
                        <el-button type="primary" @click="agreeJoin">同意</el-button>
                        <el-button>拒绝</el-button>
                      </div>
                    </el-card>
                    <el-card v-else-if="item.applyContent.type === apply.finishPlan" shadow="always" class="chat-card">
                      <div v-if="item.senderID === store['user'].id">{{ item.applyContent.data.selfContent }}</div>
                      <div v-else>{{ item.applyContent.data.otherContent }}</div>
                      <div class="flex-center" style="justify-content: space-around;">
                        <el-button type="primary" @click="agreeFinishPlan">同意</el-button>
                        <el-button>拒绝</el-button>
                      </div>
                    </el-card>
                    <el-card v-else-if="item.applyContent.type === apply.finishItem" shadow="always" class="chat-card">
                      <div v-if="item.senderID === store['user'].id">我发起完结项目申请，等待对方同意</div>
                      <div v-else>对方发起完结项目申请，是否同意？</div>
                      <div class="flex-center" style="justify-content: space-around;">
                        <el-button type="primary" @click="agreeFinishItem">同意</el-button>
                        <el-button>拒绝</el-button>
                      </div>
                    </el-card>
                  </span>
                  <span v-else-if="item.type === MessageType.tag" class="tag-content">
                    <div v-if="item.senderID === store['user'].id">{{ item.tagContent.data.selfContent }}</div>
                    <div v-else>{{ item.tagContent.data.otherContent }}</div>
                  </span>
                </el-row>
              </el-row>
            </el-scrollbar>
          </el-row>
          <el-row class="row chat-input">
            <el-row class="row" style="padding: 8px 0;">
              <el-button type="primary" @click="cooperateCtl(true)">接手需求申请</el-button>
              <el-button type="primary" @click="applyFinishPlan">完成计划申请</el-button>
              <el-button type="primary" @click="applyFinishItem">完结项目申请</el-button>
              <el-dialog v-model="cooperate.visible" title="请选择身份" width="500">
                <el-radio-group v-model="cooperate.role">
                  <div class="row flex-col">
                    <div v-for="(item, index) in demand.requires">
                      <el-radio :label="index+1" :value="index+1" size="large" border>
                        <el-row class="row flex-ai-center">
                          <span>{{ item.name }}&nbsp;</span>
                          <div>
                            <span v-for="tag in getSkillTags(item.value)">
                              {{ tag }}&nbsp;
                            </span>
                          </div>
                        </el-row>
                      </el-radio>
                    </div>
                  </div>
                </el-radio-group>
                <template #footer>
                  <div class="dialog-footer">
                    <el-button @click="cooperateCtl(false)">取消</el-button>
                    <el-button @click="selectRole" type="primary">
                      申请
                    </el-button>
                  </div>
                </template>
              </el-dialog>
              <Rate :visible="finishItem.agree" :udid="1"></Rate>
            </el-row>
            <el-row class="row">
              <el-col :span="20">
                <el-input @keydown.enter="privateSend" v-model="chat.inputMsg" placeholder="Please input"/>
              </el-col>
              <el-col :span="4">
                <el-button @click="privateSend" class="row" type="primary" color="#b7e896">
                  发送
                </el-button>
              </el-col>
            </el-row>
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
        margin: 0 5px 5px 5px;
        background: #b7e896;
        padding: 8px;
        border-radius: 10px;
        max-width: 400px;
        overflow-wrap: break-word;
      }

      .tag-content {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
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
