<script setup lang="ts">
import {computed, defineProps, onMounted, ref} from "vue";
import {MessageType} from "@/utils/websocket";
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
const finishPlan = computed(() => props.finishItem)

function finishPlanCtl(show) {
  finishPlan.value.visible = show
  finishPlan.value.applyVisible = show
}

function updatePlan() {
  finishPlanCtl(false)
  applyPlan()
}

function applyPlan() {
  props.confirm!(MessageType.apply, {
    type: 2,
    data: {
      applyPlan: finishPlan.value.applyPlan,
      selfContent: `我发起更新计划进度申请，等待对方同意`,
      otherContent: `对方发起更新计划进度申请，请查看更新详情后决定是否同意`,
    }
  })
}
</script>

<template>
  <el-dialog v-model="finishItem.visible" title="选择要更新的计划" width="750">
    <el-scrollbar style="height: 400px;">
      <el-timeline>
        <el-timeline-item v-for="(item, index) in props.demand?.plan" center>
          <div class="flex-ai-center" style="margin: 5px 0;">
            <el-icon :size="18">
              <Timer/>
            </el-icon>
            &nbsp;
            <span>{{ item.time }}</span>
          </div>
          <el-row class="row plan-content">
            <span class="plan-card">
          <el-card>
          <el-row class="row"
                  style="margin-bottom: 15px; font-size: 16px;">
            {{ item.title }}
          </el-row>
          <el-row class="row">
            {{ item.content }}
          </el-row>
        </el-card>
        </span>
            <span class="plan-operate">
                <span v-if="store['user'].identity === 1">
                  <span v-if="item.status === 1">待完成</span>
                  <span v-else-if="item.status === 2">
                    <el-icon :color="'blue'" :size="20"><Loading/></el-icon>
                    申请中
                  </span>
                  <span v-else-if="item.status === 3">
                    <el-icon :color="'green'" :size="20"><CircleCheck/></el-icon>
                    已完成
                  </span>
                </span>
                <span v-else-if="store['user'].identity === 2">
                 <span v-if="item.status === 1">
                   <span v-if="finishItem.applyVisible">
                     <el-checkbox
                         v-model="finishItem.applyPlan[index]"
                         label=""
                         size="large"/>
                   </span>
                   <span v-else>
                     待完成
                   </span>
                 </span>
                  <span v-else-if="item.status === 2">
                    <el-icon :color="'blue'" :size="20"><Loading/></el-icon>
                    申请中
                  </span>
                  <span v-else-if="item.status === 3">
                    <el-icon :color="'green'" :size="20"><CircleCheck/></el-icon>
                    已完成
                  </span>
                </span>
            </span>
          </el-row>
        </el-timeline-item>
      </el-timeline>
    </el-scrollbar>
    <template #footer>
      <div v-if="store['user'].identity === 2 &&
      finishItem.applyVisible" class="dialog-footer">
        <el-button @click="finishPlanCtl(false)">取消</el-button>
        <el-button @click="updatePlan" type="primary">
          申请
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.plan-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .plan-card {
    width: 75%;
  }

  .plan-operate {
    margin-right: 40px;
  }
}
</style>
