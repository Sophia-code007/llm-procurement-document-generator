<template>
  <div class="dashboard">
    <h2 class="page-title">工作台</h2>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card stat-blue">
          <div class="stat-num">128</div>
          <div class="stat-label">累计生成文件</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-green">
          <div class="stat-num">86%</div>
          <div class="stat-label">AI解析准确率</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-orange">
          <div class="stat-num">24</div>
          <div class="stat-label">本月生成数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-purple">
          <div class="stat-num">3</div>
          <div class="stat-label">草稿待完善</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span style="font-weight: 600">快速开始</span>
          </template>
          <div class="quick-actions">
            <div class="quick-card" @click="goToTemplate">
              <el-icon size="28" color="#2563eb"><DocumentAdd /></el-icon>
              <div class="quick-title">新建招标文件</div>
              <div class="quick-desc">选择模板，开始生成</div>
            </div>
            <div class="quick-card" @click="$router.push('/ai-input')">
              <el-icon size="28" color="#10b981"><MagicStick /></el-icon>
              <div class="quick-title">AI快速生成</div>
              <div class="quick-desc">自然语言一键生成</div>
            </div>
            <div class="quick-card" @click="$router.push('/history')">
              <el-icon size="28" color="#f59e0b"><Clock /></el-icon>
              <div class="quick-title">历史文件</div>
              <div class="quick-desc">查看和复用历史</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span style="font-weight: 600">最近生成</span>
          </template>
          <div class="recent-list">
            <div class="recent-item" v-for="i in 5" :key="i">
              <div class="recent-name">XX产业园建设项目招标文件</div>
              <div class="recent-time">2小时前 · 工程类</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToTemplate() {
  router.push('/template-select')
}
</script>

<style scoped>
.stats-row {
  margin-bottom: 8px;
}

.stat-card {
  border-radius: 12px;
  border: none;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.stat-blue .stat-num { color: #2563eb; }
.stat-green .stat-num { color: #10b981; }
.stat-orange .stat-num { color: #f59e0b; }
.stat-purple .stat-num { color: #8b5cf6; }

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.quick-card {
  padding: 24px 16px;
  background: #f8fafc;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-card:hover {
  background: #eff6ff;
  transform: translateY(-2px);
}

.quick-title {
  font-size: 15px;
  font-weight: 500;
  margin-top: 10px;
  color: #0f172a;
}

.quick-desc {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.recent-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.recent-name {
  font-size: 14px;
  color: #0f172a;
  margin-bottom: 4px;
}

.recent-time {
  font-size: 12px;
  color: #94a3b8;
}
</style>
