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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">风险检测</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">风险检测</div>
          <div class="page-desc">
            智能检测{{ lastDocType === 'contract' ? '合同' : lastDocType === 'bid' ? '招标书' : '文档' }}中的潜在风险
            <span v-if="lastDocName" style="color:#165DFF; margin-left:8px;">「{{ lastDocName }}」</span>
          </div>
        </div>
        <button class="btn btn-primary" :disabled="loading" @click="runRiskCheck">
          {{ loading ? '检测中...' : '开始检测' }}
        </button>
      </div>

      <div class="risk-overview">
        <div class="risk-card">
          <div class="rc-icon">🔴</div>
          <div class="rc-count">{{ highRisks }}</div>
          <div class="rc-label">高风险</div>
        </div>
        <div class="risk-card">
          <div class="rc-icon">🟠</div>
          <div class="rc-count">{{ mediumRisks }}</div>
          <div class="rc-label">中风险</div>
        </div>
        <div class="risk-card">
          <div class="rc-icon">🟢</div>
          <div class="rc-count">{{ lowRisks }}</div>
          <div class="rc-label">低风险</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">风险检测结果</div>
        <div v-if="risks.length === 0" class="empty-state">
          <div class="es-icon">✅</div>
          <div class="es-text">暂无风险检测结果，点击上方按钮开始检测</div>
        </div>
        <div v-else>
          <div 
            class="risk-item" 
            :class="{ open: openedRisk === (risk.id || risk._id), resolved: risk.resolved }"
            v-for="risk in risks"
            :key="risk.id || risk._id"
            @click="toggleRisk(risk.id || risk._id)"
          >
            <div class="risk-header">
              <div class="rh-left">
                <span class="rh-level" :class="risk.level"></span>
                <span class="rh-title">{{ risk.title }}</span>
                <span class="rh-category" :style="{ background: getCategoryColor(risk.category) + '15', color: getCategoryColor(risk.category), border: '1px solid ' + getCategoryColor(risk.category) + '30' }">
                  {{ risk.category }}
                </span>
                <span v-if="risk.resolved" class="rh-resolved">已处理</span>
              </div>
              <div class="rh-right">
                <span :class="'level-tag ' + risk.level">{{ risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中风险' : '低风险' }}</span>
                <span>{{ openedRisk === (risk.id || risk._id) ? '收起' : '展开' }}</span>
              </div>
            </div>
            <div class="risk-body">
              <p>{{ risk.description }}</p>
              <div class="suggestion">
                <div style="font-weight:600; margin-bottom:4px;">💡 修正建议：</div>
                {{ risk.suggestion }}
              </div>
              <div v-if="risk.type === 'expired_regulation'" class="regulation-alert">
                ⚠️ 该条款引用了已废止/修订的法规，请务必更新为最新版本，否则可能导致法律风险。
              </div>
              <div v-if="risk.type === 'compliance_redline'" class="redline-alert">
                🚫 该条款触碰合规红线，违反相关法律法规，必须修正！
              </div>
              <div style="margin-top:12px; display:flex; gap:10px;">
                <button v-if="!risk.resolved" class="btn btn-sm btn-success" @click.stop="resolveRisk(risk.id || risk._id)">标记已处理</button>
                <button v-else class="btn btn-sm btn-default" disabled>已处理</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">合规红线检测</div>
        <div class="redline-list">
          <div class="redline-item" v-for="item in redlines" :key="item.id">
            <div class="rl-title">{{ item.title }}</div>
            <div class="rl-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-default" @click="goBack">返回修改</button>
        <button class="btn btn-success" :disabled="highRisks > 0" @click="confirmRiskFree">确认无重大风险</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { analyzeRisk, updateRisk, getAllRisks } from '../api/risk'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const currentPage = ref('risk-check')
const openedRisk = ref(null)
const risks = ref([])
const loading = ref(false)
const lastDocType = ref('')
const lastDocName = ref('')

const redlines = ref([
  { id: 1, title: '禁止设定不合理的资质条件', desc: '不得以不合理条件对供应商实行差别待遇或歧视待遇' },
  { id: 2, title: '禁止限定特定品牌或供应商', desc: '不得限定或指定特定的专利、商标、品牌或供应商' },
  { id: 3, title: '禁止排斥潜在投标人', desc: '不得设置过高的资格门槛排斥潜在投标人' },
  { id: 4, title: '禁止拆分项目规避招标', desc: '不得将必须进行招标的项目化整为零规避招标' }
])

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const highRisks = computed(() => risks.value.filter(r => r.level === 'high' && !r.resolved).length)
const mediumRisks = computed(() => risks.value.filter(r => r.level === 'medium' && !r.resolved).length)
const lowRisks = computed(() => risks.value.filter(r => r.level === 'low' && !r.resolved).length)

const categoryColors = {
  '霸王条款': '#F53F3F',
  '条款漏项': '#FF7D00',
  '过期法规': '#722ED1',
  '合规红线': '#F53F3F'
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

const toggleRisk = (id) => {
  openedRisk.value = openedRisk.value === id ? null : id
}

const runRiskCheck = async () => {
  loading.value = true
  try {
    // 尝试获取最新的文档数据
    const requirementData = JSON.parse(localStorage.getItem('requirementData') || '{}')
    const contractPayload = JSON.parse(localStorage.getItem('contractData') || '{}')
    const contractData = contractPayload.fields || contractPayload || {}
    const bidTemplate = JSON.parse(localStorage.getItem('selectedTemplate') || '{}')
    const contractTemplate = JSON.parse(localStorage.getItem('selectedContractTemplate') || '{}')

    // 判断当前检测类型
    let docType = 'bid'
    let data = requirementData
    let docName = requirementData.projectName || '未命名招标书'
    let content = ''

    // 如果有合同数据且比招标书数据更完整，优先检测合同
    if (contractData && (contractData.partyAName || contractData.contractAmount)) {
      docType = 'contract'
      data = contractData
      docName = contractData.purchaseProjectName || contractData.projectName || '未命名合同'
    }

    lastDocType.value = docType
    lastDocName.value = docName

    // 如果当前是合同检测，保存来源标记以便返回
    if (docType === 'contract') {
      localStorage.setItem('riskCheckFrom', 'contract-preview')
    }

    // 如果有渲染内容，也传过去做文本分析
    const renderedContent = localStorage.getItem('lastRenderedContent') || ''

    const result = await analyzeRisk({
      docType,
      data,
      content: renderedContent,
      docId: 'temp-' + Date.now()
    })

    risks.value = result.risks || []

    // 保存到localStorage供其他页面读取
    localStorage.setItem('lastRiskCheck', JSON.stringify({
      docType,
      docName,
      risks: result.risks,
      summary: result.summary,
      timestamp: new Date().toISOString()
    }))
  } catch (error) {
    console.error('风险检测失败', error)
    alert('风险检测失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  const from = localStorage.getItem('riskCheckFrom')
  router.push(from === 'contract-preview' ? '/contract-preview' : '/dashboard')
}

const resolveRisk = async (id) => {
  const risk = risks.value.find(r => r.id === id || r._id === id)
  if (risk) {
    risk.resolved = true
    try {
      if (risk._id) {
        await updateRisk(risk._id, { resolved: true })
      }
    } catch (e) {}
    alert(`风险项「${risk.title}」已标记为已处理`)
  }
}

const confirmRiskFree = () => {
  if (highRisks.value > 0) {
    alert('存在高风险项未处理，建议先处理后再确认')
    return
  }
  alert('已确认无重大风险')
  const from = localStorage.getItem('riskCheckFrom')
  router.push(from === 'contract-preview' ? '/contract-preview' : '/dashboard')
}

const getCategoryColor = (category) => categoryColors[category] || '#86909C'

onMounted(async () => {
  // 尝试加载上次的风险检测结果
  const saved = localStorage.getItem('lastRiskCheck')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      risks.value = parsed.risks || []
      lastDocType.value = parsed.docType || ''
      lastDocName.value = parsed.docName || ''
    } catch (e) {}
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
.btn-default { background: #fff; color: #4E5969; border-color: #E5E6EB; }
.btn-default:hover { border-color: #165DFF; color: #165DFF; }
.btn-success { background: #00B42A; color: #fff; border-color: #00B42A; }
.btn-success:hover { background: #23C343; }
.btn-success:disabled { background: #94D899; cursor: not-allowed; }
.btn-sm { padding: 3px 10px; font-size: 12px; }

.risk-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.risk-card { background: #fff; border-radius: 8px; border: 1px solid #E5E6EB; padding: 16px; text-align: center; }
.risk-card .rc-icon { font-size: 28px; margin-bottom: 8px; }
.risk-card .rc-count { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.risk-card .rc-label { font-size: 12px; color: #86909C; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

.empty-state { text-align: center; padding: 48px 20px; color: #86909C; }
.empty-state .es-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state .es-text { font-size: 14px; margin-bottom: 16px; }

.risk-item { border: 1px solid #E5E6EB; border-radius: 8px; margin-bottom: 8px; overflow: hidden; transition: box-shadow .2s; }
.risk-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.risk-item.resolved { opacity: 0.6; background: #F7F8FA; }
.risk-item.resolved .rh-title { text-decoration: line-through; }
.risk-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; background: #FAFBFC; }
.risk-header .rh-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.risk-header .rh-level { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.risk-header .rh-level.high { background: #F53F3F; }
.risk-header .rh-level.medium { background: #FF7D00; }
.risk-header .rh-level.low { background: #00B42A; }
.risk-header .rh-title { font-size: 13px; font-weight: 500; color: #1D2129; }
.risk-header .rh-category { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.risk-header .rh-resolved { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #E8FFEA; color: #00B42A; font-weight: 500; }
.risk-header .rh-right { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #86909C; flex-shrink: 0; }
.level-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.level-tag.high { background: #FFF5F5; color: #F53F3F; }
.level-tag.medium { background: #FFF7E8; color: #FF7D00; }
.level-tag.low { background: #E8FFEA; color: #00B42A; }
.risk-body { padding: 12px 16px 16px; border-top: 1px solid #E5E6EB; display: none; }
.risk-item.open .risk-body { display: block; }
.risk-body p { font-size: 12px; color: #4E5969; line-height: 1.8; margin-bottom: 8px; }
.risk-body .suggestion { background: #E8FFEA; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #1D2129; border-left: 3px solid #00B42A; }
.risk-body .regulation-alert { background: #F5E8FF; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #722ED1; margin-top: 8px; border-left: 3px solid #722ED1; }
.risk-body .redline-alert { background: #FFF5F5; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #F53F3F; margin-top: 8px; border-left: 3px solid #F53F3F; font-weight: 500; }

.redline-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.redline-item { padding: 12px 16px; border-radius: 8px; border-left: 4px solid #F53F3F; background: #FFF5F5; }
.redline-item .rl-title { font-size: 13px; font-weight: 600; color: #F53F3F; margin-bottom: 4px; }
.redline-item .rl-desc { font-size: 12px; color: #4E5969; }
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
</style>