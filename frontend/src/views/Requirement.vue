<template>
  <div class="app-container">
    <header class="header">
      <div class="header-logo">
        <div class="logo-icon">采</div>
        <div class="logo-text">采购文件智能生成系统</div>
      </div>
      <div class="header-search">
        <input type="text" placeholder="搜索文件、模板、法规...">
      </div>
      <div class="header-right">
        <div class="header-bell" @click="toggleMsgPanel">
          🔔<span class="badge">{{ unreadCount }}</span>
          <div v-if="showMsgPanel" class="msg-panel" @click.stop>
            <div class="msg-panel-header">
              <span class="msg-title">消息通知</span>
              <span class="msg-mark-read" @click="markAllRead">全部已读</span>
            </div>
            <div class="msg-list">
              <div v-for="msg in messages" :key="msg.id" class="msg-item" :class="{ unread: !msg.read }" @click="readMsg(msg)">
                <div class="msg-dot" v-if="!msg.read"></div>
                <div class="msg-content">
                  <div class="msg-text">{{ msg.title }}</div>
                  <div class="msg-time">{{ msg.time }}</div>
                </div>
              </div>
              <div v-if="messages.length === 0" class="msg-empty">暂无消息</div>
            </div>
            <div class="msg-panel-footer" @click="goToAllMessages">查看全部消息</div>
          </div>
        </div>
        <div class="header-user" @click="toggleUserMenu">
          <div class="avatar">
            <img v-if="userAvatarBase64" :src="userAvatarBase64" class="avatar-img" />
            <span v-else>{{ userInitial }}</span>
          </div>
          <span class="name">{{ user?.userName || '用户' }}</span>
          <span class="arrow">▼</span>
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-dropdown-item" @click.stop="goToProfile">个人主页</div>
            <div class="user-dropdown-item" @click.stop="handleLogout">退出登录</div>
          </div>
        </div>
      </div>
    </header>

    <nav class="sidebar">
      <div class="nav-group">
        <div class="nav-group-title">功能导航</div>
        <div class="nav-item" :class="{ active: currentPage === 'dashboard' }" @click="switchPage('dashboard')">
          <span class="icon">📊</span><span class="label">工作台</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'requirement' }" @click="switchPage('requirement')">
          <span class="icon">📝</span><span class="label">需求录入</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'history' }" @click="switchPage('history')">
          <span class="icon">📁</span><span class="label">历史文件</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'version' }" @click="switchPage('version')">
          <span class="icon">🔄</span><span class="label">版本管理</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'analytics' }" @click="switchPage('analytics')">
          <span class="icon">📈</span><span class="label">数据统计</span>
        </div>
        <div class="nav-item" :class="{ active: currentPage === 'ai-chat' }" @click="switchPage('ai-chat')">
          <span class="icon">🤖</span><span class="label">智能问答</span>
        </div>
      </div>
    </nav>

    <div class="main">
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">需求录入</a></div>
      <div class="page-header">
        <div><div class="page-title">录入需求</div><div class="page-desc">根据所选模板填写采购需求信息</div></div>
      </div>

      <div v-if="pageError" class="alert alert-error">{{ pageError }}</div>
      <div v-if="pageSuccess" class="alert alert-success">{{ pageSuccess }}</div>

      <div class="tpl-progress-bar">
        <div class="tpl-progress-step" :class="{ done: selectedTemplate, current: !selectedTemplate }">
          <span v-if="selectedTemplate" class="check-icon">✓</span> 选择模板
        </div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step" :class="{ current: selectedTemplate }">
          录入需求<span v-if="selectedTemplate">（当前）</span>
        </div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step">字段确认</div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step">生成文件</div>
      </div>

      <!-- 模板选择区域（未选择模板时显示） -->
      <div v-if="!selectedTemplate" class="card">
        <div class="card-title">选择采购类型与模板</div>
        <div class="category-grid">
          <div
            class="category-card"
            :class="{ selected: selectedCategory === 'goods', 'cat-goods': true }"
            @click="selectCategory('goods')"
          >
            <div class="cat-icon">📦</div>
            <div class="cat-name">货物类</div>
            <div class="cat-desc">适用于办公设备、IT产品、原材料等货物采购</div>
            <div class="cat-tags">
              <span class="tag tag-info">办公设备</span>
              <span class="tag tag-info">IT产品</span>
              <span class="tag tag-info">原材料</span>
            </div>
          </div>
          <div
            class="category-card"
            :class="{ selected: selectedCategory === 'engineering', 'cat-engineering': true }"
            @click="selectCategory('engineering')"
          >
            <div class="cat-icon">🏗️</div>
            <div class="cat-name">工程类</div>
            <div class="cat-desc">适用于建筑施工、基础设施建设等工程采购</div>
            <div class="cat-tags">
              <span class="tag tag-warning">建筑施工</span>
              <span class="tag tag-warning">基础设施</span>
              <span class="tag tag-warning">装修改造</span>
            </div>
          </div>
          <div
            class="category-card"
            :class="{ selected: selectedCategory === 'services', 'cat-services': true }"
            @click="selectCategory('services')"
          >
            <div class="cat-icon">💼</div>
            <div class="cat-name">服务类</div>
            <div class="cat-desc">适用于物业管理、咨询服务、技术服务等采购</div>
            <div class="cat-tags">
              <span class="tag tag-success">物业管理</span>
              <span class="tag tag-success">咨询服务</span>
              <span class="tag tag-success">技术服务</span>
            </div>
          </div>
        </div>

        <div v-if="selectedCategory && subTemplates.length" style="margin-top:20px;">
          <div style="font-size:14px;font-weight:600;color:#1D2129;margin-bottom:12px;">选择模板</div>
          <div class="sub-template-grid">
            <div
              class="sub-tpl-card"
              :class="{ selected: selectedTemplate?._id === tpl._id }"
              @click="selectTemplate(tpl)"
              v-for="tpl in subTemplates"
              :key="tpl._id"
            >
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span class="sub-tpl-type" :class="tpl.type">{{ tpl.type === 'bid' ? '招标' : '合同' }}</span>
                <span class="sub-tpl-name">{{ tpl.name }}</span>
              </div>
              <div class="sub-tpl-desc">{{ tpl.description }}</div>
              <div class="sub-tpl-chapters">
                <b>包含章节：</b>{{ (tpl.sections || []).join('、') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已选模板信息 + 供应商推荐 -->
      <template v-if="selectedTemplate">
      <div class="req-info-bar">
        <div class="ri-left">
          <span class="ri-icon">📋</span>
          <span>当前模板：</span>
          <span class="ri-template-name">{{ selectedTemplate?.name }}</span>
          <span class="ri-category">{{ getCategoryName(selectedTemplate.category) }}</span>
        </div>
        <button class="btn btn-default btn-sm" @click="resetTemplate">更换模板</button>
      </div>

      <div class="card supplier-card">
        <div class="card-title">🎯 推荐供应商</div>
        <div v-if="recommendedSuppliers.length === 0" class="empty-state" style="padding:20px;">
          <div class="es-text" style="font-size:13px;">暂无匹配的供应商推荐</div>
        </div>
        <div v-else class="supplier-list">
          <div v-for="sup in recommendedSuppliers" :key="sup._id" class="supplier-item">
            <div class="supplier-main">
              <div class="supplier-name">{{ sup.name }}</div>
              <div class="supplier-tags">
                <span class="tag tag-info">{{ sup.category }}</span>
                <span class="tag tag-gray">评分: {{ sup.rating || '4.5' }}</span>
              </div>
            </div>
            <div class="supplier-contact">
              <div>联系人：{{ sup.contactPerson || '—' }}</div>
              <div>电话：{{ sup.contactPhone || '—' }}</div>
            </div>
            <button class="btn btn-primary btn-sm" @click="selectSupplier(sup)">选用</button>
          </div>
        </div>
      </div>
        <!-- 录入方式切换 -->
        <div class="card">
          <div class="input-mode-tabs">
            <div 
              class="mode-tab" 
              :class="{ active: inputMode === 'form' }"
              @click="inputMode = 'form'"
            >
              <span class="mode-icon">📝</span>
              <span>表单录入</span>
            </div>
            <div 
              class="mode-tab" 
              :class="{ active: inputMode === 'nlp' }"
              @click="inputMode = 'nlp'"
            >
              <span class="mode-icon">✨</span>
              <span>自然语言录入（AI解析）</span>
            </div>
          </div>
        </div>

        <!-- 自然语言录入 -->
        <div v-if="inputMode === 'nlp'" class="card">
          <div class="card-title">🤖 AI智能需求解析</div>
          <div class="nlp-desc">用自然语言描述您的采购需求，AI将自动提取关键信息并生成结构化数据</div>
          <textarea 
            class="nlp-textarea" 
            v-model="nlpText"
            placeholder="例如：我需要采购一批办公电脑，预算约50万元，要求供应商具有IT设备销售资质，交货地点在北京市海淀区，付款方式为验收合格后一次性付清，质保期3年..."
          ></textarea>
          <div class="nlp-actions">
            <button class="btn btn-default" @click="nlpText = ''">清空</button>
            <button class="btn btn-primary" :disabled="aiLoading || !nlpText.trim()" @click="handleAIParse">
              <span v-if="aiLoading">🤖 AI解析中...</span>
              <span v-else>✨ AI智能解析</span>
            </button>
          </div>

          <!-- AI解析结果预览 -->
          <div v-if="aiParsedData" class="ai-result-panel">
            <div class="ai-result-title">📋 AI解析结果</div>
            <div class="ai-result-grid">
              <div class="ai-result-item" v-for="(value, key) in aiParsedData" :key="key" v-if="key !== 'category'">
                <span class="ai-result-key">{{ getFieldLabel(key) }}</span>
                <span class="ai-result-value">{{ value || '—' }}</span>
              </div>
            </div>
            <div class="ai-result-actions">
              <button class="btn btn-default" @click="aiParsedData = null">取消</button>
              <button class="btn btn-primary" @click="applyAIData">应用到表单</button>
            </div>
          </div>
        </div>

        <!-- 表单录入 -->
        <div v-show="inputMode === 'form' || aiApplied" class="req-form-container">
          <div class="req-form-scroll">
            <div class="req-section open">
              <div class="req-section-header">
                <div class="rsh-left">
                  <span class="rsh-icon">📋</span>
                  <span class="rsh-title">基本信息</span>
                </div>
              </div>
              <div class="req-section-body">
                <div class="req-field-row">
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 项目名称</div>
                    <input class="form-input" v-model="form.projectName" placeholder="请输入项目名称">
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 采购内容</div>
                    <input class="form-input" v-model="form.procurementContent" placeholder="请输入采购物品或内容">
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 采购预算</div>
                    <input class="form-input" v-model="form.budget" placeholder="如：50万元">
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 交货/完成日期</div>
                    <input class="form-input" type="date" v-model="form.deliveryDate">
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 联系人</div>
                    <input class="form-input" v-model="form.contactPerson" placeholder="请输入联系人姓名">
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 联系电话</div>
                    <input class="form-input" v-model="form.contactPhone" placeholder="请输入联系电话">
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 交货地点</div>
                    <input class="form-input" v-model="form.deliveryLocation" placeholder="请输入交货地点">
                  </div>
                </div>
              </div>
            </div>

            <div class="req-section open">
              <div class="req-section-header">
                <div class="rsh-left">
                  <span class="rsh-icon">📊</span>
                  <span class="rsh-title">商务条款</span>
                </div>
              </div>
              <div class="req-section-body">
                <div class="req-field-row">
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 付款方式</div>
                    <select class="form-select" v-model="form.paymentTerms">
                      <option value="">请选择</option>
                      <option>一次性付清</option>
                      <option>分期付款</option>
                      <option>预付款+尾款</option>
                      <option>月结</option>
                    </select>
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 质保期</div>
                    <input class="form-input" v-model="form.warrantyPeriod" placeholder="如：3年">
                  </div>
                  <div class="req-field">
                    <div class="req-label"><span class="required-star">*</span> 评标方法</div>
                    <select class="form-select" v-model="form.evaluationMethod">
                      <option value="">请选择</option>
                      <option>最低评标价法</option>
                      <option>综合评分法</option>
                      <option>性价比法</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="req-section open">
              <div class="req-section-header">
                <div class="rsh-left">
                  <span class="rsh-icon">🔧</span>
                  <span class="rsh-title">技术要求与资质</span>
                </div>
              </div>
              <div class="req-section-body">
                <div class="req-field" style="grid-column: 1 / -1;">
                  <div class="req-label">技术要求</div>
                  <textarea class="form-textarea" v-model="form.technicalRequirements" placeholder="请描述技术参数、规格要求等"></textarea>
                </div>
                <div class="req-field" style="grid-column: 1 / -1;">
                  <div class="req-label">资质要求</div>
                  <textarea class="form-textarea" v-model="form.qualificationRequirements" placeholder="请描述对供应商的资质要求"></textarea>
                </div>
                <div class="req-field" style="grid-column: 1 / -1;">
                  <div class="req-label">备注说明</div>
                  <textarea class="form-textarea" v-model="form.note" placeholder="其他补充说明"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="req-form-actions">
            <button class="btn btn-default" @click="saveDraft">保存草稿</button>
            <button class="btn btn-primary" @click="submitRequirement">提交需求</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createRequirement } from '../api/requirements'
import { parseRequirement } from '../api/ai'
import { getTemplates } from '../api/templates'
import { getSuppliersByCategory } from '../api/suppliers'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const selectedTemplate = ref(null)
const selectedCategory = ref('')
const form = ref({})
const currentPage = ref('requirement')
const templates = ref({ goods: [], engineering: [], services: [] })
const recommendedSuppliers = ref([])
const selectedSupplier = ref(null)
const pageError = ref('')
const pageSuccess = ref('')

// 录入方式
const inputMode = ref('form')
const nlpText = ref('')
const aiLoading = ref(false)
const aiParsedData = ref(null)
const aiConfidence = ref(0)
const aiApplied = ref(false)

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const subTemplates = computed(() => {
  if (!selectedCategory.value) return []
  return (templates.value[selectedCategory.value] || []).filter(t => t.type === 'bid')
})

const switchPage = (page) => {
  currentPage.value = page
  router.push(`/${page}`)
}

const showMsgPanel = ref(false)
const messages = ref([])

const unreadCount = computed(() => messages.value.filter(m => !m.read).length)

const toggleMsgPanel = () => {
  showMsgPanel.value = !showMsgPanel.value
}

const readMsg = (msg) => {
  msg.read = true
}

const markAllRead = () => {
  messages.value.forEach(m => m.read = true)
}

const goToAllMessages = () => {
  showMsgPanel.value = false
  router.push('/history')
}

const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const handleLogout = () => {
  showUserMenu.value = false
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }
}

