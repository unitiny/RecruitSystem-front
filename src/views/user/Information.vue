<script setup lang="ts">
import {watch, ref} from "vue"
import {useGlobalStore} from "@/store/pinia";
import {getSkills} from "@/utils/utils";
import Mask from "@/components/common/Mask.vue"
import PersonInformation from "@/components/PersonInformation.vue"

const store = useGlobalStore()
const user = ref({})
const editVisible = ref(false)

watch(
    () => store["user"],
    (value, oldValue, onCleanup) => {
      parseSkills(value)
      user.value = value
    },
    {
      immediate: true
    }
)

function maskTick() {
  editVisible.value = !editVisible.value
}

function parseSkills(user) {
  user.theSkills = JSON.parse(user.skills)
  user.topTags = []
  user.tags = []
  getSkills(user.theSkills, 0,
      user.topTags, user.tags)
}
</script>

<template>
  <el-row class="container row">
    <el-card shadow="always" class="card box-card">
      <el-row class="row">
        <el-col :span="6">姓名</el-col>
        <el-col :span="2"></el-col>
        <el-col :span="12">{{ user.nickname }}</el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="6">邮箱</el-col>
        <el-col :span="2"></el-col>
        <el-col :span="12">{{ user.email }}</el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="6">手机号</el-col>
        <el-col :span="2"></el-col>
        <el-col :span="12">{{ user.phone }}</el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="6">个性签名</el-col>
        <el-col :span="2"></el-col>
        <el-col :span="12">{{ user.signature }}</el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="6">描述</el-col>
        <el-col :span="2"></el-col>
        <el-col :span="12">{{ user.description }}</el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="6">职位</el-col>
        <el-col :span="2"></el-col>
        <el-col :span="12">
          <span v-for="item in user.topTags" style="margin: 5px;">{{ item }}</span>
        </el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="6">技术</el-col>
        <el-col :span="2"></el-col>
        <el-col :span="12">
          <span v-for="item in user.tags" style="margin: 5px;">{{ item }}</span>
        </el-col>
      </el-row>
    </el-card>
    <el-button @click="maskTick">
      <el-icon>
        <Edit/>
      </el-icon>
    </el-button>
  </el-row>
  <Mask @nextTick="maskTick" :visible="editVisible">
    <PersonInformation></PersonInformation>
  </Mask>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

.card {
  min-width: 600px;
}
</style>
