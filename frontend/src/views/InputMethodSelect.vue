<template>
  <div class="input-method">
    <h2 class="page-title">选择录入方式</h2>
    <p class="page-desc">当前模板：<el-tag type="primary">{{ store.currentTemplateName }}</el-tag></p>
    
    <div class="method-cards">
      <div
        class="method-card ai-card"
        :class="{ active: selected === 'ai' }"
        @click="selectMethod('ai')"
      >
        <div class="method-badge">AI智能</div>
        <div class="method-icon">
          <el-icon size="40" color="#10b981"><MagicStick /></el-icon>
        </div>
        <div class="method-title">自然语言录入</div>
        <div class="method-desc">输入一段采购需求描述，AI自动识别并填充字段</div>
        <ul class="method-features">
          <li><el-icon size="14" color="#10b981"><CircleCheck /></el-icon> 快速起草，30秒出初稿</li>
          <li><el-icon size="14" color="#10b981"><CircleCheck /></el-icon> 智能识别关键信息</li>
          <li><el-icon size="14" color="#10b981"><CircleCheck /></el-icon> 可跳转表单继续完善</li>
        </ul>
        <div class="method-check" v-if="selected === 'ai'">
          <el-icon><CircleCheckFilled /></el-icon>
        </div>
      </div>
      
      <div
        class="method-card form-card"
        :class="{ active: selected === 'form' }"
        @click="selectMethod('form')"
      >
        <div class="method-badge">精准</div>
        <div class="method-icon">
          <el-icon size="40" color="#2563eb"><EditPen /></el-icon>
        </div>
        <div class="method-title">表单逐项填写</div>
        <div class="method-desc">按分组逐项填写每个字段，精确控制所有参数</div>
        <ul class="method-features">
          <li><el-icon size="14" color="#2563eb"><CircleCheck /></el-icon> 完整覆盖所有字段</li>
          <li><el-icon size="14" color="#2563eb"><CircleCheck /></el-icon> 自动保存草稿</li>
          <li><el-icon size="14" color="#2563eb"><CircleCheck /></el-icon> 必填项校验提醒</li>
        </ul>
        <div class="method-check" v-if="selected === 'form'">
          <el-icon><CircleCheckFilled /></el-icon>
        </div>
      </div>
    </div>
    
    <div class="action-bar">
      <el-button @click="$router.push('/template-select')">上一步</el-button>
      <div class="action-bar-right">
        <el-button type="primary" :disabled="!selected" @click="goNext">
          开始录入
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTenderStore } from '@/stores/tender'

const router = useRouter()
const store = useTenderStore()
const selected = ref(store.currentInputMethod)

function selectMethod(method) {
  selected.value = method
}

function goNext() {
  store.selectInputMethod(selected.value)
  if (selected.value === 'ai') {
    router.push('/ai-input')
  } else {
    router.push('/field-form')
  }
}
</script>

<style scoped>
.page-desc {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 24px;
}

.method-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.method-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.method-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
}

.ai-card.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.form-card.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.method-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.ai-card .method-badge {
  background: #d1fae5;
  color: #059669;
}

.form-card .method-badge {
  background: #dbeafe;
  color: #2563eb;
}

.method-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.ai-card .method-icon {
  background: #d1fae5;
}

.form-card .method-icon {
  background: #dbeafe;
}

.method-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.method-desc {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 20px;
  line-height: 1.6;
}

.method-features {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}

.method-check {
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-size: 24px;
}

.ai-card .method-check {
  color: #10b981;
}

.form-card .method-check {
  color: #2563eb;
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
