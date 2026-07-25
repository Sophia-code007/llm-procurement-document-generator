<template>
<<<<<<< HEAD
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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">合同生成</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">合同生成</div>
          <div class="page-desc">基于需求信息和合同模板生成采购合同</div>
        </div>
      </div>

      <!-- 步骤0：选择合同来源 -->
      <div class="card">
        <div class="card-title">① 选择合同来源</div>
        <div class="source-tabs">
          <div class="source-tab" :class="{ active: contractSource === 'fromBid' }" @click="contractSource = 'fromBid'">
            <span class="source-icon">📋</span><span>从历史招标书提取</span>
          </div>
          <div class="source-tab" :class="{ active: contractSource === 'new' }" @click="contractSource = 'new'">
            <span class="source-icon">✨</span><span>直接新建合同</span>
          </div>
        </div>

        <!-- 历史招标书列表 -->
        <div v-if="contractSource === 'fromBid'" class="bid-history-list">
          <div class="bhl-header">选择要关联的招标书（自动带入项目信息）</div>
          <div v-if="bidDocuments.length === 0" class="bhl-empty">暂无招标书记录，请先创建招标书</div>
          <div v-else class="bhl-grid">
            <div
              v-for="doc in bidDocuments"
              :key="doc._id"
              class="bhl-card"
              :class="{ selected: selectedBidDocument?._id === doc._id }"
              @click="selectBidDocument(doc)"
            >
              <div class="bhl-title">{{ doc.name }}</div>
              <div class="bhl-meta">
                <span>📅 {{ formatDate(doc.createdAt) }}</span>
                <span>📁 {{ getCategoryName(doc.category) }}</span>
                <span class="status-tag" :class="doc.status">{{ doc.status === 'published' ? '已发布' : doc.status === 'draft' ? '草稿' : '待审核' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤1：选择合同模板 -->
      <div class="card">
        <div class="card-title">② 选择合同模板 <span style="font-weight:normal;color:#86909c;font-size:12px;">（先选择合同类型与模板）</span></div>
        <div class="category-grid">
          <div
            v-for="cat in contractCategories"
            :key="cat.code"
            class="category-card"
            :class="{ selected: selectedCategory === cat.code, ['cat-' + cat.code]: true }"
            @click="selectCategory(cat.code)"
          >
            <div class="cat-icon">{{ cat.icon }}</div>
            <div class="cat-name">{{ cat.name }}</div>
            <div class="cat-desc">{{ cat.desc }}</div>
            <div class="cat-tags">
              <span class="tag" :class="'tag-' + cat.tagClass">{{ cat.tag }}</span>
            </div>
            <div v-if="getContractTemplates(cat.code).length" class="cat-recommend">推荐</div>
          </div>
        </div>
        <div v-if="selectedCategory && getContractTemplates(selectedCategory).length" style="margin-top:20px;">
          <div style="font-size:13px;color:#4E5969;margin-bottom:10px;">已选类型下的合同模板：</div>
          <div class="sub-template-grid">
            <div
              v-for="tpl in getContractTemplates(selectedCategory)"
              :key="tpl._id || tpl.templateId"
              class="sub-tpl-card"
              :class="{ selected: selectedTemplate && (selectedTemplate._id === tpl._id || selectedTemplate.templateId === tpl.templateId) }"
              @click="selectTemplate(tpl)"
            >
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span class="sub-tpl-type contract">合同</span>
                <span class="sub-tpl-name">{{ tpl.name }}</span>
              </div>
              <div class="sub-tpl-desc">{{ tpl.description }}</div>
              <div class="sub-tpl-id">{{ tpl.templateId || tpl._id }}</div>
            </div>
          </div>
        </div>
        <div v-if="selectedTemplate" class="selected-tpl-info">
          <span class="sti-label">已选合同模板：</span>
          <span class="sti-value">{{ selectedTemplate.name }}</span>
          <span class="sti-meta">({{ getCategoryName(selectedCategory) }} · {{ selectedTemplate.templateId || selectedTemplate._id }})</span>
          <button class="btn btn-sm" @click="resetTemplate">重新选择</button>
        </div>
      </div>

      <!-- 步骤2：录入方式 -->
      <div v-if="selectedTemplate" class="card">
        <div class="card-title">③ 录入合同信息</div>
        <div class="card-title">② 录入合同信息</div>
        <div class="input-mode-tabs">
          <div class="mode-tab" :class="{ active: inputMode === 'form' }" @click="inputMode = 'form'">
            <span class="mode-icon">📝</span><span>表单录入（按字段对照表）</span>
          </div>
          <div class="mode-tab" :class="{ active: inputMode === 'nlp' }" @click="inputMode = 'nlp'">
            <span class="mode-icon">✨</span><span>自然语言录入（AI解析）</span>
          </div>
        </div>
      </div>

      <!-- 自然语言录入 -->
      <div v-if="selectedTemplate && inputMode === 'nlp'" class="card">
        <div class="card-title">🤖 AI智能合同需求解析</div>
        <div class="nlp-desc">用自然语言描述合同需求，AI将自动提取关键信息并填入字段对照表</div>
        <textarea class="nlp-textarea" v-model="nlpText" placeholder="例如：合同编号IHT-BW-2026-001，甲方为北京某科技有限公司，乙方为华信科技有限公司，项目名称为办公楼服务器采购，数量50台，单价8000元，合同总价40万元，签订日期2026年7月25日，签订地点成都市武侯区，交付日期2026年9月30日，付款方式为预付款30%加尾款70%，质保期3年，违约金为合同金额5%，仲裁委员会为成都仲裁委员会，售后服务2小时响应..."></textarea>
        <div class="nlp-actions">
          <button class="btn btn-default" @click="nlpText = ''">清空</button>
          <button class="btn btn-primary" :disabled="aiLoading || !nlpText.trim()" @click="handleAIParse">
            <span v-if="aiLoading">🤖 AI解析中...</span>
            <span v-else>✨ AI智能解析（{{ getCategoryName(selectedCategory) }}）</span>
          </button>
        </div>

        <div v-if="aiParsedData" class="ai-result-panel">
          <div class="ai-result-title">📋 AI解析结果（已识别 {{ aiFilledCount }} 个字段）</div>
          <div class="ai-result-grid">
            <div class="ai-result-item" v-for="(value, key) in aiParsedData" :key="key" v-if="value">
              <span class="ai-result-key">{{ getFieldLabel(key) }}</span>
              <span class="ai-result-value">{{ value }}</span>
            </div>
          </div>
          <div class="ai-result-actions">
            <button class="btn btn-default" @click="aiParsedData = null">取消</button>
            <button class="btn btn-primary" @click="applyAIData">应用到字段对照表</button>
          </div>
        </div>
      </div>

      <!-- 表单录入 - 按59字段对照表 -->
      <div v-if="selectedTemplate && (inputMode === 'form' || aiApplied)">
        <div class="card">
          <div class="card-title">④ 填写合同字段（共 {{ filteredFieldCount }} 项，<span style="color:#165DFF;">{{ getCategoryName(selectedCategory) }}</span>适用）</div>
          <div v-if="selectedBidDocument" class="import-notice">
            <span>📥</span>
            <span>已从招标书「{{ selectedBidDocument.name }}」导入项目信息，以下字段已自动填充，可直接修改</span>
          </div>
          <div v-for="group in filteredFieldGroups" :key="group.title" class="field-group">
            <div class="field-group-title">{{ group.title }}</div>
            <div class="field-grid">
              <div class="field-item" v-for="field in group.items" :key="field.key">
                <label class="fi-label">
                  {{ field.label }}
                  <span v-if="field.required" class="fi-required">*</span>
                  <span v-if="field.shared" class="fi-shared" title="与招标书字段共用">🔗</span>
                </label>
                <textarea
                  v-if="field.type === 'Text'"
                  class="fi-input fi-textarea"
                  v-model="contractData[field.key]"
                  :placeholder="field.sample"
                  rows="2"
                ></textarea>
                <select
                  v-else-if="field.type === 'Boolean'"
                  class="fi-input"
                  v-model="contractData[field.key]"
                >
                  <option value="">请选择</option>
                  <option value="是">是</option>
                  <option value="否">否</option>
                </select>
                <input
                  v-else
                  class="fi-input"
                  :type="field.type === 'Date' ? 'date' : (field.type === 'Number' || field.type === 'Integer' ? 'number' : 'text')"
                  v-model="contractData[field.key]"
                  :placeholder="field.sample"
                >
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-bottom:24px;">
          <button class="btn btn-default" @click="switchPage('bid-preview')">返回招标书</button>
          <button class="btn btn-primary" @click="generateContract">生成合同预览</button>
        </div>
      </div>
    </div>
=======
  <div class="placeholder-page">
    <el-card class="placeholder-card">
      <el-icon :size="64" color="#cbd5e1"><Stamp /></el-icon>
      <h2 class="placeholder-title">合同生成</h2>
      <p class="placeholder-desc">基于已生成的招标文件，自动生成配套合同文件</p>
      <el-tag type="info">功能开发中</el-tag>
    </el-card>
>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../api/axios'
import { parseContract } from '../api/ai'
import { getTemplates } from '../api/templates'
import { contractFields, flatContractFields } from '../utils/contractFields'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const currentPage = ref('contract-gen')

// 合同来源
const contractSource = ref('fromBid')
const bidDocuments = ref([])
const selectedBidDocument = ref(null)

// 模板相关
const templates = ref([])
const selectedCategory = ref('')
const selectedTemplate = ref(null)
const selectedCategoryName = ref('')

const contractCategories = [
  { code: 'goods', name: '货物类合同', icon: '📦', desc: '适用于各类货物采购项目', tag: '货物/设备/材料', tagClass: 'info' },
  { code: 'engineering', name: '工程类合同', icon: '🏗️', desc: '适用于各类工程建设项目', tag: '建筑/施工/装修', tagClass: 'warning' },
  { code: 'services', name: '服务类合同', icon: '💼', desc: '适用于各类服务采购项目', tag: '咨询/物业/IT', tagClass: 'success' }
]

// 录入方式
const inputMode = ref('form')
const nlpText = ref('')
const aiLoading = ref(false)
const aiParsedData = ref(null)
const aiApplied = ref(false)

// 合同数据 - 使用扁平化59字段
const contractData = ref({})
flatContractFields.forEach(f => {
  contractData.value[f.key] = ''
})

const getContractTemplates = (category) => {
  return (templates.value || []).filter(t => t.category === category && t.type === 'contract')
}

const getCategoryName = (cat) => {
  const m = { goods: '货物类', engineering: '工程类', services: '服务类' }
  return m[cat] || cat
}

const selectCategory = (category) => {
  selectedCategory.value = category
  selectedCategoryName.value = getCategoryName(category)
  const list = getContractTemplates(category)
  selectedTemplate.value = list[0] || null
}

const selectTemplate = (tpl) => {
  selectedTemplate.value = tpl
}

const resetTemplate = () => {
  selectedCategory.value = ''
  selectedTemplate.value = null
  selectedCategoryName.value = ''
}

const selectBidDocument = (doc) => {
  selectedBidDocument.value = doc
  fillDataFromBid(doc)
}

const fillDataFromBid = (doc) => {
  if (!doc) return
  
  if (doc.name) contractData.value.contractName = doc.name.replace('招标', '合同')
  if (doc.category) contractData.value.category = getCategoryName(doc.category)
  
  const reqData = localStorage.getItem('requirementData')
  if (reqData) {
    try {
      const r = JSON.parse(reqData)
      if (r.projectName) {
        contractData.value.projectName = r.projectName
        contractData.value.contractSubject = r.projectName
      }
      if (r.contactPerson) {
        contractData.value.contactPerson = r.contactPerson
        contractData.value.partyAContact = r.contactPerson
      }
      if (r.contactPhone) {
        contractData.value.contactPhone = r.contactPhone
        contractData.value.partyAPhone = r.contactPhone
      }
      if (r.deliveryLocation) {
        contractData.value.deliveryLocation = r.deliveryLocation
        contractData.value.deliveryAddress = r.deliveryLocation
      }
      if (r.budget) contractData.value.totalAmount = r.budget
      if (r.deliveryDate) contractData.value.deliveryDate = r.deliveryDate
      if (r.paymentTerms) contractData.value.paymentTerms = r.paymentTerms
      if (r.warrantyPeriod) contractData.value.warrantyPeriod = r.warrantyPeriod
      if (r.technicalRequirements) contractData.value.technicalRequirements = r.technicalRequirements
    } catch (e) {}
  }
}

const loadBidDocuments = async () => {
  try {
    const res = await axios.get('/documents')
    bidDocuments.value = (res || []).filter(d => d.type === 'bid' || d.templateId?.startsWith('template'))
  } catch (error) {
    console.error('获取招标书列表失败:', error)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  } catch (e) {
    return dateStr
  }
}

const filteredFieldGroups = computed(() => {
  const groups = contractFields
  if (!selectedCategory.value) return groups
  return groups.map(g => {
    if (g.title === '六、工程类专属' && selectedCategory.value !== 'engineering') {
      return { ...g, items: [] }
    }
    if (g.title === '十一、服务类专属' && selectedCategory.value !== 'services') {
      return { ...g, items: [] }
    }
    return g
  }).filter(g => g.items.length > 0)
})

const filteredFieldCount = computed(() => {
  return filteredFieldGroups.value.reduce((sum, g) => sum + g.items.length, 0)
})

const aiFilledCount = computed(() => {
  if (!aiParsedData.value) return 0
  return Object.values(aiParsedData.value).filter(v => v).length
})

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const switchPage = (page) => {
  currentPage.value = page
  router.push('/' + page)
}

const showMsgPanel = ref(false)
const messages = ref([
  { id: 1, title: '系统更新完成，新增风险检测功能', time: '10分钟前', read: false },
  { id: 2, title: '您生成的《工程类采购合同》已通过风险检测', time: '1小时前', read: false },
  { id: 3, title: '新模板《服务类采购合同模板》已上线', time: '2小时前', read: true }
])

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
  // 可以跳转到一个消息中心页面，先alert提示
  alert('消息中心功能开发中')
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

const getFieldLabel = (key) => {
  const f = flatContractFields.find(x => x.key === key)
  return f ? f.label : key
}

const handleAIParse = async () => {
  if (!nlpText.value.trim()) {
    alert('请输入合同需求描述')
    return
  }
  aiLoading.value = true
  try {
    const res = await parseContract(nlpText.value, selectedCategory.value)
    aiParsedData.value = res.data || {}
  } catch (error) {
    alert('AI解析失败：' + (error.response?.data?.message || '未知错误'))
  } finally {
    aiLoading.value = false
  }
}

const applyAIData = () => {
  if (!aiParsedData.value) return
  let applied = 0
  Object.keys(aiParsedData.value).forEach(key => {
    if (aiParsedData.value[key] && contractData.value.hasOwnProperty(key)) {
      contractData.value[key] = aiParsedData.value[key]
      applied++
    }
  })
  aiApplied.value = true
  inputMode.value = 'form'
  aiParsedData.value = null
  alert('AI解析结果已应用到字段对照表，共填充 ' + applied + ' 个字段，请检查并补充完善')
}

const generateContract = () => {
  if (!selectedTemplate.value) {
    alert('请先选择合同模板')
    return
  }
  const payload = {
    template: selectedTemplate.value,
    category: selectedCategory.value,
    categoryName: selectedCategoryName.value,
    fields: contractData.value,
    fieldGroups: filteredFieldGroups.value.map(g => ({
      group: g.title,
      items: g.items.map(it => ({ key: it.key, label: it.label, value: contractData.value[it.key] }))
    })),
    bidDocumentId: selectedBidDocument.value?._id
  }
  localStorage.setItem('contractData', JSON.stringify(payload))
  localStorage.setItem('contractOptions', JSON.stringify(contractData.value))
  localStorage.setItem('selectedContractTemplate', JSON.stringify(selectedTemplate.value))
  localStorage.setItem('selectedContractCategory', selectedCategory.value)
  router.push('/contract-preview')
}

onMounted(async () => {
  await Promise.all([loadBidDocuments(), (async () => {
    try {
      const allTemplates = await getTemplates()
      templates.value = allTemplates || []
    } catch (error) {
      console.error('获取模板失败:', error)
    }
  })()])
  
  const reqData = localStorage.getItem('requirementData')
  if (reqData) {
    try {
      const r = JSON.parse(reqData)
      if (r.projectName) contractData.value.projectName = r.projectName
      if (r.contactPerson) contractData.value.contactPerson = r.contactPerson
      if (r.contactPhone) contractData.value.contactPhone = r.contactPhone
      if (r.budget) contractData.value.totalAmount = r.budget
      if (r.deliveryLocation) contractData.value.deliveryAddress = r.deliveryLocation
      if (r.deliveryDate) contractData.value.deliveryDeadline = r.deliveryDate
      if (r.technicalRequirements) contractData.value.technicalRequirements = r.technicalRequirements
    } catch (e) {}
  }
  
  const savedTpl = localStorage.getItem('selectedContractTemplate')
  const savedCat = localStorage.getItem('selectedContractCategory')
  if (savedTpl && savedCat) {
    try {
      selectedCategory.value = savedCat
      selectedCategoryName.value = getCategoryName(savedCat)
      selectedTemplate.value = JSON.parse(savedTpl)
    } catch (e) {}
  }
})</script>

<style scoped>
.app-container { min-height: 100vh; background: #F2F3F5; }

.header { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #fff; border-bottom: 1px solid #E5E6EB; display: flex; align-items: center; padding: 0 20px; z-index: 1000; }
.header-logo { display: flex; align-items: center; gap: 10px; width: 220px; flex-shrink: 0; }
.header-logo .logo-icon { width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #165DFF, #4080FF); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
.header-logo .logo-text { font-size: 15px; font-weight: 600; color: #1D2129; }
.header-search { position: relative; }
.header-search input { width: 200px; height: 32px; border: 1px solid #E5E6EB; border-radius: 4px; padding: 0 12px 0 32px; font-size: 13px; outline: none; }
.header-search input:focus { border-color: #165DFF; }
.header-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
.header-bell { position: relative; cursor: pointer; font-size: 18px; }
.header-bell .badge { position: absolute; top: -4px; right: -6px; background: #F53F3F; color: #fff; font-size: 10px; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
.header-user { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 8px; border-radius: 4px; position: relative; }
.header-user:hover { background: #F2F3F5; }
.header-user .avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #165DFF, #722ED1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.header-user .name { font-size: 13px; color: #1D2129; }
.header-user .arrow { color: #C9CDD4; font-size: 10px; }
.user-dropdown { position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #E5E6EB; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 140px; padding: 6px 0; z-index: 1100; margin-top: 4px; }
.user-dropdown-item { padding: 8px 16px; font-size: 13px; color: #4E5969; cursor: pointer; transition: background .15s; }
.user-dropdown-item:hover { background: #F2F3F5; color: #165DFF; }
.sidebar { position: fixed; top: 56px; left: 0; bottom: 0; width: 220px; background: #fff; border-right: 1px solid #E5E6EB; overflow-y: auto; z-index: 900; }
.nav-group { margin-bottom: 4px; }
.nav-group-title { padding: 16px 20px 6px; font-size: 11px; color: #86909C; font-weight: 600; text-transform: uppercase; }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 20px; cursor: pointer; color: #4E5969; font-size: 13px; border-left: 3px solid transparent; }
.nav-item:hover { background: #F2F3F5; color: #1D2129; }
.nav-item.active { background: #E8F3FF; color: #165DFF; border-left-color: #165DFF; font-weight: 500; }
.nav-item .icon { font-size: 16px; width: 22px; text-align: center; }

.main { margin-left: 220px; margin-top: 56px; padding: 20px; min-height: calc(100vh - 56px); }
.breadcrumb { margin-bottom: 16px; font-size: 13px; color: #86909C; }
.breadcrumb a { color: #4E5969; text-decoration: none; }
.breadcrumb a:hover { color: #165DFF; }
.breadcrumb span { margin: 0 6px; color: #C9CDD4; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1D2129; }
.page-desc { font-size: 13px; color: #86909C; margin-top: 2px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid transparent; }
.btn-primary { background: #165DFF; color: #fff; border-color: #165DFF; }
.btn-primary:hover { background: #4080FF; }
.btn-primary:disabled { background: #94BFFF; cursor: not-allowed; }
.btn-default { background: #fff; color: #4E5969; border-color: #E5E6EB; }
.btn-default:hover { border-color: #165DFF; color: #165DFF; }
.btn-sm { padding: 3px 10px; font-size: 12px; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

.category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.category-card { background: #fff; border-radius: 12px; border: 1px solid #E5E6EB; padding: 20px; cursor: pointer; transition: all .25s; position: relative; overflow: hidden; }
.category-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
.category-card.selected { border-width: 2px; }
.category-card.selected.cat-goods { border-color: #165DFF; background: #F5F9FF; }
.category-card.selected.cat-engineering { border-color: #FF7D00; background: #FFFBF5; }
.category-card.selected.cat-services { border-color: #00B42A; background: #F5FFF8; }
.cat-icon { font-size: 32px; margin-bottom: 10px; }
.cat-name { font-size: 16px; font-weight: 700; color: #1D2129; margin-bottom: 6px; }
.cat-desc { font-size: 12px; color: #86909C; line-height: 1.6; margin-bottom: 10px; }
.cat-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.cat-recommend { position: absolute; top: 10px; right: 10px; background: #FF7D00; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 10px; }

.tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap; }
.tag-info { background: #E8F3FF; color: #165DFF; }
.tag-warning { background: #FFF7E8; color: #FF7D00; }
.tag-success { background: #E8FFEA; color: #00B42A; }
.tag-gray { background: #F2F3F5; color: #86909C; }

.sub-template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.sub-tpl-card { background: #F7F8FA; border-radius: 8px; border: 1px solid #E5E6EB; padding: 16px; cursor: pointer; transition: all .2s; }
.sub-tpl-card:hover { border-color: #165DFF; background: #fff; }
.sub-tpl-card.selected { border-color: #165DFF; background: #F0F7FF; }
.sub-tpl-type { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.sub-tpl-type.contract { background: #E8FFEA; color: #00B42A; }
.sub-tpl-name { font-size: 14px; font-weight: 600; color: #1D2129; }
.sub-tpl-desc { font-size: 12px; color: #86909C; margin: 6px 0; }
.sub-tpl-id { font-size: 11px; color: #165DFF; background: #E8F3FF; display: inline-block; padding: 2px 8px; border-radius: 4px; }

.selected-tpl-info { margin-top: 16px; padding: 12px 16px; background: #F0F7FF; border-radius: 6px; display: flex; align-items: center; gap: 10px; }
.sti-label { font-size: 13px; color: #4E5969; }
.sti-value { font-size: 14px; font-weight: 600; color: #165DFF; }
.sti-meta { font-size: 12px; color: #86909C; }

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

.ai-result-panel { margin-top: 20px; padding: 16px; background: #F5F9FF; border-radius: 8px; border: 1px solid #B5D0FF; }
.ai-result-title { font-size: 14px; font-weight: 600; color: #165DFF; margin-bottom: 12px; }
.ai-result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
.ai-result-item { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; background: #fff; border-radius: 6px; }
.ai-result-key { font-size: 12px; color: #86909C; }
.ai-result-value { font-size: 13px; color: #1D2129; font-weight: 500; }
.ai-result-actions { display: flex; justify-content: flex-end; gap: 10px; }

.source-tabs { display: flex; justify-content: center; gap: 16px; margin-bottom: 16px; }
.source-tab { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; border: 1px solid #E5E6EB; cursor: pointer; font-size: 14px; color: #4E5969; background: #FAFBFC; transition: all .2s; }
.source-tab:hover { border-color: #165DFF; color: #165DFF; background: #F5F9FF; }
.source-tab.active { background: #165DFF; color: #fff; border-color: #165DFF; font-weight: 500; }

.bid-history-list { margin-top: 12px; }
.bhl-header { font-size: 13px; color: #4E5969; margin-bottom: 12px; text-align: center; }
.bhl-empty { text-align: center; padding: 24px; color: #86909C; font-size: 13px; }
.bhl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.bhl-card { background: #F7F8FA; border-radius: 8px; border: 2px solid transparent; padding: 16px; cursor: pointer; transition: all .2s; }
.bhl-card:hover { border-color: #165DFF; background: #fff; box-shadow: 0 4px 12px rgba(22,93,255,0.08); }
.bhl-card.selected { border-color: #165DFF; background: #F0F7FF; }
.bhl-title { font-size: 14px; font-weight: 600; color: #1D2129; margin-bottom: 8px; }
.bhl-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 12px; color: #86909C; }
.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.status-tag.published { background: #E8FFEA; color: #00B42A; }
.status-tag.draft { background: #F2F3F5; color: #86909C; }
.status-tag.pending { background: #FFF7E8; color: #FF7D00; }

/* 字段对照表 */
.field-group { margin-bottom: 24px; }
.field-group:last-child { margin-bottom: 0; }
.field-group-title { font-size: 14px; font-weight: 600; color: #1D2129; padding: 8px 12px; background: linear-gradient(90deg, #E8F3FF 0%, transparent 100%); border-left: 3px solid #165DFF; margin-bottom: 12px; border-radius: 0 4px 4px 0; }
.field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.field-item { display: flex; flex-direction: column; gap: 6px; padding: 12px; background: #F7F8FA; border-radius: 6px; }
.fi-label { font-size: 13px; color: #4E5969; display: flex; align-items: center; gap: 4px; }
.fi-required { color: #F53F3F; }
.fi-shared { font-size: 11px; }
.fi-input { height: 36px; border: 1px solid #E5E6EB; border-radius: 4px; padding: 0 12px; font-size: 13px; color: #1D2129; outline: none; background: #fff; transition: border-color .2s; width: 100%; box-sizing: border-box; }
.fi-textarea { height: auto; padding: 8px 12px; resize: vertical; min-height: 50px; line-height: 1.5; }
.fi-input:focus { border-color: #165DFF; box-shadow: 0 0 0 2px rgba(22,93,255,0.1); }
.fi-input::placeholder { color: #C9CDD4; font-size: 12px; }
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
=======
</script>

<style scoped>
.placeholder-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-card {
  text-align: center;
  padding: 48px 64px;
  border-radius: 16px;
  min-width: 400px;
}

.placeholder-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 20px 0 8px;
}

.placeholder-desc {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 20px;
}
>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
</style>
