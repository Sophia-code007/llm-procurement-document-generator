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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">字段确认</a></div>
      <div class="page-header">
        <div><div class="page-title">字段确认</div><div class="page-desc">请确认已填写的需求信息</div></div>
      </div>

      <div class="tpl-progress-bar">
        <div class="tpl-progress-step done"><span class="check-icon">✓</span> 选择模板</div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step done"><span class="check-icon">✓</span> 录入需求</div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step current">字段确认（当前）</div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step">预览下载</div>
      </div>

      <div class="card">
        <div class="card-title">需求信息汇总</div>
        <div v-if="requirementData" class="field-list">
          <div class="field-item" v-for="(value, key) in requirementData" :key="key">
            <span class="fi-label"><b>{{ getFieldLabel(key) }}</b></span>
            <span class="fi-value">{{ value || '未填写' }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="es-icon">📝</div>
          <div class="es-text">暂无需求信息，请先进行需求录入</div>
          <button class="btn btn-primary" @click="switchPage('requirement')">去录入需求 →</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">确认信息</div>
        <div style="display:flex; gap:16px; flex-wrap:wrap;">
          <label class="checkbox-item">
            <input type="checkbox" v-model="confirmOptions.allFields">
            <span>所有字段信息准确无误</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="confirmOptions.budgetConfirmed">
            <span>预算金额已确认</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="confirmOptions.contactConfirmed">
            <span>联系人信息已确认</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="confirmOptions.methodConfirmed">
            <span>采购方式已确认</span>
          </label>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-default" @click="switchPage('requirement')">返回修改</button>
        <button class="btn btn-primary" :disabled="!allConfirmed || riskLoading" @click="generateDocument">
          {{ riskLoading ? '风险检测中...' : '确认并预览文件' }}
        </button>
      </div>

      <!-- 风险检测弹窗 -->
      <div v-if="showRiskModal" class="modal-overlay" @click.self="closeRiskModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">⚠️ 检测到高风险内容</span>
            <span class="modal-close" @click="closeRiskModal">×</span>
          </div>
          <div class="modal-body">
            <p style="color:#F53F3F; font-size:13px; margin-bottom:16px;">
              系统检测到您的需求内容存在以下违法违规风险，请修改后再确认：
            </p>
            <div class="risk-list">
              <div v-for="(risk, index) in riskCheckResult?.risks?.filter(r => r.level === 'high')" :key="index" class="risk-item">
                <div class="risk-title">
                  <span class="risk-badge">{{ risk.level === 'high' ? '高风险' : (risk.level === 'medium' ? '中风险' : '低风险') }}</span>
                  {{ risk.category }} - {{ risk.title }}
                </div>
                <div class="risk-desc">{{ risk.description }}</div>
                <div v-if="risk.matchedText && risk.matchedText.length > 0" class="risk-matched">
                  <span style="font-size:12px;color:#86909C;">匹配到的文本：</span>
                  <span style="font-size:12px;color:#F53F3F;font-weight:500;">{{ risk.matchedText.join('；') }}</span>
                </div>
                <div class="risk-suggestion">💡 建议：{{ risk.suggestion }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-default" @click="closeRiskModal">返回修改</button>
            <button class="btn btn-danger" @click="proceedDespiteRisks">强制继续</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { analyzeRisk } from '../api/risk'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const requirementData = ref(null)
const confirmOptions = ref({
  allFields: false,
  budgetConfirmed: false,
  contactConfirmed: false,
  methodConfirmed: false
})
const currentPage = ref('field-confirm')

// 风险检测弹窗
const showRiskModal = ref(false)
const riskCheckResult = ref(null)
const riskLoading = ref(false)

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const allConfirmed = computed(() => {
  return confirmOptions.value.allFields && 
         confirmOptions.value.budgetConfirmed && 
         confirmOptions.value.contactConfirmed && 
         confirmOptions.value.methodConfirmed
})

const fieldLabels = {
  projectName: '项目名称',
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
  purchaseProjectName: '采购项目名称',
  purchaseOrgName: '采购组织单位',
  purchaseContactPerson: '采购联系人',
  purchaseContactPhone: '联系电话',
  purchaseMethod: '采购方式',
  totalBudgetAmount: '预算总金额',
  fundSource: '资金来源',
  techRequirement: '技术参数要求',
  allowImportGoods: '是否允许进口',
  setMaxPriceLimit: '是否设定最高限价',
  maxPriceAmount: '最高限价金额',
  quoteScope: '报价范围',
  projectCode: '项目编号',
  tendererName: '招标人名称',
  legalRepresentative: '法定代表人',
  constructionLocation: '建设地点',
  constructionScale: '工程规模',
  structureType: '结构形式',
  serviceContent: '服务内容',
  serviceLocation: '服务地点',
  servicePeriod: '服务期限',
  serviceStandards: '服务标准'
}

const getFieldLabel = (key) => {
  return fieldLabels[key] || key
}

const switchPage = (page) => {
  currentPage.value = page
  router.push(`/${page}`)
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

const doGenerate = () => {
  const template = JSON.parse(localStorage.getItem('selectedTemplate') || '{}')
  if (template.type === 'bid') {
    router.push('/bid-preview')
  } else if (template.type === 'contract') {
    router.push('/contract-preview')
  }
}

const generateDocument = async () => {
  if (!requirementData.value) {
    alert('暂无需求信息，请先进行需求录入')
    return
  }
  riskLoading.value = true
  try {
    const template = JSON.parse(localStorage.getItem('selectedTemplate') || '{}')
    const result = await analyzeRisk({
      docType: template.type === 'contract' ? 'contract' : 'bid',
      data: requirementData.value,
      docId: 'confirm-' + Date.now()
    })
    riskCheckResult.value = result
    // 如果有高风险（合规红线或过期法规），弹出提醒
    const seriousRisks = result.risks.filter(r =>
      r.level === 'high'
    )
    if (seriousRisks.length > 0) {
      showRiskModal.value = true
    } else {
      doGenerate()
    }
  } catch (error) {
    console.error('风险检测失败:', error)
    // 检测失败时允许继续
    doGenerate()
  } finally {
    riskLoading.value = false
  }
}

const closeRiskModal = () => {
  showRiskModal.value = false
}

const proceedDespiteRisks = () => {
  showRiskModal.value = false
  doGenerate()
}

onMounted(() => {
  const saved = localStorage.getItem('requirementData')
  if (saved) {
    requirementData.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
.app-container { min-height: 100vh; background: #F2F3F5; }

.header { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #fff; border-bottom: 1px solid #E5E6EB; display: flex; align-items: center; padding: 0 20px; z-index: 1000; }
.header-logo { display: flex; align-items: center; gap: 10px; width: 220px; flex-shrink: 0; }
.header-logo .logo-icon { width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #165DFF, #4080FF); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
.header-logo .logo-text { font-size: 15px; font-weight: 600; color: #1D2129; }
.header-search { position: relative; }
.header-search input { width: 200px; height: 32px; border: 1px solid #E5E6EB; border-radius: 4px; padding: 0 12px 0 32px; font-size: 13px; outline: none; }
.header-search input:focus { border-color: #165DFF; }
.header-search::before { content: "🔍"; position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; }
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
.nav-divider { height: 1px; background: #E5E6EB; margin: 8px 20px; }

.main { margin-left: 220px; margin-top: 56px; padding: 20px; min-height: calc(100vh - 56px); }

.breadcrumb { margin-bottom: 16px; font-size: 13px; color: #86909C; }
.breadcrumb a { color: #4E5969; text-decoration: none; }
.breadcrumb a:hover { color: #165DFF; }
.breadcrumb span { margin: 0 6px; color: #C9CDD4; }

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1D2129; }
.page-desc { font-size: 13px; color: #86909C; margin-top: 2px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid transparent; }
.btn-primary { background: #165DFF; color: #fff; border-color: #165DFF; }
.btn-primary:hover { background: #4080FF; }
.btn-primary:disabled { background: #94BFFF; cursor: not-allowed; }
.btn-default { background: #fff; color: #4E5969; border-color: #E5E6EB; }
.btn-default:hover { border-color: #165DFF; color: #165DFF; }

.tpl-progress-bar { display: flex; align-items: center; gap: 0; margin-bottom: 24px; background: #F7F8FA; border-radius: 8px; padding: 12px 20px; }
.tpl-progress-step { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #86909C; }
.tpl-progress-step.done { color: #00B42A; }
.tpl-progress-step.current { color: #165DFF; font-weight: 600; }
.tpl-progress-arrow { color: #C9CDD4; margin: 0 12px; font-size: 14px; }
.check-icon { color: #00B42A; font-weight: 700; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

.field-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.field-item { background: #F7F8FA; border-radius: 6px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
.field-item .fi-label { font-size: 13px; color: #4E5969; }
.field-item .fi-label b { color: #1D2129; }
.field-item .fi-value { font-size: 13px; color: #1D2129; font-weight: 500; }

.empty-state { text-align: center; padding: 48px 20px; color: #86909C; }
.empty-state .es-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state .es-text { font-size: 14px; margin-bottom: 16px; }

.checkbox-item { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #F7F8FA; border-radius: 6px; cursor: pointer; font-size: 13px; color: #4E5969; }
.checkbox-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: #165DFF; }
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

/* 风险检测弹窗 */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 12px; width: 640px; max-width: 90vw; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 20px 48px rgba(0,0,0,0.15); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #E5E6EB; }
.modal-title { font-size: 16px; font-weight: 600; color: #1D2129; }
.modal-close { font-size: 22px; color: #86909C; cursor: pointer; line-height: 1; }
.modal-close:hover { color: #F53F3F; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid #E5E6EB; }
.btn-danger { background: #F53F3F; color: #fff; border-color: #F53F3F; }
.btn-danger:hover { background: #FF6B6B; }

.risk-list { display: flex; flex-direction: column; gap: 12px; }
.risk-item { background: #FFF5F5; border: 1px solid #FFD4D4; border-radius: 8px; padding: 14px 16px; }
.risk-title { font-size: 14px; font-weight: 600; color: #1D2129; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.risk-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #F53F3F; color: #fff; }
.risk-desc { font-size: 13px; color: #4E5969; line-height: 1.6; margin-bottom: 6px; }
.risk-suggestion { font-size: 12px; color: #165DFF; background: #E8F3FF; padding: 8px 12px; border-radius: 6px; }
</style>