<script setup lang="ts">
import {computed, defineEmits, defineExpose, defineProps, onMounted, ref, watch} from "vue"
import {baseURL} from "@/utils/axios";
import {demandGroup} from "@/api/api";
import type {UploadFile, UploadFiles, UploadProps, UploadUserFile} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useGlobalStore} from "@/store/pinia";
import {checkValue, elMsgOption} from "@/utils/utils";

const emits = defineEmits(["updateDemand"])
const props = defineProps({
  demand: {}
})
const store = useGlobalStore()
const demand = computed(() => props.demand)

const formData = ref({
  type: 0,
  name: "",
  demand: "",
  materialPath: "",
  remuneration: 0,
  plan: "",
  planLineID: "",
  duration: 0,
  requires: [],
  requireOpts: [
    {
      value: 1,
      label: "产品"
    },
    {
      value: 2,
      label: "UI"
    },
    {
      value: 3,
      label: "前端"
    },
    {
      value: 4,
      label: "后端"
    },
    {
      value: 5,
      label: "运维"
    },
    {
      value: 6,
      label: "测试"
    },
  ],
  paymentWay: 0,
  notes: "",
  group: 0,
  groupOpts: [
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

const fileList = ref<UploadUserFile[]>([])

function handleRemove(file, uploadFiles) {
  console.log(file, uploadFiles)
}

function handlePreview(uploadFile) {
  console.log(uploadFile)
}

function handleError(error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  console.log(uploadFile)
  ElMessage({
    showClose: true,
    type: "error",
    message: "上传失败",
  })
}

function handleExceed(files, uploadFiles) {
  ElMessage.warning(
      `The limit is 3, you selected ${files.length} files this time, add up to ${
          files.length + uploadFiles.length
      } totally`
  )
}

function beforeRemove(uploadFile, uploadFiles) {
  return ElMessageBox.confirm(
      `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
      () => true,
      () => false
  )
}

function handleSuccess(response, uploadFile, uploadFiles) {
  console.log(response, uploadFile, uploadFiles)
  formData.value.materialPath = response["path"]
  ElMessage({
    showClose: true,
    type: "success",
    message: "上传成功",
  })
}

function updateDemand(dm) {
  dm.value.type = formData.value.type
  dm.value.name = formData.value.name
  dm.value.demand = formData.value.demand
  dm.value.materialPath = formData.value.materialPath
}

function updateFormData(dm) {
  formData.value.type = dm.type
  formData.value.name = dm.name
  formData.value.demand = dm.demand
  formData.value.materialPath = dm.materialPath
}

function check() {
  let b = checkValue(formData.value.name, formData.value.demand)
  if (!b) {
    ElMessage(elMsgOption("请输入需求名称和概述", "warning"))
    return false
  }
  return true
}

watch(
    () => props.demand,
    (value, oldValue, onCleanup) => {
      console.log(value, oldValue, demand.value)
      updateFormData(value)
    },
    {
      immediate: true
    }
)

onMounted(() => {
  formData.value.name = demand.value.name
  formData.value.demand = demand.value.demand
  formData.value.materialPath = demand.value.materialPath
})


defineExpose({updateDemand, check})
</script>

<template>
  <el-row class="row content" justify="center">
    <!--    <el-row class="row inputItem">-->
    <!--      <el-col :span="3">发布身份：</el-col>-->
    <!--      <el-col :span="14">-->
    <!--        <el-radio-group v-model="formData.type">-->
    <!--          <el-radio :label="1" :value="1" size="large" border>雇主</el-radio>-->
    <!--          <el-radio :label="2" :value="2" size="large" border>合伙人</el-radio>-->
    <!--        </el-radio-group>-->
    <!--      </el-col>-->
    <!--    </el-row>-->
    <el-row class="row inputItem">
      <el-col :span="3">需求名称：</el-col>
      <el-col :span="20">
        <el-input v-model="formData.name" placeholder=""/>
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="3">需求概述：</el-col>
      <el-col :span="20">
        <el-input
            v-model="formData.demand"
            :rows="5"
            type="textarea"
            placeholder="Please input"
        />
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="3">需求资料：</el-col>
      <el-col :span="20">
        <el-upload
            v-model:file-list="fileList"
            name="material"
            class="upload-demo"
            drag
            :headers="{
              token: store['user'].token,
            }"
            :data="{
              did: demand.id
            }"
            accept="application/zip"
            :action="baseURL+demandGroup.uploadMaterial"
            multiple
            :on-error="handleError"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :before-remove="beforeRemove"
            :limit="3"
            :on-exceed="handleExceed">
          <el-icon class="el-icon--upload">
            <upload-filled/>
          </el-icon>
          <div class="el-upload__text">
            拖拽文件到此或者 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持zip文件
            </div>
          </template>
        </el-upload>
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
</style>
