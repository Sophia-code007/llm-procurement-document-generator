<template>
  <div class="generating-page">
    <div class="gen-container">
      <div class="gen-icon">
        <el-icon :size="64" color="#2563eb" class="rotating"><Setting /></el-icon>
      </div>
      <h2 class="gen-title">正在生成招标文件...</h2>
      <p class="gen-subtitle">{{ currentStep }}</p>
      
      <el-progress :percentage="progress" :stroke-width="10" style="margin: 30px 0" />
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-tip">
        <el-alert :title="error" type="error" :closable="false" />
      </div>
      
      <div class="gen-steps">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="gen-step"
          :class="step.status"
        >
          <div class="gen-step-icon">
            <el-icon v-if="step.status === 'done'"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="step.status === 'active'" class="pulse"><Loading /></el-icon>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span class="gen-step-name">{{ step.name }}</span>
        </div>
      </div>

      <!-- 生成完成：下载按钮 -->
      <div v-if="progress === 100 && status === 'completed'" class="download-wrap">
        <el-button type="primary" size="large" @click="handleDownload">
          <el-icon><Download /></el-icon>
          下载生成的Word文档
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTenderStore } from '@/stores/tender'
import { createGenerateTask, getTaskStatus, downloadDocument } from '@/api/tender'

const router = useRouter()
const store = useTenderStore()

const progress = ref(0)
const status = ref('pending')
const steps = ref([
  { name: '参数校验', status: 'pending' },
  { name: '加载模板', status: 'pending' },
  { name: '填充表单数据', status: 'pending' },
  { name: '生成文档', status: 'pending' },
  { name: '文件导出完成', status: 'pending' },
])
const error = ref('')
const taskId = ref('')
let timer = null

const currentStep = computed(() => {
  const active = steps.value.find(s => s.status === 'active')
  return active ? active.name + '...' : '准备中...'
})

onMounted(() => {
  // 没有模板数据，返回选择页
  if (!store.currentTemplate) {
    router.push('/template-select')
    return
  }
  // 启动真实生成流程
  initGenerateTask()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 1. 创建异步生成任务
async function initGenerateTask() {
  try {
    const params = {
      templateType: store.currentTemplate,
      docType: store.currentDocType,
      source: store.currentInputMethod || 'ai',
      formData: store.formData
    }

    const res = await createGenerateTask(params)
    taskId.value = res.taskId
    store.currentTaskId = res.taskId

    // 开启轮询：每2秒查询一次进度
    timer = setInterval(() => {
      fetchProgress(res.taskId)
    }, 2000)

  } catch (err) {
    error.value = err || '创建生成任务失败'
    ElMessage.error(error.value)
  }
}

// 2. 查询任务进度
async function fetchProgress(tid) {
  try {
    const res = await getTaskStatus(tid)
    progress.value = res.progress
    status.value = res.status
    
    // 同步后端步骤状态
    if (res.steps && res.steps.length > 0) {
      steps.value = res.steps
    }

    // 生成完成 / 失败，停止轮询
    if (res.progress === 100 || res.status === 'failed') {
      clearInterval(timer)
      if (res.status === 'failed') {
        error.value = res.error || '文档生成失败'
        ElMessage.error(error.value)
      } else {
        ElMessage.success('文档生成完成')
      }
    }

  } catch (err) {
    error.value = '查询进度失败'
    clearInterval(timer)
  }
}

// 3. 下载文档
function handleDownload() {
  if (!taskId.value) return
  downloadDocument(taskId.value)
}
</script>

<style scoped>
.generating-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gen-container {
  text-align: center;
  background: #fff;
  padding: 48px 64px;
  border-radius: 16px;
  min-width: 500px;
}

.gen-icon {
  margin-bottom: 20px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gen-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.gen-subtitle {
  color: #64748b;
  font-size: 14px;
}

.error-tip {
  margin-bottom: 20px;
  text-align: left;
}

.gen-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.gen-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.gen-step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: #e2e8f0;
  color: #94a3b8;
}

.gen-step.done .gen-step-icon {
  background: #d1fae5;
  color: #10b981;
}

.gen-step.active .gen-step-icon {
  background: #dbeafe;
  color: #2563eb;
}

.gen-step-name {
  font-size: 12px;
  color: #94a3b8;
}

.gen-step.done .gen-step-name,
.gen-step.active .gen-step-name {
  color: #475569;
}

.pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.download-wrap {
  margin-top: 30px;
}
</style>
