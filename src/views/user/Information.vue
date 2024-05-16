<script setup lang="ts">
import {watch, ref} from "vue"
import {useGlobalStore} from "@/store/pinia";
import {getSkills} from "@/utils/utils";
import {global} from "@/static/static";
import Mask from "@/components/common/Mask.vue"
import PersonInformation from "@/components/PersonInformation.vue"
import {useRoute} from "vue-router";
import {GetUser} from "@/api/api";

const background = global.path.static + "/img/background.png"
const store = useGlobalStore()
const route = useRoute()

const user = ref({})
const editVisible = ref(false)

watch(
    () => store["user"],
    async (value, oldValue, onCleanup) => {
      //为了效率,有点怪
      if(route.query.uid > 0) {
        await GetUser(route.query.uid).then(res => {
          value = res
        })
      }
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
  if(user.skills !== "") {
    user.theSkills = JSON.parse(user.skills)
  } else {
    user.theSkills = []
  }
  user.topTags = []
  user.tags = []
  getSkills(user.theSkills, 0,
      user.topTags, user.tags)
}
</script>

<template>
  <div class="info-main">
    <div class="background">
      <el-image class="img" :src="background" :fit="'fill'"></el-image>
    </div>
    <el-row class="container row">
      <el-card shadow="always" class="card box-card">
        <el-row class="row header" :gutter="50">
          <el-col :span="4" class="flex-center">
            <el-avatar :size="100" :src="user.avatar"/>
          </el-col>
          <el-col :span="20">
            <div class="name">
              <span>{{ user.username }} &nbsp; {{ user.nickname }}</span>
              <span>
                <el-button @click="maskTick" type="primary">
                  编辑资料
                 <el-icon class="el-icon--right">
                   <Edit/>
                 </el-icon>
               </el-button>
              </span>
            </div>
            <div>
              {{ user.signature }}
            </div>
          </el-col>
        </el-row>
        <el-divider/>
        <el-row class="row span">
          <el-icon>
            <Message/>
          </el-icon>
          <el-col :span="12">{{ user.email }}</el-col>
        </el-row>
        <el-divider/>
        <el-row class="row span">
          <el-icon>
            <EditPen/>
          </el-icon>
          <el-col :span="12">{{ user.description }}</el-col>
        </el-row>
        <el-divider/>
        <el-row class="row span">
          <el-icon>
            <Collection/>
          </el-icon>
          <el-col :span="12">
            <span v-for="item in user.topTags" style="margin: 5px;">{{ item }}</span>
          </el-col>
        </el-row>
        <el-divider/>
        <el-row class="row span">
          <el-icon>
            <Postcard/>
          </el-icon>
          <el-col :span="12">
            <span v-for="item in user.tags" style="margin: 5px;">{{ item }}</span>
          </el-col>
        </el-row>
      </el-card>
    </el-row>
    <Mask @nextTick="maskTick" :visible="editVisible">
      <PersonInformation @cancel="maskTick"></PersonInformation>
    </Mask>
  </div>

</template>

<style scoped lang="scss">
.info-main {
  position: relative;
  width: 100%;
  height: 100%;

  .background {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;

    .img {
      width: 100%;
      height: 100%;
      //filter: blur(1px);
    }
  }
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

.card {
  min-width: 1000px;
  margin-top: 60px;
  font-size: 14px;

  .header {
    font-size: 20px;

    .name {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .span {
    font-size: 18px;
    display: flex;
    justify-content: start;
    align-items: center;
    //height: 30px;
    //border-bottom: 1px solid #b2b2b2;
    //padding: 10px;
    i {
      font-size: 25px;
      margin-right: 12px;
    }
  }
}
</style>
