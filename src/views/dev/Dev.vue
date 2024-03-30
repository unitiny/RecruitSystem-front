<script setup lang="ts">
import {onMounted, ref} from "vue"
import {global} from "@/static/static";
import {request} from "@/utils/axios";
import {userDemandGroup, userGroup} from "@/api/api";
import {getSkills} from "@/utils/utils";
import {useRouter} from "vue-router";
import {useGlobalStore} from "@/store/pinia";

const router = useRouter()
const store = useGlobalStore()
const avatar = global.path.static + '/img/avatar.jpg'

const developers = ref([])
const evaluates = ref({})
const total = ref(0)

function privateChat(did, uid) {
  router.push({
    name: "/chat/privatechat",
    query: {
      uid: uid,
      did: did
    }
  })
}

function getDevelopers() {
  request({
    url: userGroup.getUsers,
    params: {
      identity: 2
    }
  }).then(res => {
    total.value = res["total"]
    developers.value = res["list"]

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

function getEvaluates() {
  request({
    url: userDemandGroup.getEvaluates,
  }).then(res => {
    evaluates.value = res
  })
}

function getSkillTags(tags) {
  if (tags && tags.length > 3) {
    return tags.slice(0, 3)
  }
  return tags
}


onMounted(() => {
  getDevelopers()
  getEvaluates()
})
</script>

<template>
  <div class="dev-container">
    <el-scrollbar class="dev-scroller">
      <el-row class="developers" :gutter="30">
        <el-col v-for="item in developers" :span="7" class="card">
          <el-row class="row">
            <el-col :span="10" class="avatar-area">
              <el-avatar :size="80" :src="avatar" style="margin-right: 10px;"/>
              <div class="operate row">
                <el-icon v-if="store['user']?.identity === 1"
                         @click="privateChat(0, item?.id)" :size="20">
                  <ChatRound/>
                </el-icon>
                <el-icon :size="20">
                  <Star/>
                </el-icon>
                <el-icon :size="20">
                  <StarFilled/>
                </el-icon>
              </div>
            </el-col>
            <el-col :span="14" class="info">
              <el-text class="name w-150px mb-2" truncated>
                {{ item?.nickname !== "" ? item?.nickname : "匿名" }}
              </el-text>
              <el-row style="width: 100%;">
                <el-tag v-for="skill in getSkillTags(item?.tags)"
                        type="info" class="skill-tag">{{ skill }}
                </el-tag>
                <span v-if="item?.tags && item?.tags?.length > 3">...</span>
                <span v-if="!item?.tags">用户未填写</span>
              </el-row>
              <el-row style="width: 100%;">
                <el-col :span="4" v-for="topSkill in item?.topTags">{{ topSkill }}</el-col>
              </el-row>
            </el-col>
          </el-row>
          <el-row>
            <el-text class="w-200px mb-2" truncated>
              {{ item?.signature !== "" ? item?.signature : "用户未填写签名" }}
            </el-text>
          </el-row>
          <el-row class="footer">
            <div>
              <span>完成数</span>
              <br/>
              <span>{{ evaluates[item.id]?.finishNum ?? 0 }}</span>
            </div>
            <div>
              <div>评价分</div>
              <div>{{ evaluates[item.id]?.rate ?? 0 }}</div>
            </div>
            <div>
              <div>评价数</div>
              <div>{{ evaluates[item.id]?.rateNum ?? 0 }}</div>
            </div>
          </el-row>
        </el-col>
      </el-row>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.dev-container {
  position: relative;
  width: 100%;
  height: 100%;
  color: black;
  display: flex;
  justify-content: center;

  .dev-scroller {
    height: 80%;
    width: 100%;

    .developers {
      padding: 20px 0;
      width: 90%;
      margin: 0 auto !important;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

}

.card {
  //width: 30%;
  height: 260px;
  border-radius: 20px;
  //border: solid 1px black;
  padding: 10px;
  margin: 20px;
  background: white;
  @include flex(column, space-between, start);

  .avatar-area {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    .operate {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      margin-top: 10px;
    }
  }

  .info {
    width: 100%;
    flex-direction: column;
    justify-content: space-between;

    .name {
      font-size: 18px;
    }

    .skill-tag {
      color: black;
      margin: 5px 5px 10px 5px;
    }
  }

  .footer {
    width: 100%;
    text-align: center;
    @include flex(row, space-between, center);
  }
}

.card:hover {
  box-shadow: var(--el-box-shadow-light);
}
</style>
