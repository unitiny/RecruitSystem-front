<script setup lang="ts">
import {computed, defineProps, onMounted, ref} from "vue";
import {useGlobalStore} from "@/store/pinia";

const props = defineProps({
  finishItem: {
    type: Object,
    required: true
  },
  confirm: {
    type: Function,
    required: true
  },
  demand: {
    type: Object,
    required: true
  }
})

const store = useGlobalStore()
const finishItem = computed(() => props.finishItem)

function finishItemCtl(show) {
  finishItem.value.visible = show
}

function updateItem() {
  finishItemCtl(false)
  props.confirm!()
}

</script>

<template>
  <el-dialog v-model="finishItem.visible" title="提示" width="750">
    <div>根据您设置的支付规则及需求佣金，同意对方完结项目后，您将支付5元</div>
    <template #footer>
      <div v-if="store['user'].identity === 1" class="dialog-footer">
        <el-button @click="finishItemCtl(false)">取消</el-button>
        <el-button @click="updateItem" type="primary">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
</style>
