<script setup lang="ts">
import {ref, defineProps, watchEffect} from "vue";
import {request} from "@/utils/axios";
import {API, userDemandGroup} from "@/api/api";
import {ElMessage} from "element-plus";

const props = defineProps({
  visible: {},
  udid: {}
})

const visible = ref(false)
const rate = ref({
  text: ["非常差", "差评", "中评", "好评", "非常好"],
  star: 0,
  evaluate: ""
})

function updateRate() {
  request({
    url: userDemandGroup.put,
    method: API.PUT,
    data: {
      id: props.udid,
      rate: JSON.stringify({
        time: new Date(),
        star: rate.value.star,
        evaluate: rate.value.evaluate
      })
    }
  }).then(res => {
    ElMessage({
      showClose: true,
      message: "评价成功",
      type: 'success',
    })
    visible.value = false
  })
}

watchEffect(() => visible.value = props.visible)
</script>

<template>
  <div>
    <el-dialog
        v-model="visible"
        title="给个评价吧"
        width="500">
      <div>
        <span>评分：</span>
        <el-rate
            v-model="rate.star"
            :texts="rate.text"
            show-text
        />
      </div>
      <div>
        <span>评价：</span>
        <span>
          <el-input
              v-model="rate.evaluate"
              type="textarea"
              :rows="2"></el-input>
        </span>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">Cancel</el-button>
          <el-button type="primary" @click="updateRate">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
