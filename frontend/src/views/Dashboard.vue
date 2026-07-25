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
      <div class="breadcrumb"><a href="#">首页</a><span>/</span><a href="#">工作台</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">工作台</div>
          <div class="page-desc">欢迎回来，{{ user?.userName || '用户' }}。今天是{{ currentDate }}</div>
        </div>
        <button class="btn btn-primary" @click="switchPage('requirement')">+ 新建采购文件</button>
      </div>

      <div class="kpi-row">
        <div class="kpi-card blue">
          <div class="kpi-label">本月生成文件</div>
          <div class="kpi-value">{{ generatedCount }}</div>
          <div class="kpi-change up">↑ 12.3% 较上月</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-label">已发布文件</div>
          <div class="kpi-value">{{ publishedCount }}</div>
          <div class="kpi-change up">↑ 8.7% 较上月</div>
        </div>
        <div class="kpi-card orange">
          <div class="kpi-label">待审批文件</div>
          <div class="kpi-value">{{ pendingCount }}</div>
          <div class="kpi-change down">↓ 2.1% 较上月</div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-label">风险预警</div>
          <div class="kpi-value">{{ riskCount }}</div>
          <div class="kpi-change down">↓ 5.0% 较上月</div>
        </div>
      </div>

      <div class="quick-grid">
        <div class="quick-item" @click="switchPage('requirement')">
          <div class="qi-icon">📝</div>
          <div class="qi-label">需求录入</div>
          <div class="qi-desc">智能解析采购需求</div>
        </div>
        <div class="quick-item" @click="switchPage('template')">
          <div class="qi-icon">📋</div>
          <div class="qi-label">模板选择</div>
          <div class="qi-desc">选择合适的文件模板</div>
        </div>
        <div class="quick-item" @click="switchPage('risk-check')">
          <div class="qi-icon">⚠️</div>
          <div class="qi-label">风险检测</div>
          <div class="qi-desc">智能检测合同风险</div>
        </div>
        <div class="quick-item" @click="switchPage('ai-chat')">
          <div class="qi-icon">🤖</div>
          <div class="qi-label">智能问答</div>
          <div class="qi-desc">AI辅助解答疑问</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">扩展功能</div>
        <div class="quick-grid">
          <div class="quick-item" @click="switchPage('regulation')">
            <div class="qi-icon">⚖️</div>
            <div class="qi-label">法规库对接</div>
            <div class="qi-desc">对接最新法规标准</div>
          </div>
          <div class="quick-item" @click="switchPage('history')">
            <div class="qi-icon">📁</div>
            <div class="qi-label">历史文件复用</div>
            <div class="qi-desc">复用已有文件内容</div>
          </div>
          <div class="quick-item" @click="switchPage('collab')">
            <div class="qi-icon">👥</div>
            <div class="qi-label">协同编辑</div>
            <div class="qi-desc">多人在线协作编辑</div>
          </div>
          <div class="quick-item" @click="switchPage('version')">
            <div class="qi-icon">🔄</div>
            <div class="qi-label">版本管理</div>
            <div class="qi-desc">管理文件历史版本</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">高级功能</div>
        <div class="quick-grid">
          <div class="quick-item" @click="switchPage('ai-chat')">
            <div class="qi-icon">🤖</div>
            <div class="qi-label">智能问答辅助</div>
            <div class="qi-desc">AI 智能问答助手</div>
          </div>
          <div class="quick-item" @click="switchPage('supplier')">
            <div class="qi-icon">🏢</div>
            <div class="qi-label">供应商匹配推荐</div>
            <div class="qi-desc">智能推荐优质供应商</div>
          </div>
          <div class="quick-item" @click="switchPage('analytics')">
            <div class="qi-icon">📈</div>
            <div class="qi-label">数据统计分析</div>
            <div class="qi-desc">采购数据多维分析</div>
          </div>
          <div class="quick-item" @click="switchPage('multilingual')">
            <div class="qi-icon">🌐</div>
            <div class="qi-label">跨语言支持</div>
            <div class="qi-desc">多语言文件转换</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">最近文件 <span class="more">查看全部 →</span></div>
        <div v-if="loading" class="loading-text">加载中...</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr><th>文件名称</th><th>类型</th><th>状态</th><th>创建时间</th><th>操作人</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="doc in recentDocuments" :key="doc._id">
                <td style="font-weight:500">{{ doc.name }}</td>
                <td><span class="tag" :class="doc.type === 'bid' ? 'tag-info' : 'tag-purple'">{{ doc.type === 'bid' ? '招标书' : '合同' }}</span></td>
                <td><span class="tag" :class="getStatusClass(doc.status)">{{ getStatusText(doc.status) }}</span></td>
                <td>{{ formatDate(doc.createdAt) }}</td>
                <td>{{ user?.userName || '未知' }}</td>
                <td>
                  <span class="link-btn" @click="viewDocument(doc)">查看</span>
                  <span class="link-btn" @click="exportPDF(doc)">导出PDF</span>
                </td>
              </tr>
              <tr v-if="recentDocuments.length === 0">
                <td colspan="6" style="text-align:center;color:#86909C;padding:24px;">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDocuments } from '../api/documents'
