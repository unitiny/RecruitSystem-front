<script setup lang="ts">
import {API, chatGroup, GetDemand, GetUser, GetEngineerParentSkills, userDemandGroup} from "@/api/api";
import {onBeforeMount, onMounted, ref, watchEffect, nextTick} from "vue"
import SimpleDemand from "@/components/demand/SimpleDemand.vue"
import {global} from "@/static/static";
import {useRoute, useRouter} from "vue-router";
import {Chat, Message, MessageMedia, MessageType, SystemType} from "@/utils/websocket";
import {useGlobalStore} from "@/store/pinia";
import {
  getBackTime,
  getChatID,
  elMsgOption,
  getRandomID,
  deepJSONParse
} from "@/utils/utils";
import {request} from "@/utils/axios";
import Rate from "@/components/common/Rate.vue"
import {ElMessage, ElMessageBox, UploadFile, UploadFiles, UploadUserFile} from "element-plus";
import Cooperate from "@/views/chat/Cooperate.vue";
import FinishPlan from "@/views/chat/FinishPlan.vue";
import Chatlist from "@/views/chat/Chatlist.vue";
import ChatImage from "@/views/chat/ChatImage.vue";
import Chatzip from "@/views/chat/Chatzip.vue";
import ChatOperate from "@/views/chat/ChatOperate.vue";
import FinishItem from "@/views/chat/FinishItem.vue";

const route = useRoute()
const router = useRouter()
const store = useGlobalStore()
const apply = {
  join: 1,
  finishPlan: 2,
  finishItem: 3
}

const chatCardRef = ref(null)
const scrollerRef = ref(null)
const elScrollerRef = ref(null)
const innerRef = ref(null)
const messageRef = ref([])
const pageSet = ref({
  scrollerHeight: "400px",
  inputHeight: "200px"
})

const rooms = ref({})

// TODO 发起更新计划后，开发者应看到待审批的状态
//TODO 有多个聊天inputMsg,cooperate这类要改为数组
const chat = ref({
  ws: new Chat(),
  inputMsg: "",
  curChatID: "",
  curChatUserID: 0,
  curChatUser: {},
  curDid: 0,
  curDemand: {},
  curUserDemand: {},
  curMessages: []
})
const cooperate = ref({
  visible: false,
  agree: false,
  role: 0,
})
const finishPlan = ref({
  visible: false,
  agree: false,
  applyVisible: false,
  applyPlan: {}
})
const finishItem = ref({
  visible: false,
  agree: false
})
const rate = ref({
  visible: false
})

// TODO 聊天界面显示对应需求内容 赋值cooperate.role
// TODO 已加载rooms,之后有新room创建而无法在rooms中找到。需要服务端通知，客户端动态插入room到rooms

function initChat() {
  if (chat.value.curChatUserID && chat.value.curDid) {
    chat.value.curChatID = getChatID(chat.value.curChatUserID,
        store["user"].id, chat.value.curDid)
  }
  setWS()
}

function setWS() {
  chat.value.ws.connWebsocket(store["user"].token)
  chat.value.ws.socket.onmessage = async (event) => {
    let message = JSON.parse(event.data)
    console.log("receive", message)
    switch (message.type) {
      case MessageType.private:
        switch (message.media) {
          case MessageMedia.apply:
            getApplyMsgData(message)
            break
          case MessageMedia.tag:
            break
        }
        privateReceive(message)
        break
      case MessageType.group:
        break
      case MessageType.system:
        switch (message.systemContent.type) {
          case SystemType.read:
            updateMessage(message)
            break
          case SystemType.agreeJoin:
            getUserDemand()
            cooperate.value.role = message.systemContent.data.role
            break
          case SystemType.agreeFinishPlan:
            let i = message.systemContent.data.index
            if (i < chat.value.curUserDemand.plan.length) {
              chat.value.curUserDemand.plan[i].status = message.systemContent.data.status
            }
            break
          case SystemType.agreeFinishItem:
            break
        }
        break
    }
    nextTick(() => {
      readMessage() //每次收到消息都检查未读
    })
  }
}

function send(type, content, media?) {
  let msg = new Message({
    id: getRandomID("ws"),
    did: chat.value.curDid,
    senderID: store["user"].id,
    receiverID: chat.value.curChatUserID,
    chatID: chat.value.curChatID,
    type: type,
    media: media ? media : MessageMedia.text,
    content: content, //new里根据type写入不同content了
    time: new Date()
  })
  console.log("send", msg)
  //TODO privateReceive消息数据不完善 ？
  if (type === MessageType.private || type === MessageType.group) {
    privateReceive(msg) //先发给自己
  } else if (type === MessageType.system) {
    updateMessage(msg) //更新自己的消息
  }
  chat.value.ws.send(msg)
}

