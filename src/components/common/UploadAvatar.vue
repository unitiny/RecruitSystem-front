<template>
  <el-upload
      class="avatar-uploader"
      name="avatar"
      :headers="{
              token: store['user'].token
            }"
      :data="{
              uid: store['user'].id,
            }"
      :action="baseURL+userGroup.uploadAvatar"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar"/>
    <el-icon v-else class="avatar-uploader-icon">
      <Plus/>
    </el-icon>
  </el-upload>
</template>

<script lang="ts" setup>
import {defineEmits, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import {userGroup} from "@/api/api";
import {baseURL} from "@/utils/axios";
import {useGlobalStore} from "@/store/pinia";
import type {UploadProps} from 'element-plus'

const emits = defineEmits<{
  change: [path: string]
}>()
const imageUrl = ref('')
const store = useGlobalStore()

const handleAvatarSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
  emits("change", response["path"])
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png')  {
    ElMessage.error('Avatar picture must be JPG/PNG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
  border-radius: 50% !important;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px solid #b6b6b6;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
