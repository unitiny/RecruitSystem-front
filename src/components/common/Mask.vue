<script lang="ts" setup="">
import {defineEmits, defineProps, ref, watchEffect} from 'vue'

const emits = defineEmits<{
  nextTick: []
}>()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const visible = ref(false)
watchEffect(() => visible.value = props.visible)

function closeMask() {
  visible.value = false
  emits("nextTick")
}
</script>

<template>
  <div v-if="visible" class="mask" @click.self="closeMask">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.mask {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  font-size: 14px;
  background: rgba(0, 0, 0, .5);
  z-index: 1;
  -webkit-box-align: center;
  -ms-flex-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