function privateSend(event) {
  //按下enter键
  if (!event.shiftKey && event.keyCode == 13) {
    if (chat.value.inputMsg !== "") {
      send(MessageType.private, chat.value.inputMsg)
      chat.value.inputMsg = ""
      event.preventDefault()
      event.stopPropagation() //兼容firefox
    }
  }
}

function privateReceive(message: Message) {
  if (!rooms.value[message.chatID].messages) {
    rooms.value[message.chatID].messages = []
  }
  rooms.value[message.chatID].messages.push(message)
}

function updateMessage(message: Message) {
  switch (message.systemContent.type) {
    case 1:
      let ids = message.systemContent.data["ids"].split(",")
      for (const id of ids) {
        rooms.value[message.chatID].messages.forEach((m, i) => {
          if (m.id === id) {
            m.hasRead = true
            chat.value.curMessages[i].hasRead = true
          }
        })
      }
      break
  }
}

function creatRoom() {
  if (chat.value.curDid && chat.value.curChatUserID) {
    request({
      url: chatGroup.createRoom,
      method: API.POST,
      data: {
        did: chat.value.curDid,
        chatUserID: chat.value.curChatUserID
      }
    })
  }
}

function initRooms() {
  request({
    url: chatGroup.getRooms,
  }).then(res => {
    rooms.value = res as any
    if (JSON.stringify(rooms.value) === "{}") {
      return
    }
    //route无uid和did，在此得到数据
    if (!chat.value.curChatID) {
      let firstKey = Object.keys(rooms.value)[0]
      chat.value.curChatID = rooms.value[firstKey].chatID
    }
    exchangeChatUser(chat.value.curChatID) //获取数据

    for (const k in rooms.value) {
      rooms.value[k].chatUser.skills = JSON.parse(
          rooms.value[k].chatUser.skills !== ""
              ? rooms.value[k].chatUser.skills : "[]")

      rooms.value[k].demand.plan = deepJSONParse(rooms.value[k].demand.plan)

      rooms.value[k].demand.requires = JSON.parse(
          rooms.value[k].demand.requires !== ""
              ? rooms.value[k].demand.requires : "[]")
    }
  })
}

function getChatUserID(room: string) {
  let split = room.split("-")
  if (parseInt(split[0]) === store["user"].id) {
    return parseInt(split[1])
  }
  return parseInt(split[0])
}

function getApplyMsgData(message: Message) {
  switch (message.applyContent.type) {
    case apply.join:
      cooperate.value.role = message.applyContent.data.role
      break
    case apply.finishPlan:
      finishPlan.value.applyPlan = message.applyContent.data.applyPlan
      break
    case apply.finishItem:
      break
  }
}

function getUserDemand() {
  request({
    url: userDemandGroup.getUserDemand,
    params: {
      did: chat.value.curDemand.id,
      publisherID: chat.value.curDemand.uid,
      applicantID: chat.value.curDemand.uid === chat.value.curChatUserID ?
          store["user"].id : chat.value.curChatUserID,
      role: cooperate.value.role
    }
  }).then(res => {
    chat.value.curUserDemand = res
    chat.value.curUserDemand.plan = deepJSONParse(res["plan"])
    cooperate.value.role = chat.value.curUserDemand.role
  })
}

async function exchangeChatUser(chatID) {
  chat.value.curChatID = chatID
  chat.value.curDid = rooms.value[chatID].demand.id
  chat.value.curDemand = rooms.value[chatID].demand
  chat.value.curChatUser = rooms.value[chatID].chatUser
  chat.value.curChatUserID = rooms.value[chatID].chatUser.id
  chat.value.curMessages = rooms.value[chatID].messages
  getUserDemand()

  nextTick(() => {
    readMessage()
    elScrollerRef.value!.setScrollTop(innerRef.value.clientHeight)
  })
}

function agreeJoin() {
  if (store['user'].identity !== 1) {
    return
  }
  cooperate.value.agree = true
  request({
    url: userDemandGroup.agreeJoin,
    method: API.PUT,
    data: {
      did: chat.value.curDid,
      publisherID: store["user"].id,
      applicantID: chat.value.curChatUserID,
      joinDate: new Date(),
      role: cooperate.value.role,
      status: 2,
    }
  }).then(res => {
    send(MessageType.system, {
      type: SystemType.agreeJoin,
      data: {
        role: cooperate.value.role
      }
    })
    sendTag({
      selfContent: "已同意接手需求",
      otherContent: "对方已同意接手需求"
    })
  })
}

