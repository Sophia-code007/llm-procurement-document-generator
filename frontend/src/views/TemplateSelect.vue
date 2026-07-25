<template>
  <div class="template-select">
    <h2 class="page-title">选择模板类型</h2>
    <p class="page-desc">请选择您要生成的采购文件类型，不同类型对应不同的字段和模板</p>
    
    <div class="template-cards">
      <div
        v-for="(config, key) in templateFields"
        :key="key"
        class="template-card"
        :class="{ active: selected === key }"
        @click="selectTemplate(key)"
      >
        <div class="card-icon" :class="'icon-' + config.color">
          <el-icon size="32"><component :is="config.icon" /></el-icon>
        </div>
        <div class="card-title">{{ config.name }}</div>
        <div class="card-desc">
          {{ getDesc(key) }}
        </div>
        <div class="card-count">{{ config.groups.length }} 个分组</div>
        <div class="card-check" v-if="selected === key">
          <el-icon><CircleCheckFilled /></el-icon>
        </div>
      </div>
    </div>
    
    <div class="action-bar">
      <el-button @click="$router.back()">返回</el-button>
      <div class="action-bar-right">
        <el-button type="primary" :disabled="!selected" @click="goNext">
          下一步：选择录入方式
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { templateFields } from '@/config/templateFields'
import { useTenderStore } from '@/stores/tender'

const router = useRouter()
const store = useTenderStore()
const selected = ref(store.currentTemplate)

function getDesc(type) {
  const descs = {
    engineering: '适用于建筑工程、市政工程、装修工程等工程项目招标',
    goods: '适用于设备采购、物资采购、办公用品等货物类采购',
    service: '适用于运维服务、咨询服务、技术服务等服务类采购'
  }
  return descs[type] || ''
}

function selectTemplate(type) {
  selected.value = type
}

function goNext() {
  // 保存模板类型 + 默认文档类型（招标公告 bid），确保后端生成接口参数完整
  store.selectTemplate(selected.value)
  store.setDocType('bid')
  router.push('/input-method')
}
</script>

<style scoped>
.page-desc {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 24px;
}

.template-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.template-card {
  background: #fff;
  border-radius: 14px;
  padding: 28px 24px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.template-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.template-card.active {
  border-color: #2563eb;
  background: #f0f7ff;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.icon-warning { background: #fef3c7; color: #d97706; }
.icon-primary { background: #dbeafe; color: #2563eb; }
.icon-success { background: #d1fae5; color: #10b981; }

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 12px;
}

.card-count {
  font-size: 12px;
  color: #94a3b8;
}

.card-check {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #2563eb;
  font-size: 22px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.action-bar-right {
  display: flex;
  gap: 12px;
}
</style>