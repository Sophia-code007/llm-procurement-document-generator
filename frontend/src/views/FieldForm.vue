<template>
  <div class="field-form-page">
    <div class="page-header">
      <div>
        <h2 class="page-title" style="margin-bottom: 4px">表单填写</h2>
        <p class="page-desc">
          当前模板：<el-tag type="primary">{{ store.currentTemplateName }}</el-tag>
          按分组逐项填写信息，系统将自动保存草稿
        </p>
      </div>
      <div class="progress-box">
        <div class="progress-label">填写进度</div>
        <el-progress :percentage="store.fillProgress" :stroke-width="8" />
      </div>
    </div>
    
    <DynamicForm
      v-model="formData"
      :groups="groups"
      @change="onFormChange"
    />
    
    <div class="action-bar">
      <el-button @click="$router.push('/input-method')">返回选择方式</el-button>
      <div class="action-bar-right">
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="generate">
          生成招标书
          <el-icon><DocumentAdd /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTenderStore } from '@/stores/tender'
import DynamicForm from '@/components/DynamicForm.vue'

const router = useRouter()
const store = useTenderStore()

const formData = ref({ ...store.formData })

const groups = computed(() => {
  return store.currentTemplateConfig?.groups || []
})

onMounted(() => {
  if (!store.currentTemplate) {
    router.push('/template-select')
  }
})

function onFormChange() {
  store.setFormData(formData.value)
}

function saveDraft() {
  store.saveDraft()
  ElMessage.success('草稿已保存')
}

function generate() {
  const result = store.validateForm()
  if (!result.valid) {
    ElMessage.warning(`请完善必填项：${result.errors.slice(0, 3).join('、')}${result.errors.length > 3 ? '等' : ''}`)
    return
  }
  router.push('/generating')
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-title {
  margin-bottom: 4px;
}

.page-desc {
  color: #64748b;
  font-size: 14px;
}

.progress-box {
  width: 200px;
  background: #fff;
  padding: 16px;
  border-radius: 10px;
}

.progress-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 20px;
}

.action-bar-right {
  display: flex;
  gap: 12px;
}
</style>