function applyJoin() {
  if(chat.value.curDemand.hasRecruitNum >= chat.value.curDemand.recruitNum) {
    ElMessage(elMsgOption("招募人数已满，无法接手该需求", "error"))
    return
  }else if(cooperate.value.role !== 0) {
    ElMessage(elMsgOption("已接手该需求，不可重复申请", "error"))
    return
  }
  cooperate.value.visible = true
}

function applyFinishPlan() {
  finishPlan.value.visible = true
  finishPlan.value.applyVisible = true
}

function agreeFinishPlan() {
  if (store['user'].identity !== 1) {
    return
  }

  // 更新计划状态
  let index = 0
  let status = 3
  finishPlan.value.agree = true
  chat.value.curUserDemand.plan.forEach((p, i) => {
    if (finishPlan.value.applyPlan[i.toString()]) {
      chat.value.curUserDemand.plan[i].status = status
      index = i
    }
  })

  request({
    url: userDemandGroup.finishUserDemandPlan,
    method: API.POST,
    params: {
      index
    },
    data: {
      did: chat.value.curDid,
      publisherID: store["user"].id,
      applicantID: chat.value.curChatUserID,
      plan: JSON.stringify(chat.value.curUserDemand.plan),
      role: cooperate.value.role,
    }
  }).then(res => {
    console.log(res)
  })

  request({
    url: userDemandGroup.put,
    method: API.PUT,
    data: {
      did: chat.value.curDid,
      publisherID: store["user"].id,
      applicantID: chat.value.curChatUserID,
      plan: JSON.stringify(chat.value.curUserDemand.plan)
    }
  }).then(res => {
    send(MessageType.system, {
      type: SystemType.agreeFinishPlan,
      data: {
        status,
        index
      }
    })
    sendTag({
      selfContent: "已同意更新计划",
      otherContent: "对方已同意更新计划"
    })
  })
}

function finishDetail() {
  finishPlan.value.visible = true
}

function applyFinishItem() {
  if (cooperate.value.role === 0) {
    ElMessage({
      showClose: true,
      message: "未接手需求",
      type: "error"
    })
    return
  } else if (chat.value.curUserDemand.status === 3) {
    ElMessage(elMsgOption("已完成需求，无需重复申请", "info"))
    return
  }
  send(MessageType.private, {
    type: apply.finishItem,
    data: {
      selfContent: `我发起完成计划申请，等待对方同意`,
      otherContent: `对方发起完成计划申请，是否同意？`,
    }
  }, MessageMedia.apply)
}

function visibleFinishItem() {
  if (store['user'].identity !== 1) {
    return
  }
  finishItem.value.visible = true
}

function agreeFinishItem() {
  if (store['user'].identity !== 1) {
    return
  }

  let role = cooperate.value.role
  finishItem.value.agree = true
  request({
    url: userDemandGroup.finishUserDemand,
    method: API.POST,
    data: {
      did: chat.value.curDid,
      publisherID: store["user"].id,
      applicantID: chat.value.curChatUserID,
      role: role,
    }
  }).then(res => {
    sendTag({
      selfContent: "已同意完结项目申请",
      otherContent: "对方已同意完结项目申请"
    })
  })
}

function visibleRate() {
  rate.value.visible = !rate.value.visible
}

function sendTag({selfContent = "", otherContent = ""}) {
  send(MessageType.private, {
    data: {
      selfContent: selfContent,
      otherContent: otherContent,
    }
  }, MessageMedia.tag)
}

// 置为已读消息
function readMessage(pos = {}) {
  let ids = []
  let scrollerRect = scrollerRef.value.getBoundingClientRect()
  messageRef.value.forEach((itemRef, index) => {
    //消息与滚动条顶部距离小于聊天界面高度则已读
    let itemRect = itemRef.getBoundingClientRect()
    if (itemRect.top + itemRect.height / 2 - scrollerRect.top < scrollerRect.height * 0.9) {
      //读对面的未读消息
      if (!chat.value.curMessages[index]?.hasRead &&
          chat.value.curMessages[index]?.senderID === chat.value.curChatUserID) {
        ids.push(chat.value.curMessages[index].id)
      }
    }
  })

  if (ids.length > 0) {
    send(MessageType.system, {
      type: 1,
      data: {
        "ids": ids.join(",")
      }
    })
  }
}

