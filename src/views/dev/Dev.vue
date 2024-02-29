<script setup lang="ts">
import {onMounted, ref} from "vue"
import {global} from "@/static/static";
import {request} from "@/utils/axios";
import {userGroup} from "@/api/api";
import {getSkills} from "@/utils/utils";

const avatar = global.path.static + '/img/avatar.jpg'
const developers = ref([])
const total = ref(0)

function getDevelopers() {
  request({
    url: userGroup.getUsers,
    params: {
      identity: 2
    }
  }).then(res => {
    total.value = res["total"]
    developers.value = res["list"]

    console.log(res)
    for (let i = 0; i < developers.value.length; i++) {
      if (developers.value[i].skills !== "") {
        developers.value[i].theSkills = JSON.parse(developers.value[i].skills)
        developers.value[i].topTags = []
        developers.value[i].tags = []
        getSkills(developers.value[i].theSkills, 0, developers.value[i].topTags, developers.value[i].tags)
      }
    }

    console.log(developers.value)
  })
}


onMounted(() => {
  getDevelopers()
})
</script>

<template>
  <div class="container">
    <el-row>
      <div v-for="item in developers" class="card">
        <el-row style="height: 40%;">
          <el-col :span="12" class="flex-ai-center">
            <el-avatar :size="60" :src="avatar" style="margin-right: 10px;"/>
          </el-col>
          <el-col :span="12">
            <el-row :gutter="20">
              <el-row style="width: 100%;">{{ item.nickname }}</el-row>
              <el-row style="width: 100%;">
                <el-tag v-for="skill in item.tags"  type="info" style="color: black">{{skill}}</el-tag>
              </el-row>
              <el-row style="width: 100%;">
                <el-col :span="4" v-for="topSkill in item.topTags">{{topSkill}}</el-col>
              </el-row>
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          {{ item.label }}
        </el-row>
        <el-row class="footer">
          <div>
            <span>完成数</span>
            <br/>
            <span>10</span>
          </div>
          <div>
            <div>好评率</div>
            <div>90%</div>
          </div>
          <div>
            <div>评价数</div>
            <div>20</div>
          </div>
        </el-row>
      </div>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.card {
  width: 30%;
  height: 200px;
  border-radius: 20px;
  border: solid 1px black;
  padding: 10px;
  @include flex(column, space-between, start);

  .footer {
    width: 100%;
    text-align: center;
    @include flex(row, space-between, center);
  }
}
</style>
