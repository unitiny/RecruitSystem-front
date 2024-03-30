<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main>
    <TheWelcome />
    <template style="display: block;">
      <el-timeline>
        <el-timeline-item v-for="item in demand.plan" center>
          <div class="flex-ai-center" style="margin: 5px 0;">
            <el-icon :size="18">
              <Timer/>
            </el-icon>
            &nbsp;
            <el-date-picker
                v-model="item.time"
                type="date"
                placeholder="Pick a day"/>
          </div>
          <el-card>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-input
                    v-model="item.content"
                    :rows="4"
                    type="textarea"
                    placeholder="计划内容"
                />
              </el-col>
              <el-col :span="12" class="card-right">
                <el-row class="row flex-ai-center">
                  指派：&nbsp;
                  <el-select
                      v-model="item.pointer"
                      class="m-2"
                      placeholder="Select"
                      style="width: 240px"
                  >
                    <el-option
                        v-for="(item1, index) in pointerOpt()"
                        :key="item1"
                        :label="item1"
                        :value="index"
                    />
                  </el-select>
                </el-row>
                <el-row class="row card-fee">
                  报酬：&nbsp;&nbsp;
                  <el-slider v-model="item.fee" :format-tooltip="formatTooltip"/>
                </el-row>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </template>

  </main>
</template>
