<script setup lang="ts">
import router from "@/router";
import {diffDay, getTags, getPaymentWay, getMoney} from "@/utils/utils";
import {defineProps, onMounted, ref} from "vue";
import {global} from "@/static/static";
import {useGlobalStore} from "@/store/pinia";
import {GetUser} from "@/api/api";

const props = defineProps({
  demand: {
    type: Object,
    required: true
  }
})

const store = useGlobalStore()
const user = ref({})

function demandDetail(did) {
  router.push({
    name: "/demand/detail",
    query: {
      did: did
    }
  })
}

function privateChat(did, uid) {
  router.push({
    name: "/chat/privatechat",
    query: {
      uid: uid,
      did: did
    }
  })
}

onMounted(() => {
  GetUser(props.demand.uid).then(res => {
    user.value = res
  })
})
</script>

<template>
  <el-row @click="demandDetail(props.demand.id)"
          class="demand-card">
    <el-row class="body">
      <el-col :span="20" class="content">
        <el-row class="flex-ai-center">
          <el-col :span="6" class="title">{{ props.demand.name }}</el-col>
          <el-col :span="2" v-if="props.demand?.status === 3">
            <el-tag>已完结</el-tag>
          </el-col>
          <el-col :span="6" v-if="props.demand.type === 2">
            <el-tag>合伙人</el-tag>
          </el-col>
        </el-row>
        <el-row class="basic-content">
          <el-col :span="4" class="money">
            ￥{{ props.demand.remuneration }}
          </el-col>
          <el-col :span="4" class="flex-ai-center">
            <el-icon>
              <Timer/>
            </el-icon>
            &nbsp;
            {{ diffDay(props.demand.start, props.demand.end) }}天
          </el-col>
          <el-col :span="4" class="flex-ai-center">
            <el-icon>
              <UserFilled/>
            </el-icon>
            &nbsp;
            <b>{{ props.demand.hasRecruitNum }}/{{ props.demand.recruitNum }}</b>&nbsp;
          </el-col>
        </el-row>
        <el-row class="demand-content">
          <el-text class="w-250px mb-2" truncated line-clamp="2">
            {{ props.demand.demand }}
          </el-text>
        </el-row>
      </el-col>
      <el-col :span="4" class="flex-col flex-ai-center">
        <el-avatar :size="40" :src="user.avatar" style="margin-right: 10px;"/>
        <span>{{user.nickname}}</span>
        &nbsp;
        <el-button
            style="margin: 10px;"
            type="primary"
            v-if="store['user']?.identity !== 1"
            @click.stop="privateChat(props.demand.id, props.demand?.uid)">
          立即沟通
        </el-button>
      </el-col>
    </el-row>
    <el-row class="footer flex-ai-center">
      <el-col :span="12" class="skill-tags">
        <span v-for="item1 in getTags(props.demand.requireTags)">{{ item1 }}</span>
      </el-col>
      <el-col :span="12" class="demand-tags">
        <span v-if="props.demand.plan">
          规定计划
        </span>
        <span v-if="props.demand.materialPath">
          附带资料
        </span>
        <span v-if="props.demand.paymentWay !== 0">
          {{ getPaymentWay(props.demand.paymentWay) }}
        </span>
        <span v-if="props.demand.hasPay">
          已付款
        </span>
      </el-col>
      <slot></slot>
    </el-row>
  </el-row>
</template>

<style scoped lang="scss">
.demand-card {
  border-radius: 10px;
  //border: solid 1px #d0d0d0;
  width: 80%;
  height: 220px;
  margin: 20px auto;
  background: white;
  //box-shadow: var(--el-box-shadow);


  .body {
    width: 100%;
    padding: 20px;

    .content {
      display: flex;
      justify-content: space-between;
      flex-direction: column;

      .title {
        font-size: 20px;
        font-weight: 450;
      }

      .basic-content {
        font-size: 18px;

        .money {
          color: $money-color;
          line-height: normal;
        }
      }

      .demand-content {
        padding: 10px 0;
      }
    }
  }

  .footer {
    position: relative;
    width: 100%;
    padding: 0 20px;
    background: $demand-footer;
    border-radius: 0 0 5px 5px;
    font-size: 16px;

    .skill-tags {
      span {
        margin-right: 10px;
      }
    }

    .demand-tags {
      display: flex;
      justify-content: end;

      span {
        margin-right: 10px;
      }
    }
  }
}

.demand-card:hover {
  box-shadow: var(--el-box-shadow-light);
}
</style>