function downloadFile(file) {
  const link = document.createElement('a');
  link.href = file;
  link.setAttribute('download', "file");
  link.click();
}

function checkNearTime(prev, next, diff) {
  if (prev < 0 || next >= chat.value.curMessages.length) {
    return false
  }

  let t1 = chat.value.curMessages[prev]?.time
  let t2 = chat.value.curMessages[next]?.time
  const date1 = new Date(t1);
  const date2 = new Date(t2);

  // 计算时间差（单位为毫秒）
  const timeDiff = date2 - date1;

  // 转换时间差为分钟
  const minutesDiff = timeDiff / (1000 * 60);
  return minutesDiff <= diff
}

async function setPage() {
  pageSet.value.scrollerHeight = `${chatCardRef.value.offsetHeight * 0.7}px`
  pageSet.value.inputHeight = `${chatCardRef.value.offsetHeight * 0.3}px`
}

function skipInfo(uid) {
  router.push({
    name: "/user/information",
    query: {
      uid: uid,
    }
  })
}

onBeforeMount(async () => {
  chat.value.curChatUserID = parseInt(route.query.uid as string)
  chat.value.curDid = parseInt(route.query.did as string)
  // rooms[chat.value.curChatUserID] = {}

  creatRoom()
  initChat()
  initRooms()
})

onMounted(() => {
  setPage()
  readMessage()
  console.log("rooms", rooms.value)
  console.log("chat", chat.value)
})
</script>

