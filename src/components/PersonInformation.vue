<template>
  <el-row class="card">
    <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
        size="default"
        status-icon
    >
      <el-row style="height: 100%;">
        <el-col class="column" :span="12">
          <el-form-item label="昵称" prop="name">
            <el-input v-model="ruleForm.name"/>
          </el-form-item>
          <el-form-item label="邮箱" prop="mailbox">
            <el-input v-model="ruleForm.mailbox"/>
          </el-form-item>
          <el-form-item label="技能" prop="skill">
            <div class="m-4">
              <el-cascader v-model="ruleForm.skill" :options="skillOptions" :props="props" clearable/>
            </div>
          </el-form-item>
        </el-col>
        <el-col class="column" :span="12">
          <el-form-item label="" prop="avatar">
            <UploadAvatar @change="getAvatar"></UploadAvatar>
          </el-form-item>
          <el-form-item label="个性签名" prop="signature">
            <el-input v-model="ruleForm.signature" type="textarea"/>
          </el-form-item>
          <el-form-item>
            <el-button style="width: 80%;" type="primary" @click="submitForm(ruleFormRef)">
              Create
            </el-button>
<!--            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>-->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-row>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import UploadAvatar from "@/components/common/UploadAvatar.vue"
import {request} from "@/utils/axios";
import {API, userGroup} from "@/api/api";
import {useGlobalStore} from "@/store/pinia";

interface RuleForm {
  name: string
  mailbox: string
  avatar: string
  skill: string[]
  signature: string
}

const store = useGlobalStore()
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  mailbox: '',
  avatar: '',
  skill: [],
  signature: '',
})

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {required: false, message: 'Please input Activity name', trigger: 'blur'},
    {min: 2, max: 20, message: 'Length should be 2 to 20', trigger: 'blur'},
  ],
  mailbox: [
    {required: false, message: 'Please input Mailbox', trigger: 'blur'},
    {min: 8, max: 30, message: 'Length should be 8 to 30', trigger: 'blur'},
  ],
  avatar: [
    {required: false, message: 'Please input Activity name', trigger: 'blur'},
  ],
  skill: [
    {
      type: 'array',
      required: false,
      message: 'Please select at least one activity type',
      trigger: 'change',
    },
  ],
  signature: [
    {required: false, message: 'Please input activity signature', trigger: 'blur'},
  ],
})

const props = {multiple: true}

const skillOptions = [
  {
    value: 1,
    label: '产品',
    children: [
      {
        value: 1,
        label: '产品经理',
      },
    ],
  },
  {
    value: 2,
    label: 'UI',
    children: [
      {
        value: 1,
        label: 'UI设计师',
      },
    ],
  },
  {
    value: 3,
    label: '后端',
    children: [
      {
        value: 1,
        label: 'Java',
      },
      {
        value: 2,
        label: 'C/C++',
      },
      {
        value: 3,
        label: 'PHP',
      },
      {
        value: 4,
        label: 'Python',
      },
      {
        value: 5,
        label: 'C#',
      },
      {
        value: 6,
        label: 'Golang',
      },
      {
        value: 7,
        label: '.Net',
      },
      {
        value: 8,
        label: 'Node.js',
      },
      {
        value: 9,
        label: 'Hadoop',
      },
      {
        value: 10,
        label: '其他后端开发',
      },
    ],
  },
  {
    value: 4,
    label: '前端',
    children: [
      {
        value: 1,
        label: 'JavaScript',
      },
      {
        value: 2,
        label: 'Vue',
      },
      {
        value: 3,
        label: 'React',
      },
      {
        value: 4,
        label: 'Angular',
      },
      {
        value: 5,
        label: 'Android',
      },
      {
        value: 6,
        label: 'IOS',
      },
      {
        value: 7,
        label: '其他前端开发',
      },
    ],
  },
  {
    value: 5,
    label: '运维',
    children: [
      {
        value: 1,
        label: 'IT技术支持',
      },
      {
        value: 2,
        label: '网络工程师',
      },
      {
        value: 3,
        label: '网络安全',
      },
      {
        value: 4,
        label: '系统工程师',
      },
      {
        value: 5,
        label: '运维开发工程师',
      },
      {
        value: 6,
        label: '其他运维工程师',
      },
    ],
  },
  {
    value: 6,
    label: '测试',
    children: [
      {
        value: 1,
        label: '软件测试',
      },
      {
        value: 2,
        label: '自动化测试',
      },
      {
        value: 3,
        label: '功能测试',
      },
      {
        value: 4,
        label: '硬件测试',
      },
      {
        value: 5,
        label: '游戏测试',
      },
      {
        value: 6,
        label: '渗透测试',
      },
      {
        value: 7,
        label: '其他软件测试',
      },
    ],
  },
]

const getAvatar = (path: string) => {
  ruleForm.avatar = path
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      request({
        url: userGroup.updateUser,
        method: API.PUT,
        data: {
          "id": store["user"].id,
          "nickname": ruleForm.name,
          "avatar": ruleForm.avatar,
          "email": ruleForm.mailbox,
          "signature": ruleForm.signature,
          "skills": JSON.stringify(ruleForm.skill)
        }
      }).then(res => {
        store.updateUser(res)
      }).catch(error => {
        let messageOption = {
          showClose: true,
          inputMsg: "更新失败",
          type: 'error',
        }
        ElMessage(messageOption)
      })
    } else {

    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const options = Array.from({length: 10000}).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}))
</script>

<style scoped>
.card {
  width: 60%;
  height: 70%;
  background: white;
  border-radius: 30px;
  min-width: 640px;
}

.column {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}
</style>