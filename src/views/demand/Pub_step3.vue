<script setup lang="ts">
import {defineExpose, onMounted, ref} from "vue"
import type {UploadProps, UploadUserFile} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {defineProps} from "vue/dist/vue";
import {Close, Plus} from "@element-plus/icons-vue";
import {checkValue, deepJSONParse, elMsgOption, getDate} from "@/utils/utils";
import {request} from "@/utils/axios";
import {API, userDemandGroup} from "@/api/api";

interface plan {
  time: string,
  title: string,
  content: string,
  fee: number,
  status: number,
}

const props = defineProps({
  demand: {}
})
const formData = ref({
  name: "",
  demand: "",
  materialPath: "",
  remuneration: 0,
  leftFee: 0,
  plan: <plan[]>[],
  planLineID: "",
  duration: [],
  requires: [],
  requireName: ["甲", "乙", "丙", "丁", "戊", "己"],
  requireOpts: [
    {
      value: "1",
      label: "产品"
    },
    {
      value: "2",
      label: "UI"
    },
    {
      value: "3",
      label: "前端"
    },
    {
      value: "4",
      label: "后端"
    },
    {
      value: "5",
      label: "运维"
    },
    {
      value: "6",
      label: "测试"
    },
    {
      value: "7",
      label: "全栈"
    },
  ],
  paymentWay: 0,
  notes: "",
  recruitNum: 0,
  recruitNumOpts: [
    {
      value: 1,
      label: "1人"
    },
    {
      value: 2,
      label: "2人"
    },
    {
      value: 3,
      label: "3人"
    },
    {
      value: 4,
      label: "4人"
    },
    {
      value: 5,
      label: "5人"
    },
    {
      value: 6,
      label: "6人"
    },
  ],
})

function changePlan(way) {
  console.log(formData.value.plan)
  if (way > 0) {
    formData.value.plan.push({
      time: "",
      title: "",
      content: "",
      fee: 0,
      status: 1,
    })
  } else {
    formData.value.plan.pop()
  }
}

function selectRecruitNum() {
  formData.value.requires = []
  let person = {
    name: "",
    value: 0
  }
  for (let i = 0; i < formData.value.recruitNum; i++) {
    person.name = formData.value.requireName[i]
    formData.value.requires.push(JSON.parse(JSON.stringify(person)))
  }
}

function updateDemand(dm) {
  setDemand(dm)

  //创建userDemand
  // for (let i = 0; i < formData.value.recruitNum; i++) {
  //   createUserDemand(i + 1)
  // }
}

async function createUserDemand(role) {
  request({
    url: userDemandGroup.pub,
    method: API.POST,
    data: {
      did: props.demand.id,
      publisherID: props.demand.uid,
      joinDate: new Date(),
      role: role,
      status: 1,
    }
  })
}

function setDemand(dm) {
  dm.value.plan = JSON.stringify(formData.value.plan)
  dm.value.start = formData.value.duration[0]
  dm.value.end = formData.value.duration[1]
  dm.value.requires = JSON.stringify(formData.value.requires)
  dm.value.remuneration = formData.value.remuneration
  dm.value.leftFee = dm.value.remuneration
  dm.value.recruitNum = formData.value.recruitNum
  dm.value.notes = formData.value.notes
}

function formatTooltip(num: number): number | string {
  let fee = formData.value.remuneration * num * 0.01
  return `${num}% ￥${fee}`
}

function pointerOpt() {
  return formData.value.requireName.slice(0, formData.value.recruitNum)
}

function check() {
  let b = checkValue(
      formData.value.duration[0],
      formData.value.duration[1],
      formData.value.requires,
      formData.value.remuneration,
      formData.value.recruitNum,
  )
  if (!b) {
    ElMessage(elMsgOption("请输入需求名称和概述", "warning"))
    return false
  }

  return true
}

onMounted(() => {
  formData.value.plan = []
  formData.value.duration = []
  formData.value.duration.push(props.demand.start)
  formData.value.duration.push(props.demand.end)
  formData.value.requires = deepJSONParse(props.demand.requires)
  formData.value.remuneration = parseInt(props.demand.remuneration)
  formData.value.recruitNum = props.demand.recruitNum
  formData.value.notes = props.demand.notes

  formData.value.plan = [
    {
      time: getDate("/"),
      title: "前期计划",
      content: "",
      fee: 0,
      status: 1,
    },
    {
      time: getDate("/"),
      title: "后期计划",
      content: "",
      fee: 0,
      status: 1,
    },
  ]
})

defineExpose({updateDemand, check})
</script>