import { getRequirements } from '../api/requirements'
import { getAllRisks } from '../api/risk'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const documents = ref([])
const requirements = ref([])
const currentPage = ref('dashboard')
const loading = ref(true)

const generatedCount = computed(() => loading.value ? '--' : documents.value.length)
const publishedCount = computed(() => loading.value ? '--' : documents.value.filter(d => d.status === 'published').length)
const pendingCount = computed(() => loading.value ? '--' : documents.value.filter(d => d.status === 'pending').length)
const riskCount = computed(() => {
  if (loading.value) return '--'
  const stored = localStorage.getItem('riskCount')
  return stored !== null ? parseInt(stored) : 0
})
const recentDocuments = computed(() => documents.value.slice(0, 5))

const userInitial = computed(() => {
  return user.value?.userName?.charAt(0) || '用'
})

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日，${weekDay}`
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

const getStatusClass = (status) => {
  const classes = {
    'draft': 'tag-gray',
    'pending': 'tag-warning',
    'approved': 'tag-success',
    'published': 'tag-success',
    'risk': 'tag-danger'
  }
  return classes[status] || 'tag-gray'
}

const getStatusText = (status) => {
  const texts = {
    'draft': '草稿',
    'pending': '审批中',
    'approved': '已审批',
    'published': '已发布',
    'risk': '风险待处理'
  }
  return texts[status] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const viewDocument = (doc) => {
  if (doc.type === 'bid') {
    router.push('/bid-preview')
  } else {
    router.push('/contract-preview')
  }
}

const exportPDF = (doc) => {
  alert(`正在导出 ${doc.name} PDF...`)
}

onMounted(async () => {
  loading.value = true
  try {
    const [docsRes, reqsRes, risksRes] = await Promise.all([
      getDocuments(),
      getRequirements(),
      getAllRisks()
    ])
    documents.value = docsRes.data || docsRes || []
    requirements.value = reqsRes.data || reqsRes || []
    const risks = risksRes.data || risksRes || []
    localStorage.setItem('riskCount', String(risks.length))

    const pendingReqs = requirements.value.filter(r => r.status === 'pending')
    messages.value = pendingReqs.map((r, idx) => ({
      id: r._id || idx,
      title: `待审批需求：${r.title || '未命名需求'}`,
      time: r.createdAt ? formatDate(r.createdAt) : '刚刚',
      read: false
    }))
  } catch (error) {
    console.error('获取数据失败:', error)
    documents.value = []
    requirements.value = []
    messages.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #F2F3F5;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 220px;
  flex-shrink: 0;
}

.header-logo .logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(135deg, #165DFF, #4080FF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
}

.header-logo .logo-text {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  white-space: nowrap;
}

.header-search {
  position: relative;
}

.header-search input {
  width: 200px;
  height: 32px;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  padding: 0 12px 0 32px;
  font-size: 13px;
  outline: none;
  transition: border-color .2s;
}

.header-search input:focus {
  border-color: #165DFF;
}

.header-search::before {
  content: "🔍";
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-bell {
  position: relative;
  cursor: pointer;
  font-size: 18px;
}

.header-bell .badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #F53F3F;
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background .2s;
  position: relative;
}

.header-user:hover {
  background: #F2F3F5;
}

.header-user .avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165DFF, #722ED1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.header-user .name {
  font-size: 13px;
  color: #1D2129;
}

.header-user .arrow {
  color: #C9CDD4;
  font-size: 10px;
}

.user-dropdown { position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #E5E6EB; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 140px; padding: 6px 0; z-index: 1100; margin-top: 4px; }
.user-dropdown-item { padding: 8px 16px; font-size: 13px; color: #4E5969; cursor: pointer; transition: background .15s; }
.user-dropdown-item:hover { background: #F2F3F5; color: #165DFF; }

.sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  width: 220px;
  background: #fff;
  border-right: 1px solid #E5E6EB;
  overflow-y: auto;
  z-index: 900;
  padding-bottom: 20px;
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #C9CDD4;
  border-radius: 2px;
}

.nav-group {
  margin-bottom: 4px;
}

.nav-group-title {
  padding: 16px 20px 6px;
  font-size: 11px;
  color: #86909C;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  cursor: pointer;
  transition: all .15s;
  color: #4E5969;
  font-size: 13px;
  border-left: 3px solid transparent;
  margin: 1px 0;
}

.nav-item:hover {
  background: #F2F3F5;
  color: #1D2129;
}

.nav-item.active {
  background: #E8F3FF;
  color: #165DFF;
  border-left-color: #165DFF;
  font-weight: 500;
}

.nav-item .icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.nav-item .label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-divider {
  height: 1px;
  background: #E5E6EB;
  margin: 8px 20px;
}

.main {
  margin-left: 220px;
  margin-top: 56px;
  padding: 20px;
  min-height: calc(100vh - 56px);
}

.breadcrumb {
  margin-bottom: 16px;
  font-size: 13px;
  color: #86909C;
}

.breadcrumb a {
  color: #4E5969;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #165DFF;
}

.breadcrumb span {
  margin: 0 6px;
  color: #C9CDD4;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
}

.page-desc {
  font-size: 13px;
  color: #86909C;
  margin-top: 2px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all .15s;
  white-space: nowrap;
}

.btn-primary {
  background: #165DFF;
  color: #fff;
  border-color: #165DFF;
}

.btn-primary:hover {
  background: #4080FF;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.kpi-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.kpi-card::after {
  content: "";
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: .08;
}

.kpi-card.blue::after { background: #165DFF; }
.kpi-card.green::after { background: #00B42A; }
.kpi-card.orange::after { background: #FF7D00; }
.kpi-card.red::after { background: #F53F3F; }

.kpi-label {
  font-size: 13px;
  color: #86909C;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1D2129;
}

.kpi-card.blue .kpi-value { color: #165DFF; }
.kpi-card.green .kpi-value { color: #00B42A; }
.kpi-card.orange .kpi-value { color: #FF7D00; }
.kpi-card.red .kpi-value { color: #F53F3F; }

.kpi-change {
  font-size: 12px;
  margin-top: 6px;
}

.kpi-change.up { color: #00B42A; }
.kpi-change.down { color: #F53F3F; }

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.quick-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all .2s;
  border: 1px solid transparent;
}

.quick-item:hover {
  border-color: #165DFF;
  box-shadow: 0 4px 12px rgba(22,93,255,0.12);
  transform: translateY(-2px);
}

.quick-item .qi-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.quick-item .qi-label {
  font-size: 13px;
  color: #1D2129;
  font-weight: 500;
}

.quick-item .qi-desc {
  font-size: 11px;
  color: #86909C;
  margin-top: 4px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 20px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title .more {
  font-size: 12px;
  color: #86909C;
  font-weight: 400;
  cursor: pointer;
}

.card-title .more:hover {
  color: #165DFF;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead {
  background: #F7F8FA;
}

th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: #4E5969;
  white-space: nowrap;
  border-bottom: 1px solid #E5E6EB;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid #E5E6EB;
  color: #1D2129;
}

tbody tr {
  transition: background .15s;
}

tbody tr:hover {
  background: #F7F8FA;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.tag-success { background: #E8FFEA; color: #00B42A; }
.tag-warning { background: #FFF7E8; color: #FF7D00; }
.tag-danger { background: #FFECE8; color: #F53F3F; }
.tag-info { background: #E8F3FF; color: #165DFF; }
.tag-gray { background: #F2F3F5; color: #86909C; }
.tag-purple { background: #F5E8FF; color: #722ED1; }

.link-btn {
  color: #165DFF;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-right: 12px;
}

.link-btn:hover {
  text-decoration: underline;
}
.loading-text { text-align: center; padding: 24px; color: #86909C; font-size: 13px; }
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