<template>
  <!-- 弹窗组件 -->
  <Cooperate :cooperate="cooperate" :confirm="send" :demand="chat.curDemand"></Cooperate>
  <FinishPlan :finishPlan="finishPlan" :confirm="send" :demand="chat.curUserDemand"></FinishPlan>
  <FinishItem :finishItem="finishItem" :confirm="agreeFinishItem" :demand="chat.curDemand"></FinishItem>
  <Rate :visible="rate.visible" :udid="chat.curUserDemand.id"></Rate>

  <el-row class="chat-main row flex-jc-center" :gutter="50">
    <el-col :span="5">
      <Chatlist :rooms="rooms"
                :exchange-chat-user="exchangeChatUser"></Chatlist>
    </el-col>
    <el-col :span="16">
      <div ref="chatCardRef">
        <el-card shadow="always" class="chat-card">
          <el-row class="row chat-board">
            <el-row class="row">
              <div ref="scrollerRef" class="row">
                <el-scrollbar @scroll="readMessage" ref="elScrollerRef" class="scrollbar"
                              :style="{height: pageSet.scrollerHeight}">
                  <div ref="innerRef">
                    <el-row class="row flex-center">
                      <SimpleDemand v-if="chat.curDemand.id > 0" :demand="chat.curDemand"></SimpleDemand>
                    </el-row>
                    <div ref="messageRef" v-for="(item, index) in chat.curMessages" class="chat-block">
                      <el-row>
                        <!--   时间 -->
                        <el-row v-if="!checkNearTime(index-1, index, 2)"
                                class="row flex-center">
                          {{ getBackTime(item?.time) }}
                        </el-row>

                        <!--   内容 -->
                        <el-row :class="{row: true, line: true,
                self: item?.senderID === store['user'].id}">
                          <!-- 头像-->
                          <el-avatar v-if="item?.media !== MessageMedia.tag"
                                     @click="skipInfo(item?.senderID)"
                                     :size="50"
                                     :src="item?.senderID === store['user'].id ?
                                   store['user'].avatar : chat.curChatUser?.avatar"/>

                          <!-- 消息 -->
                          <span v-if="item?.type === MessageType.private">
                          <div v-if="item?.media === MessageMedia.text"
                               class="chat-content">
                            {{ item?.privateContent }}
                          </div>
                          <span v-else-if="item?.media === MessageMedia.picture">
                            <ChatImage :message="item" :download-file="downloadFile"></ChatImage>
                          </span>
                          <span v-else-if="item?.media === MessageMedia.zip">
                            <Chatzip :message="item" :download-file="downloadFile"></Chatzip>
                          </span>
                          <span v-else-if="item?.media === MessageMedia.apply">
                              <el-card v-if="item?.applyContent.type === apply.join" shadow="always" class="chat-card">
                                <div v-if="item?.senderID === store['user'].id">{{
                                    item?.applyContent.data.selfContent
                                  }}</div>
                                <div v-else>{{ item?.applyContent.data.otherContent }}</div>
                                <div class="flex-center" style="justify-content: space-around;">
                                  <el-button type="primary" @click="agreeJoin">同意</el-button>
                                  <el-button>拒绝</el-button>
                                </div>
                              </el-card>
                              <el-card v-else-if="item?.applyContent.type === apply.finishPlan" shadow="always"
                                       class="chat-card">
                                <div v-if="item?.senderID === store['user'].id">
                                  {{ item?.applyContent.data.selfContent }}
                                </div>
                                <div v-else>{{ item?.applyContent.data.otherContent }}</div>
                                <div class="flex-center" style="justify-content: space-around;">
                                  <el-button type="primary" @click="finishDetail">更新详情</el-button>
                                  <el-button type="primary" @click="agreeFinishPlan">同意</el-button>
                                  <el-button>拒绝</el-button>
                                </div>
                              </el-card>
                              <el-card v-else-if="item?.applyContent.type === apply.finishItem" shadow="always"
                                       class="chat-card">
                                 <div v-if="item?.senderID === store['user'].id">{{
                                     item?.applyContent.data.selfContent
                                   }}</div>
                                 <div v-else>{{ item?.applyContent.data.otherContent }}</div>
                                 <div class="flex-center" style="justify-content: space-around;">
                                   <el-button type="primary" @click="visibleFinishItem">同意</el-button>
                                   <el-button>拒绝</el-button>
                                 </div>
                              </el-card>
                          </span>
                        </span>
                          <span v-if="item?.media === MessageMedia.tag" class="tag-content">
                            <div v-if="item?.senderID === store['user'].id">{{
                                item?.tagContent.data.selfContent
                              }}</div>
                            <div v-else>{{ item?.tagContent.data.otherContent }}</div>
                          </span>
                          <span v-if="item?.media !== MessageMedia.tag" class="read-font">
                            <span v-if="item?.hasRead">已读</span>
                            <span v-else style="color: #e04848">未读</span>
                        </span>
                        </el-row>
                      </el-row>
                    </div>
                  </div>
                </el-scrollbar>
              </div>
            </el-row>
            <el-row class="row chat-input" :style="{height: pageSet.inputHeight}">
              <ChatOperate :send="send"
                           :apply-join="applyJoin"
                           :apply-finish-plan="applyFinishPlan"
                           :apply-finish-item="applyFinishItem"
                           :rate="visibleRate"></ChatOperate>
              <el-row class="row input-area">
                <el-col :span="24">
                  <el-input @keydown.enter="privateSend($event)"
                            v-model="chat.inputMsg"
                            :autosize="{ minRows: 1, maxRows: 4 }"
                            type="textarea"
                            placeholder="请输入"/>
                </el-col>
              </el-row>
              <el-row class="row send-area">
                <el-button @click="privateSend"
                           class="send-btn"
                           type="primary"
                           color="#b7e896">
                  发送
                </el-button>
              </el-row>
            </el-row>
          </el-row>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">

.chat-main {
  padding-top: 10px;
}

.chat-list, .chat-board {
  min-height: 600px;
  max-height: 600px;
}

.chat-card {
  max-height: 600px;

  .chat-board {
    display: flex;
    flex-direction: column;
    //justify-content: space-between;
    align-items: center;

    .chat-header {
      font-size: 18px;
      font-weight: 500;
    }

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
        //overflow-wrap: break-word;
        white-space: pre-wrap; /* 保留换行 */
        word-break: break-word; /* 换行时自动换行 */
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
      bottom: 0;
      display: block;
      min-height: 150px;
      //max-height: 200px;

      .input-area {
        height: 80px;

        :deep(.el-input__wrapper) {
          box-shadow: none !important;
          // border-bottom: 1px solid black;
          border-radius: 0;
        }

        :deep(.el-textarea__inner ) {
          box-shadow: none !important;
        }

        :deep(.el-textarea ) {
          .el-textarea__inner {
            resize: none; // 去除右下角图标
          }
        }
      }

      .send-area {
        display: flex;
        justify-content: end;
        align-items: center;
      }

      .send-btn {
        height: 30px;
        width: 80px;
      }
    }
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
  min-height: 300px;
  //max-height: 400px;
  height: 400px;
  display: block;
  width: 100%;
  padding: 10px 0;
}

.read-font {
  margin-left: 5px;
  font-size: 14px;
  color: #999999;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
}
</style>
