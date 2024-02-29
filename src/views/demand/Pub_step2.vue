<script setup lang="ts">
import {computed, defineEmits, defineExpose, defineProps, onMounted, ref} from "vue"
import {baseURL} from "@/utils/axios";
import {demandGroup} from "@/api/api";
import type {UploadProps, UploadUserFile} from 'element-plus'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useGlobalStore} from "@/store/pinia";

const emits = defineEmits(["updateDemand"])
const props = defineProps({
  demand: {}
})
const store = useGlobalStore()
const demand = computed(() => props.demand)

const formData = ref({
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
}

function updateDemand(dm) {
  dm.value.name = formData.value.name
  dm.value.demand = formData.value.demand
  dm.value.materialPath = formData.value.materialPath
}

onMounted(() => {
  formData.value.name = demand.value.name
  formData.value.demand = demand.value.demand
  formData.value.materialPath = demand.value.materialPath
})
defineExpose({updateDemand})
</script>

<template>
  <el-row class="row content" justify="center">
    <el-row class="row inputItem">
      <el-col :span="2">需求名称：</el-col>
      <el-col :span="14">
        <el-input v-model="formData.name" placeholder=""/>
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="2">需求概述：</el-col>
      <el-col :span="14">
        <el-input
            v-model="formData.demand"
            :rows="2"
            type="textarea"
            placeholder="Please input"
        />
      </el-col>
    </el-row>
    <el-row class="row inputItem">
      <el-col :span="2">需求资料：</el-col>
      <el-col :span="14">
        <el-upload
            v-model:file-list="fileList"
            name="material"
            class="upload-demo"
            :headers="{
              token: store['user'].token
            }"
            :data="{
              did: props.demand.id
            }"
            :action="baseURL+demandGroup.uploadMaterial"
            multiple
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :before-remove="beforeRemove"
            :limit="3"
            :on-exceed="handleExceed">
          <el-button type="primary">文件上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              <!--              jpg/png files with a size less than 500KB.-->
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
