<script setup lang="ts">
import {defineProps, ref} from "vue";
import {checkIfImage, checkIfZip} from "@/utils/utils";
import {MessageMedia, MessageType} from "@/utils/websocket";
import {ElMessage} from "element-plus";
import {useGlobalStore} from "@/store/pinia";

const store = useGlobalStore()
const props = defineProps({
  applyJoin: {
    type: Function,
    required: true
  },
  applyFinishPlan: {
    type: Function,
    required: true
  },
  applyFinishItem: {
    type: Function,
    required: true
  },
  rate: {
    type: Function,
    required: true
  },
  send: {
    type: Function,
    required: true
  },
})

const uploadFileRef = ref(null)

function uploadFile() {
  uploadFileRef.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    convertImageToBase64(file);
  }
}

function convertImageToBase64(file) {
  const reader = new FileReader();

  reader.onload = () => {
    let media = 1
    if (checkIfImage(file)) {
      media = MessageMedia.picture
    } else if (checkIfZip(file)) {
      media = MessageMedia.zip
    }
    props.send!(MessageType.private, reader.result, media)
  }

  reader.onerror = error => {
    console.error('Error reading file: ', error);
    ElMessage({
      showClose: true,
      message: "发送失败",
      type: "error"
    })
  };

  // Read the file as a data URL
  reader.readAsDataURL(file);
}

</script>

<template>
  <el-row class="row">
    <el-row class="row tooltip">
      <el-tooltip
          class="box-item"
          effect="dark"
          content="上传图片或zip文件"
          placement="top"
      >
        <el-icon :size="20" @click="uploadFile">
          <Folder/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="store['user'].identity !== 1"
          class="box-item"
          effect="dark"
          content="接手需求申请"
          placement="top"
      >
        <el-icon :size="20" @click="props.applyJoin">
          <Pointer/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          class="box-item"
          effect="dark"
          content="更新计划申请"
          placement="top"
      >
        <el-icon :size="20" @click="props.applyFinishPlan">
          <EditPen/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="store['user'].identity !== 1"
          class="box-item"
          effect="dark"
          content="完结项目申请"
          placement="top">
        <el-icon :size="20" @click="props.applyFinishItem">
          <CircleCheck/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-if="store['user'].identity === 1"
          class="box-item"
          effect="dark"
          content="评价"
          placement="top">
        <el-icon :size="20" @click="props.rate">
          <Star/>
        </el-icon>
      </el-tooltip>
    </el-row>
    <input ref="uploadFileRef" style="visibility: hidden;height: 1px;" type="file"
           @change="handleFileUpload">
  </el-row>
</template>

<style scoped lang="scss">
.tooltip {
  border-top: 1px solid #bdbdbd;
  padding-top: 5px;

  i {
    margin: 5px;
  }
}
</style>
