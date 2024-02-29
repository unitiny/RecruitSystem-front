<script setup lang="ts">
import {defineExpose, onMounted, ref} from "vue"
import type {UploadProps, UploadUserFile} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {defineProps} from "vue/dist/vue";

const props = defineProps({
  demand: {}
})
const formData = ref({
  name: "",
  demand: "",
  materialPath: "",
  remuneration: 1,
  plan: "",
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

function selectRecruitNum() {
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
  dm.value.plan = formData.value.plan
  dm.value.start = formData.value.duration[0]
  dm.value.end = formData.value.duration[1]
  dm.value.requires = JSON.stringify(formData.value.requires)
  dm.value.remuneration = parseFloat(formData.value.remuneration as string)
  dm.value.recruitNum = formData.value.recruitNum
  dm.value.notes = formData.value.notes
}

onMounted(() => {
  formData.value.plan = props.demand.plan
  formData.value.duration = []
  formData.value.duration.push(props.demand.start)
  formData.value.duration.push(props.demand.end)
  formData.value.requires = props.demand.requires ? JSON.parse(props.demand.requires) : []
  formData.value.remuneration = props.demand.remuneration
  formData.value.recruitNum = props.demand.recruitNum
  formData.value.notes = props.demand.notes
})

defineExpose({updateDemand})
</script>

<template>
  <el-row class="row content" justify="center">
    <el-row class="row inputItem">
      <el-col :span="2">开发计划：</el-col>
      <el-col :span="14">
        <el-input
            v-model="formData.plan"
            :rows="2"
            type="textarea"
            placeholder="Please input"
        />
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="2">开发时间：</el-col>
      <el-col :span="14">
        <el-date-picker
            v-model="formData.duration"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :size="'default'"
        />
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="2">开发费用：</el-col>
      <el-col :span="14">
        <el-input v-model="formData.remuneration" placeholder=""/>
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="2">招募人数：</el-col>
      <el-col :span="14">
        <el-select
            v-model="formData.recruitNum"
            class="m-2"
            placeholder="Select"
            style="width: 240px"
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
    <el-row class="row inputItem">
      <el-col :span="2">技术类型：</el-col>
      <el-col :span="14">
        <el-row class="require" v-for="(item, index) in formData.requires">
          <el-icon>
            <UserFilled/>
          </el-icon>
          <span>&nbsp;{{ item.name }}:&nbsp;&nbsp;</span>
          <el-select
              v-model="formData.requires[index].value"
              multiple
              class="m-2"
              placeholder="Select"
              style="width: 240px">
            <el-option
                v-for="item in formData.requireOpts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-row>
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="2">备注：</el-col>
      <el-col :span="14">
        <el-input
            v-model="formData.notes"
            :rows="2"
            type="textarea"
            placeholder="Please input"
        />
      </el-col>
    </el-row>
  </el-row>
</template>

<style scoped lang="scss">
.content {
  padding: 10px 120px;
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
</style>
