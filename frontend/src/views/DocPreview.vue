<template>
  <div class="doc-preview-page">
    <div class="page-header">
      <div>
        <h2 class="page-title" style="margin-bottom: 4px">文件预览</h2>
        <p class="page-desc">
          {{ formData.projectName || '招标文件' }} · {{ store.currentTemplateName }}
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="$router.push('/field-form')">
          <el-icon><EditPen /></el-icon>
          返回修改
        </el-button>
        <el-button type="success" @click="download">
          <el-icon><Download /></el-icon>
          下载文件
        </el-button>
      </div>
    </div>
    
    <div class="preview-container">
      <div class="doc-paper">
        <div class="doc-title">
          <h1>{{ formData.projectName || '（项目名称）' }}</h1>
          <h2>招标文件</h2>
        </div>
        
        <div class="doc-section">
          <h3>第一章 招标公告</h3>
          <p>1. 招标条件</p>
          <p>本招标项目 {{ formData.projectName || '（项目名称）' }} 已由相关部门批准建设，项目业主为 {{ formData.tenderer || formData.purchaser || '（招标人）' }}，建设资金来自自筹，项目已具备招标条件，现对该项目进行公开招标。</p>
          
          <p>2. 项目概况与招标范围</p>
          <p v-if="formData.location">建设地点：{{ formData.location }}</p>
          <p v-if="formData.deliveryAddress">交货地点：{{ formData.deliveryAddress }}</p>
          <p v-if="formData.serviceLocation">服务地点：{{ formData.serviceLocation }}</p>
          <p v-if="formData.budget">项目预算：{{ formData.budget.toLocaleString ? formData.budget.toLocaleString() : formData.budget }} 元</p>
          <p v-if="formData.duration">工期：{{ formData.duration }} 日历天</p>
          <p v-if="formData.servicePeriod">服务期限：{{ formData.servicePeriod }}</p>
          <p v-if="formData.qualityStandard">质量标准：{{ formData.qualityStandard }}</p>
          <p v-if="formData.scope">招标范围：{{ formData.scope }}</p>
          <p v-if="formData.serviceScope">服务范围：{{ formData.serviceScope }}</p>
        </div>
        
        <div class="doc-section">
          <h3>第二章 投标人资格要求</h3>
          <p v-if="formData.qualification">资质要求：{{ formData.qualification }}</p>
          <p v-if="formData.pmRequirement">项目经理要求：{{ formData.pmRequirement }}</p>
          <p v-if="formData.performance">业绩要求：{{ formData.performance }}</p>
          <p v-if="formData.acceptUnion">联合体投标：{{ formData.acceptUnion }}联合体投标</p>
        </div>
        
        <div class="doc-section">
          <h3>第三章 评标办法</h3>
          <p v-if="formData.evalMethod">评标办法：{{ formData.evalMethod }}</p>
          <p v-if="formData.paymentMethod">付款方式：{{ formData.paymentMethod }}</p>
          <p v-if="formData.warrantyPeriod">质保期：{{ formData.warrantyPeriod }}</p>
        </div>
        
        <div class="doc-section">
          <h3>第四章 联系方式</h3>
          <p v-if="formData.contactPerson">联系人：{{ formData.contactPerson }}</p>
          <p v-if="formData.contactPhone">联系电话：{{ formData.contactPhone }}</p>
          <p v-if="formData.contactEmail">电子邮箱：{{ formData.contactEmail }}</p>
          <p v-if="formData.contactAddress">联系地址：{{ formData.contactAddress }}</p>
        </div>
      </div>
    </div>
    
    <div class="action-bar">
      <el-button @click="$router.push('/field-form')">返回修改</el-button>
      <div class="action-bar-right">
        <el-button @click="regenerate">重新生成</el-button>
        <el-button type="success" @click="download">
          <el-icon><Download /></el-icon>
          下载Word文档
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTenderStore } from '@/stores/tender'

const router = useRouter()
const store = useTenderStore()

const formData = computed(() => store.formData)

function download() {
  ElMessage.info('下载功能需要接入后端服务后启用')
}

function regenerate() {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.preview-container {
  background: #e2e8f0;
  padding: 24px;
  border-radius: 12px;
  max-height: 60vh;
  overflow-y: auto;
}

.doc-paper {
  background: #fff;
  max-width: 700px;
  margin: 0 auto;
  padding: 60px 70px;
  min-height: 800px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.doc-title {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #1e293b;
  padding-bottom: 20px;
}

.doc-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.doc-title h2 {
  font-size: 20px;
  font-weight: 500;
  color: #334155;
  letter-spacing: 8px;
}

.doc-section {
  margin-bottom: 24px;
}

.doc-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}

.doc-section p {
  font-size: 14px;
  line-height: 1.8;
  color: #334155;
  margin-bottom: 6px;
  text-indent: 2em;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.action-bar-right {
  display: flex;
  gap: 12px;
}
</style>