const selectCategory = (category) => {
  selectedCategory.value = category
  const list = templates.value[category] || []
  const defaultTpl = list.find(t => t.type === 'bid') || list[0]
  selectedTemplate.value = defaultTpl || null
  if (selectedTemplate.value) {
    localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate.value))
    localStorage.setItem('selectedCategory', category)
  }
  loadSuppliers(category)
}

const selectTemplate = (tpl) => {
  selectedTemplate.value = tpl
  localStorage.setItem('selectedTemplate', JSON.stringify(tpl))
}

const resetTemplate = () => {
  selectedTemplate.value = null
  selectedCategory.value = ''
  selectedSupplier.value = null
  recommendedSuppliers.value = []
  localStorage.removeItem('selectedTemplate')
  localStorage.removeItem('selectedCategory')
}

const loadSuppliers = async (category) => {
  try {
    const res = await getSuppliersByCategory(category)
    recommendedSuppliers.value = res || []
  } catch (error) {
    console.error('加载供应商失败:', error)
    recommendedSuppliers.value = []
  }
}

const selectSupplier = (sup) => {
  selectedSupplier.value = sup
  form.value.supplierName = sup.name
  form.value.supplierContact = sup.contactPerson
  form.value.supplierPhone = sup.contactPhone
  pageSuccess.value = `已选用供应商：${sup.name}`
  setTimeout(() => { pageSuccess.value = '' }, 3000)
}

