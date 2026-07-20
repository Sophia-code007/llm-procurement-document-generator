<template>
  <div class="ai-input-page">
    <h2 class="page-title">自然语言录入</h2>
    <p class="page-desc">
      当前模板：<el-tag type="primary">{{ store.currentTemplateName }}</el-tag>
      用自然语言描述您的采购需求，AI将自动识别并提取关键字段
    </p>
    
    <el-card class="input-card">
      <template #header>
        <div class="card-header">
          <span>采购需求描述</span>
          <el-button type="primary" link size="small" @click="loadExample">
            <el-icon><Lightning /></el-icon>
            加载示例
          </el-button>
        </div>
      </template>
      
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="8"
        placeholder="请输入采购需求描述，例如：XX产业园办公楼建设项目，预算3000万元，工期365天..."
      />
      
      <div class="parse-btn-wrap">
        <el-button
          type="success"
          size="large"
          :loading="parsing"
          @click="doParse"
        >
          <el-icon><MagicStick /></el-icon>
          AI智能解析并填充
        </el-button>
      </div>
    </el-card>
    
    <!-- 解析结果预览 -->
    <el-card v-if="parsedFields && Object.keys(parsedFields).length > 0" class="result-card">
      <template #header>
        <div class="card-header">
          <span>解析结果预览</span>
          <el-tag type="success">已识别 {{ fieldCount }} 个字段</el-tag>
        </div>
      </template>
      
      <div class="parsed-tags">
        <el-tag
          v-for="(value, key) in parsedFields"
          :key="key"
          closable
          type="success"
          effect="light"
          style="margin: 4px"
          @close="removeField(key)"
        >
          {{ getFieldLabel(key) }}: {{ String(value).substring(0, 30) }}{{ String(value).length > 30 ? '...' : '' }}
        </el-tag>
      </div>
      
      <el-alert
        title="提示：AI解析为初步识别结果，建议跳转表单逐项确认完善"
        type="info"
        :closable="false"
        style="margin-top: 16px"
      />
    </el-card>
    
    <div class="action-bar">
      <el-button @click="$router.push('/input-method')">返回选择方式</el-button>
      <div class="action-bar-right">
        <el-button
          v-if="parsedFields && Object.keys(parsedFields).length > 0"
          @click="goToForm"
        >
          去表单补充完善
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button
          type="primary"
          :disabled="!parsedFields || Object.keys(parsedFields).length === 0"
          @click="generate"
        >
          直接生成招标书
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTenderStore } from '@/stores/tender'
import { templateFields, exampleTexts } from '@/config/templateFields'
import { countParsedFields } from '@/utils/aiParse'
// 接入后端真实AI解析接口
import { aiParse } from '@/api/tender'

const router = useRouter()
const store = useTenderStore()

const inputText = ref('')
const parsing = ref(false)
const parsedFields = ref({})

const fieldCount = computed(() => countParsedFields(parsedFields.value))

function loadExample() {
  if (store.currentTemplate && exampleTexts[store.currentTemplate]) {
    inputText.value = exampleTexts[store.currentTemplate]
  }
}

// 调用后端真实AI解析接口
async function doParse() {
  if (!inputText.value.trim()) {
    return ElMessage.warning('请先输入采购需求描述')
  }
  
  parsing.value = true
  try {
    const res = await aiParse(inputText.value, store.currentTemplate)
    parsedFields.value = res
    store.aiParsedData = res
    ElMessage.success(`已识别 ${fieldCount.value} 个字段`)
  } catch (err) {
    ElMessage.error('解析失败：' + (err || '服务异常'))
  } finally {
    parsing.value = false
  }
}

function getFieldLabel(key) {
  const config = store.currentTemplateConfig
  if (!config) return key
  for (const group of config.groups) {
    if (group.fields) {
      const field = group.fields.find(f => f.key === key)
      if (field) return field.label
    }
  }
  return key
}

function removeField(key) {
  delete parsedFields.value[key]
}

function goToForm() {
  store.setFormData(parsedFields.value)
  store.selectInputMethod('form')
  router.push('/field-form')
}

// 生成文档：保存数据到store，跳转到进度页
function generate() {
  store.setFormData(parsedFields.value)
  store.selectInputMethod('ai')
  router.push('/generating')
}
</script>

<style scoped>
.page-desc {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 20px;
}

.input-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.parse-btn-wrap {
  text-align: center;
  margin-top: 20px;
}

.result-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.parsed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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