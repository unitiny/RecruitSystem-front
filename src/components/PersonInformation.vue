<template>
  <el-row class="card">
    <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="120px"
        class="ruleForm"
        size="default"
        status-icon
    >
      <el-row class="row title">修改资料</el-row>
      <el-row>
        <el-col class="column" :span="8">
          <el-form-item label="上传头像" prop="avatar">
            <UploadAvatar @change="getAvatar"></UploadAvatar>
          </el-form-item>
        </el-col>
        <el-col class="column" :span="12">
          <el-form-item class="row" label="昵称" prop="name">
            <el-input class="row" v-model="ruleForm.name"/>
          </el-form-item>
          <el-form-item class="row" label="邮箱" prop="mailbox">
            <el-input class="row" v-model="ruleForm.mailbox"/>
          </el-form-item>
          <el-form-item class="row" label="技能" prop="skill">
            <el-cascader class="row" :collapse-tags="true" :max-collapse-tags="4" v-model="ruleForm.skill"
                         :options="skillOptions"
                         :props="inputProps" clearable/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="20">
          <el-form-item class="signature" label="个性签名" prop="signature">
            <el-input v-model="ruleForm.signature" resize="none" :rows="7" :autosize="{ minRows: 7, maxRows: 7 }"
                      type="textarea"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="row footer-btn">
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          保存
        </el-button>
        <el-button @click="cancel">取消</el-button>
      </el-row>
    </el-form>
  </el-row>
</template>

<script lang="ts" setup>
import {defineEmits, defineProps, reactive, ref} from 'vue'
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

const emits = defineEmits(['cancel'])

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

const inputProps = {multiple: true}

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

const cancel = () => {
  emits('cancel')
}
</script>

<style scoped lang="scss">
.card {
  width: 60%;
  height: 70%;
  background: white;
  /*border-radius: 30px;*/
  min-width: 640px;
  position: relative;

  .ruleForm {
    width: 100%;

    .title {
      font-size: 22px;
      font-weight: 500;
      color: black;
      padding: 10px 20px;
    }

    .signature {
      width: 100%;
    }

    .footer-btn {
      position: absolute;
      display: flex;
      justify-content: end;
      align-items: center;
      padding: 10px;
      right: 20px;
      border-top: 20px;
    }
  }
}

.column {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: start;
}
</style>