const getCategoryName = (category) => {
  const names = { goods: '货物类', engineering: '工程类', services: '服务类' }
  return names[category] || category
}

const getFieldLabel = (key) => {
  const labels = {
    projectName: '项目名称',
    procurementContent: '采购内容',
    budget: '采购预算',
    deliveryDate: '交货日期',
    contactPerson: '联系人',
    contactPhone: '联系电话',
    deliveryLocation: '交货地点',
    paymentTerms: '付款方式',
    warrantyPeriod: '质保期',
    technicalRequirements: '技术要求',
    qualificationRequirements: '资质要求',
    evaluationMethod: '评标方法',
    note: '备注',
    category: '采购类型'
  }
  return labels[key] || key
}

const handleAIParse = async () => {
  if (!nlpText.value.trim()) {
    pageError.value = '请输入需求描述'
    setTimeout(() => { pageError.value = '' }, 3000)
    return
  }
  aiLoading.value = true
  try {
    const res = await parseRequirement(nlpText.value, selectedCategory.value)
    if (res && res.data) {
      aiParsedData.value = res.data
      aiConfidence.value = Math.round((res.confidence || 0.9) * 100)
    } else if (res) {
      aiParsedData.value = res
      aiConfidence.value = 90
    }
  } catch (error) {
    console.error('AI Parse error:', error)
    pageError.value = 'AI解析失败：' + (error.response?.data?.message || error.message || '未知错误')
    setTimeout(() => { pageError.value = '' }, 5000)
  } finally {
    aiLoading.value = false
  }
}