<template>
  <el-row class="row content" justify="center">
    <el-scrollbar class="scrollbar">
      <el-row class="row inputItem">
        <el-col :span="3">开发时间：</el-col>
        <el-col :span="20">
          <el-date-picker
              v-model="formData.duration"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              style="width: 100%;"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-row class="childInputItem">
          <el-col :span="6">开发费用：</el-col>
          <el-col :span="16">
            <el-input type="number" v-model="formData.remuneration" placeholder=""/>
          </el-col>
        </el-row>
        <el-row class="childInputItem">
          <el-col :span="6">招募人数：</el-col>
          <el-col :span="16">
            <el-select
                v-model="formData.recruitNum"
                class="m-2"
                placeholder="Select"
                @change="selectRecruitNum"
            >
              <el-option
                  v-for="item in formData.recruitNumOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-col>
        </el-row>
      </el-row>

      <el-row v-if="formData.recruitNum > 0" class="row inputItem">
        <el-col :span="3">技术类型：</el-col>
        <el-col :span="20">
          <el-row class="require" v-for="(item, index) in formData.requires">
            <el-col :span="3">
              <el-icon>
                <UserFilled/>
              </el-icon>
              <span>&nbsp;{{ item.name }}:</span>
            </el-col>
            <el-col :span="21">
              <el-select
                  v-model="formData.requires[index].value"
                  multiple
                  class="m-2"
                  placeholder="Select">
                <el-option
                    v-for="item in formData.requireOpts"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!--      <el-row class="row inputItem">-->
      <!--        <el-col :span="3">总体计划：</el-col>-->
      <!--        <el-col :span="20" class="row">-->
      <!--          <template style="display: block;">-->
      <!--            <el-timeline>-->
      <!--              <el-timeline-item v-for="item in formData.plan" center>-->
      <!--                <div class="flex-ai-center" style="margin: 5px 0;">-->
      <!--                  <el-icon :size="18">-->
      <!--                    <Timer/>-->
      <!--                  </el-icon>-->
      <!--                  &nbsp;-->
      <!--                  <el-date-picker-->
      <!--                      v-model="item.time"-->
      <!--                      type="date"-->
      <!--                      placeholder="Pick a day"-->
      <!--                  />-->
      <!--                </div>-->
      <!--                <el-card>-->
      <!--                  <el-row class="row" style="margin-bottom: 15px;">-->
      <!--                    <el-col :span="24" class="flex-ai-center">-->
      <!--                      <el-row class="row flex-ai-center">-->
      <!--                        <el-col :span="3">-->
      <!--                          <span>名称：</span>-->
      <!--                        </el-col>-->
      <!--                        <el-col :span="18">-->
      <!--                          <el-input-->
      <!--                              v-model="item.title"-->
      <!--                              placeholder="计划名称"-->
      <!--                          />-->
      <!--                        </el-col>-->
      <!--                      </el-row>-->
      <!--                    </el-col>-->
      <!--                  </el-row>-->
      <!--                  <el-row class="row">-->
      <!--                    <el-col :span="24" class="flex-ai-center">-->
      <!--                      <el-row class="row flex-ai-center">-->
      <!--                        <el-col :span="3">-->
      <!--                          <span>内容：</span>-->
      <!--                        </el-col>-->
      <!--                        <el-col :span="18">-->
      <!--                          <el-input-->
      <!--                              v-model="item.content"-->
      <!--                              :rows="2"-->
      <!--                              type="textarea"-->
      <!--                              placeholder="计划内容"-->
      <!--                          />-->
      <!--                        </el-col>-->
      <!--                      </el-row>-->
      <!--                    </el-col>-->
      <!--                  </el-row>-->
      <!--                </el-card>-->
      <!--              </el-timeline-item>-->
      <!--            </el-timeline>-->
      <!--            <el-row>-->
      <!--              <el-button @click="changePlan(1)">-->
      <!--                <el-icon>-->
      <!--                  <Plus/>-->
      <!--                </el-icon>-->
      <!--              </el-button>-->
      <!--              <el-button @click="changePlan(-1)">-->
      <!--                <el-icon>-->
      <!--                  <Minus/>-->
      <!--                </el-icon>-->
      <!--              </el-button>-->
      <!--            </el-row>-->
      <!--          </template>-->
      <!--        </el-col>-->
      <!--      </el-row>-->
      <el-row class="row inputItem">
        <el-col :span="3">备注：</el-col>
        <el-col :span="20">
          <el-input
              v-model="formData.notes"
              :rows="10"
              type="textarea"
              placeholder="Please input"
          />
        </el-col>
      </el-row>
    </el-scrollbar>
  </el-row>
</template>

<style scoped lang="scss">
.content {
  padding: 10px 120px;
}

.childInputItem {
  width: 50%;
  margin: 10px 0;
}

.inputItem {
  width: 100%;
  margin: 10px 0;
}

.require {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-bottom: 8px;
}

.plan {
  min-height: 500px;
  height: 550px;
}

.scrollbar {
  height: auto;
  width: 100%;
}

.date-picker {
  width: 100% !important;
}
</style>
