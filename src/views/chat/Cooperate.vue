<script setup lang="ts">
import {getAlias} from "@/utils/utils";
import {computed, defineProps, onMounted, ref} from "vue";
import {MessageType} from "@/utils/websocket";
import {GetEngineerParentSkills} from "@/api/api";

const props = defineProps({
  cooperate: {
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

const cooperate = computed(() => props.cooperate)
const engineerSkills = ref([])

function cooperateCtl(show) {
  cooperate.value.visible = show
}

function selectRole() {
  cooperateCtl(false)
  applyJoin(cooperate.value.role)
}

function applyJoin(role) {
  let alias = getAlias(role - 1)
  props.confirm!(MessageType.apply, {
    type: 1,
    data: {
      role: role,
      selfContent: `我发起接手需求申请，身份为${alias}，等待对方同意`,
      otherContent: `对方发起接手需求申请，身份为${alias}，是否同意`,
    }
  })
}

function getSkillTags(val: string[]): string[] {
  let res = []
  for (const v of val) {
    res.push(engineerSkills.value[parseInt(v) - 1].label)
  }
  return res
}

onMounted(() => {
  GetEngineerParentSkills().then(res => {
    engineerSkills.value = res
  })
})

</script>

<template>
  <el-dialog v-model="cooperate.visible" title="请选择身份" width="500">
    <el-radio-group v-model="cooperate.role">
      <div class="row flex-col">
        <div v-for="(item, index) in props.demand?.requires">
          <el-radio :label="index+1" :value="index+1" size="large" border>
            <el-row class="row flex-ai-center">
              <span>{{ item.name }}&nbsp;</span>
              <div>
                  <span v-for="tag in getSkillTags(item.value)">
                    {{ tag }}&nbsp;
                  </span>
              </div>
            </el-row>
          </el-radio>
        </div>
      </div>
    </el-radio-group>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cooperateCtl(false)">取消</el-button>
        <el-button @click="selectRole" type="primary">
          申请
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