const applyAIData = () => {
  if (!aiParsedData.value) return
  Object.keys(aiParsedData.value).forEach(key => {
    if (key !== 'category') {
      form.value[key] = aiParsedData.value[key]
    }
  })
  aiApplied.value = true
  inputMode.value = 'form'
  aiParsedData.value = null
  pageSuccess.value = 'AI解析结果已应用到表单，请检查并补充完善'
  setTimeout(() => { pageSuccess.value = '' }, 3000)
}

const submitRequirement = async () => {
  if (!selectedTemplate.value) {
    pageError.value = '请先选择模板'
    setTimeout(() => { pageError.value = '' }, 3000)
    return
  }

  const requiredFields = ['projectName', 'procurementContent', 'budget', 'deliveryDate', 'contactPerson', 'contactPhone', 'deliveryLocation', 'paymentTerms', 'warrantyPeriod', 'evaluationMethod']
  const missing = requiredFields.filter(f => !form.value[f])

  if (missing.length > 0) {
    pageError.value = `请填写以下必填项：${missing.map(f => getFieldLabel(f)).join('、')}`
    setTimeout(() => { pageError.value = '' }, 5000)
    return
  }

  try {
    const res = await createRequirement({
      ...form.value,
      templateId: selectedTemplate.value._id,
      templateName: selectedTemplate.value.name,
      category: selectedCategory.value
    })
    localStorage.setItem('requirementData', JSON.stringify(form.value))
    localStorage.setItem('requirementId', res._id)
    localStorage.removeItem('requirementFormData')
    router.push('/field-confirm')
  } catch (error) {
    pageError.value = '提交失败：' + (error.response?.data?.message || '未知错误')
    setTimeout(() => { pageError.value = '' }, 5000)
  }
}

const saveDraft = () => {
  localStorage.setItem('requirementFormData', JSON.stringify(form.value))
  pageSuccess.value = '草稿已保存'
  setTimeout(() => { pageSuccess.value = '' }, 3000)
}

watch(form, (val) => {
  localStorage.setItem('requirementFormData', JSON.stringify(val))
}, { deep: true })

onMounted(async () => {
  try {
    const allTemplates = await getTemplates()
    templates.value = {
      goods: allTemplates.filter(t => t.category === 'goods'),
      engineering: allTemplates.filter(t => t.category === 'engineering'),
      services: allTemplates.filter(t => t.category === 'services')
    }
  } catch (error) {
    console.error('获取模板失败:', error)
  }

  const saved = localStorage.getItem('selectedTemplate')
  const cat = localStorage.getItem('selectedCategory')
  if (saved) {
    selectedTemplate.value = JSON.parse(saved)
  }
  if (cat) {
    selectedCategory.value = cat
    loadSuppliers(cat)
  }

  const savedForm = localStorage.getItem('requirementFormData')
  if (savedForm) {
    try {
      const parsed = JSON.parse(savedForm)
      Object.assign(form.value, parsed)
    } catch (e) {
      console.error('恢复表单数据失败', e)
    }
  }
})
</script>

<style scoped>
.app-container { min-height: 100vh; background: #F2F3F5; }

.header {
  position: fixed; top: 0; left: 0; right: 0; height: 56px;
  background: #fff; border-bottom: 1px solid #E5E6EB;
  display: flex; align-items: center; padding: 0 20px;
  z-index: 1000; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.header-logo { display: flex; align-items: center; gap: 10px; width: 220px; flex-shrink: 0; }
.header-logo .logo-icon { width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #165DFF, #4080FF); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
.header-logo .logo-text { font-size: 15px; font-weight: 600; color: #1D2129; white-space: nowrap; }

.header-search { position: relative; }
.header-search input { width: 200px; height: 32px; border: 1px solid #E5E6EB; border-radius: 4px; padding: 0 12px 0 32px; font-size: 13px; outline: none; transition: border-color .2s; }
.header-search input:focus { border-color: #165DFF; }
.header-search::before { content: "🔍"; position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; }

.header-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
.header-bell { position: relative; cursor: pointer; font-size: 18px; }
.header-bell .badge { position: absolute; top: -4px; right: -6px; background: #F53F3F; color: #fff; font-size: 10px; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; transition: background .2s; }
.header-user { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 8px; border-radius: 4px; position: relative; }
.header-user:hover { background: #F2F3F5; }
.header-user .avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #165DFF, #722ED1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.header-user .name { font-size: 13px; color: #1D2129; }
.header-user .arrow { color: #C9CDD4; font-size: 10px; }
.user-dropdown { position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #E5E6EB; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 140px; padding: 6px 0; z-index: 1100; margin-top: 4px; }
.user-dropdown-item { padding: 8px 16px; font-size: 13px; color: #4E5969; cursor: pointer; transition: background .15s; }
.user-dropdown-item:hover { background: #F2F3F5; color: #165DFF; }

.sidebar {
  position: fixed; top: 56px; left: 0; bottom: 0; width: 220px;
  background: #fff; border-right: 1px solid #E5E6EB;
  overflow-y: auto; z-index: 900; padding-bottom: 20px;
}

.nav-group { margin-bottom: 4px; }
.nav-group-title { padding: 16px 20px 6px; font-size: 11px; color: #86909C; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 20px; cursor: pointer; transition: all .15s; color: #4E5969; font-size: 13px; border-left: 3px solid transparent; margin: 1px 0; }
.nav-item:hover { background: #F2F3F5; color: #1D2129; }
.nav-item.active { background: #E8F3FF; color: #165DFF; border-left-color: #165DFF; font-weight: 500; }
.nav-item .icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
.nav-divider { height: 1px; background: #E5E6EB; margin: 8px 20px; }

.main { margin-left: 220px; margin-top: 56px; padding: 20px; min-height: calc(100vh - 56px); }

.breadcrumb { margin-bottom: 16px; font-size: 13px; color: #86909C; }
.breadcrumb a { color: #4E5969; text-decoration: none; }
.breadcrumb a:hover { color: #165DFF; }
.breadcrumb span { margin: 0 6px; color: #C9CDD4; }

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1D2129; }
.page-desc { font-size: 13px; color: #86909C; margin-top: 2px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid transparent; transition: all .15s; white-space: nowrap; }
.btn-primary { background: #165DFF; color: #fff; border-color: #165DFF; }
.btn-primary:hover { background: #4080FF; }
.btn-primary:disabled { background: #94b4ff; cursor: not-allowed; }
.btn-default { background: #fff; color: #4E5969; border-color: #E5E6EB; }
.btn-default:hover { border-color: #165DFF; color: #165DFF; }
.btn-sm { padding: 3px 10px; font-size: 12px; }

.tpl-progress-bar { display: flex; align-items: center; gap: 0; margin-bottom: 24px; background: #F7F8FA; border-radius: 8px; padding: 12px 20px; }
.tpl-progress-step { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #86909C; white-space: nowrap; }
.tpl-progress-step.done { color: #00B42A; }
.tpl-progress-step.current { color: #165DFF; font-weight: 600; }
.tpl-progress-arrow { color: #C9CDD4; margin: 0 12px; font-size: 14px; }
.check-icon { color: #00B42A; font-weight: 700; }

.req-info-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px 16px; background: #E8F3FF; border-radius: 8px; border: 1px solid #B5D0FF; }
.req-info-bar .ri-left { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #1D2129; }
.req-info-bar .ri-left .ri-icon { font-size: 18px; }
.req-info-bar .ri-template-name { font-weight: 600; color: #165DFF; }
.req-info-bar .ri-category { color: #86909C; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }

.empty-state { text-align: center; padding: 48px 20px; color: #86909C; }
.empty-state .es-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state .es-text { font-size: 14px; margin-bottom: 16px; }

/* 录入方式切换 */
.input-mode-tabs { display: flex; gap: 0; border-radius: 8px; overflow: hidden; border: 1px solid #E5E6EB; }
.mode-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; cursor: pointer; font-size: 14px; color: #4E5969; background: #FAFBFC; transition: all .2s; }
.mode-tab:hover { background: #F2F3F5; }
.mode-tab.active { background: #165DFF; color: #fff; font-weight: 500; }
.mode-tab .mode-icon { font-size: 18px; }

/* 自然语言录入 */
.nlp-desc { font-size: 13px; color: #86909C; margin-bottom: 12px; }
.nlp-textarea { width: 100%; min-height: 140px; border: 1px solid #E5E6EB; border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.6; resize: vertical; outline: none; transition: border-color .2s; box-sizing: border-box; }
.nlp-textarea:focus { border-color: #165DFF; box-shadow: 0 0 0 2px rgba(22,93,255,0.1); }
.nlp-textarea::placeholder { color: #C9CDD4; }
.nlp-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }

/* AI解析结果 */
.ai-result-panel { margin-top: 20px; padding: 16px; background: #F5F9FF; border-radius: 8px; border: 1px solid #B5D0FF; }
.ai-result-title { font-size: 14px; font-weight: 600; color: #165DFF; margin-bottom: 12px; }
.ai-result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
.ai-result-item { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; background: #fff; border-radius: 6px; }
.ai-result-key { font-size: 12px; color: #86909C; }
.ai-result-value { font-size: 13px; color: #1D2129; font-weight: 500; }
.ai-result-actions { display: flex; justify-content: flex-end; gap: 10px; }

/* 表单 */
.req-form-container { background: #fff; border-radius: 10px; border: 1px solid #E5E6EB; overflow: hidden; }
.req-form-scroll { max-height: calc(100vh - 360px); overflow-y: auto; padding: 0; }
.req-form-scroll::-webkit-scrollbar { width: 6px; }
.req-form-scroll::-webkit-scrollbar-thumb { background: #C9CDD4; border-radius: 3px; }

.req-section { border-bottom: 1px solid #E5E6EB; }
.req-section:last-child { border-bottom: none; }
.req-section-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; cursor: pointer; transition: background .15s; }
.req-section-header:hover { background: #F7F8FA; }
.req-section.open .req-section-header { border-bottom: 1px solid #E5E6EB; }
.req-section-header .rsh-left { display: flex; align-items: center; gap: 10px; }
.req-section-header .rsh-icon { font-size: 16px; }
.req-section-header .rsh-title { font-size: 14px; font-weight: 600; color: #1D2129; }
.req-section-body { padding: 16px 20px 20px; }

.req-field-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.req-field { margin-bottom: 14px; }
.req-field:last-child { margin-bottom: 0; }
.req-field .req-label { font-size: 12px; color: #4E5969; margin-bottom: 5px; font-weight: 500; display: flex; align-items: center; gap: 4px; }
.req-field .req-label .required-star { color: #F53F3F; font-weight: 700; }
.req-field .req-label .optional-tag { font-size: 11px; color: #86909C; background: #F2F3F5; padding: 1px 6px; border-radius: 3px; }

.form-input, .form-select, .form-textarea {
  width: 100%; height: 36px; border: 1px solid #E5E6EB; border-radius: 4px;
  padding: 0 12px; font-size: 13px; color: #1D2129; outline: none;
  transition: border-color .2s; background: #fff; box-sizing: border-box;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: #165DFF; box-shadow: 0 0 0 2px rgba(22,93,255,0.1);
}
.form-textarea { height: auto; padding: 10px 12px; resize: vertical; min-height: 80px; }
.form-select { appearance: auto; }

.req-form-actions { padding: 20px; border-top: 1px solid #E5E6EB; display: flex; justify-content: flex-end; gap: 10px; background: #FAFBFC; }
.msg-panel { position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #E5E6EB; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); width: 320px; max-height: 400px; overflow: hidden; z-index: 1100; margin-top: 8px; display: flex; flex-direction: column; }
.msg-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #E5E6EB; }
.msg-title { font-size: 14px; font-weight: 600; color: #1D2129; }
.msg-mark-read { font-size: 12px; color: #165DFF; cursor: pointer; }
.msg-mark-read:hover { color: #4080FF; }
.msg-list { overflow-y: auto; max-height: 300px; padding: 4px 0; }
.msg-item { display: flex; align-items: flex-start; gap: 8px; padding: 10px 16px; cursor: pointer; transition: background .15s; }
.msg-item:hover { background: #F2F3F5; }
.msg-item.unread { background: #F5F9FF; }
.msg-dot { width: 6px; height: 6px; border-radius: 50%; background: #165DFF; margin-top: 6px; flex-shrink: 0; }
.msg-content { flex: 1; min-width: 0; }
.msg-text { font-size: 13px; color: #1D2129; line-height: 1.5; word-break: break-all; }
.msg-time { font-size: 11px; color: #86909C; margin-top: 2px; }
.msg-empty { padding: 24px 16px; text-align: center; font-size: 13px; color: #86909C; }
.msg-panel-footer { padding: 10px 16px; text-align: center; font-size: 12px; color: #165DFF; border-top: 1px solid #E5E6EB; cursor: pointer; }
.msg-panel-footer:hover { background: #F2F3F5; }

.alert { padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
.alert-error { background: #FFF2F0; color: #F53F3F; border: 1px solid #FFCCC7; }
.alert-success { background: #F5FFF8; color: #00B42A; border: 1px solid #AFF0B5; }

/* 模板选择 */
.category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.category-card { background: #fff; border-radius: 12px; border: 1px solid #E5E6EB; padding: 28px 24px; cursor: pointer; transition: all .25s; position: relative; overflow: hidden; }
.category-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.category-card.selected { border-width: 2px; }
.category-card.selected.cat-goods { border-color: #165DFF; background: #F5F9FF; }
.category-card.selected.cat-engineering { border-color: #FF7D00; background: #FFFBF5; }
.category-card.selected.cat-services { border-color: #00B42A; background: #F5FFF8; }
.category-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; }
.cat-goods::before { background: #165DFF; }
.cat-engineering::before { background: #FF7D00; }
.cat-services::before { background: #00B42A; }
.cat-icon { font-size: 40px; margin-bottom: 14px; display: block; }
.cat-name { font-size: 18px; font-weight: 700; color: #1D2129; margin-bottom: 8px; }
.cat-desc { font-size: 12px; color: #86909C; line-height: 1.6; margin-bottom: 14px; }
.cat-tags { display: flex; gap: 6px; flex-wrap: wrap; }

.sub-template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.sub-tpl-card { background: #fff; border-radius: 10px; border: 1px solid #E5E6EB; padding: 20px; cursor: pointer; transition: all .2s; }
.sub-tpl-card:hover { border-color: #165DFF; box-shadow: 0 4px 16px rgba(22,93,255,0.1); }
.sub-tpl-card.selected { border-color: #165DFF; background: #F0F7FF; }
.sub-tpl-type { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.sub-tpl-type.bid { background: #E8F3FF; color: #165DFF; }
.sub-tpl-type.contract { background: #E8FFEA; color: #00B42A; }
.sub-tpl-name { font-size: 15px; font-weight: 600; color: #1D2129; }
.sub-tpl-desc { font-size: 12px; color: #86909C; margin-bottom: 10px; }
.sub-tpl-chapters { font-size: 11px; color: #86909C; line-height: 1.6; padding: 8px 12px; background: #F7F8FA; border-radius: 6px; }
.sub-tpl-chapters b { color: #4E5969; }

/* 供应商推荐 */
.supplier-list { display: flex; flex-direction: column; gap: 10px; }
.supplier-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #F7F8FA; border-radius: 8px; }
.supplier-main { flex: 1; }
.supplier-name { font-size: 14px; font-weight: 600; color: #1D2129; margin-bottom: 4px; }
.supplier-tags { display: flex; gap: 6px; }
.supplier-contact { font-size: 12px; color: #86909C; margin: 0 20px; }
</style>
