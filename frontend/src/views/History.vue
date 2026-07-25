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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">历史文件复用</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">历史文件复用</div>
          <div class="page-desc">查看和复用历史采购文件</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">历史文件列表</div>
        <div class="table-wrap">
          <div v-if="loading" class="loading-wrap">
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中...</div>
          </div>
          <div v-else-if="historyDocs.length === 0" class="empty-state">
            <div class="empty-icon">📁</div>
            <div class="empty-text">暂无历史文件，去生成一个吧</div>
            <button class="btn btn-primary" @click="switchPage('requirement')">新建招标书</button>
          </div>
          <template v-else>
            <table>
              <thead>
                <tr><th>文件名称</th><th>类型</th><th>创建时间</th><th>操作</th></tr>
              </thead>
              <tbody>
                <tr v-for="doc in historyDocs" :key="doc.id">
                  <td style="font-weight:500">{{ doc.name }}</td>
                  <td><span class="tag" :class="doc.type === 'bid' ? 'tag-info' : 'tag-purple'">{{ doc.type === 'bid' ? '招标书' : '合同' }}</span></td>
                  <td>{{ doc.date }}</td>
                  <td>
                    <span class="link-btn" @click="viewDoc(doc)">查看</span>
                    <span class="link-btn" @click="reuseDoc(doc)">复用</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDocuments } from '../api/documents'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const currentPage = ref('history')
const historyDocs = ref([])
const loading = ref(false)

const loadDocuments = async () => {
  loading.value = true
  try {
    const docs = await getDocuments()
    historyDocs.value = docs.map(doc => ({
      id: doc._id,
      name: doc.title || doc.filename || doc.name || '未命名文件',
      type: doc.type === 'contract' ? 'contract' : 'bid',
      date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('zh-CN') : '未知时间',
      data: doc
    }))
  } catch (error) {
    console.error('加载历史文件失败:', error)
    historyDocs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDocuments()
})

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const switchPage = (page) => {
  currentPage.value = page
  router.push(`/${page}`)
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
  alert('消息中心功能开发中')
}

const viewDoc = (doc) => {
  localStorage.setItem('previewDocId', doc.id)

  if (doc.type === 'bid') {
    const reqData = doc.data?.data || { projectName: doc.name }
    localStorage.setItem('requirementData', JSON.stringify(reqData))
    localStorage.setItem('selectedTemplate', JSON.stringify({
      _id: doc.data?.templateId || 'template1',
      name: doc.data?.templateName || doc.name,
      type: 'bid',
      category: doc.data?.category || 'goods'
    }))
    if (doc.data?.content) {
      localStorage.setItem('bidPreviewContent', doc.data.content)
    } else {
      localStorage.removeItem('bidPreviewContent')
    }
    router.push('/bid-preview')
  } else {
    const fields = doc.data?.data || {}
    localStorage.setItem('contractData', JSON.stringify({
      fields,
      template: {
        name: doc.data?.templateName || doc.name,
        _id: doc.data?.templateId || 'template4'
      },
      fieldGroups: [],
      category: doc.data?.category || 'goods',
      _historical: true,
      content: doc.data?.content || ''
    }))
    router.push('/contract-preview')
  }
}

const reuseDoc = (doc) => {
  if (doc.type === 'bid') {
    const reqData = doc.data?.data || { projectName: doc.name }
    localStorage.setItem('requirementData', JSON.stringify(reqData))
    localStorage.setItem('requirementFormData', JSON.stringify(reqData))
    localStorage.setItem('selectedTemplate', JSON.stringify({
      _id: doc.data?.templateId || 'template1',
      name: doc.data?.templateName || doc.name,
      type: 'bid',
      category: doc.data?.category || 'goods'
    }))
    router.push('/requirement')
  } else {
    const fields = doc.data?.data || {}
    localStorage.setItem('contractData', JSON.stringify({
      fields,
      template: {
        name: doc.data?.templateName || doc.name,
        _id: doc.data?.templateId || 'template4'
      },
      fieldGroups: [],
      category: doc.data?.category || 'goods',
      _historical: true
    }))
    router.push('/contract-gen')
  }
}
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
.header-bell .badge { position: absolute; top: -4px; right: -6px; background: #F53F3F; color: #fff; font-size: 10px; min-width: 16px; height: 16px; border-radius: 8px; }
.header-user { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 8px; border-radius: 4px; position: relative; }
.header-user:hover { background: #F2F3F5; }
.header-user .avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #165DFF, #722ED1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.header-user .name { font-size: 13px; color: #1D2129; }
.header-user .arrow { color: #C9CDD4; font-size: 10px; }
.user-dropdown { position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #E5E6EB; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 140px; padding: 6px 0; z-index: 1100; margin-top: 4px; }
.user-dropdown-item { padding: 8px 16px; font-size: 13px; color: #4E5969; cursor: pointer; transition: background .15s; }
.user-dropdown-item:hover { background: #F2F3F5; color: #165DFF; }
.sidebar { position: fixed; top: 56px; left: 0; bottom: 0; width: 220px; background: #fff; border-right: 1px solid #E5E6EB; z-index: 900; }
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
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1D2129; }
.page-desc { font-size: 13px; color: #86909C; margin-top: 2px; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead { background: #F7F8FA; }
th { padding: 10px 12px; text-align: left; font-weight: 600; color: #4E5969; white-space: nowrap; border-bottom: 1px solid #E5E6EB; }
td { padding: 10px 12px; border-bottom: 1px solid #E5E6EB; color: #1D2129; }
tbody tr:hover { background: #F7F8FA; }

.tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.tag-info { background: #E8F3FF; color: #165DFF; }
.tag-purple { background: #F5E8FF; color: #722ED1; }

.link-btn { color: #165DFF; cursor: pointer; font-size: 12px; margin-right: 12px; }
.link-btn:hover { text-decoration: underline; }
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

.loading-wrap { padding: 40px 0; text-align: center; color: #86909C; font-size: 13px; }
.loading-spinner { width: 32px; height: 32px; border: 3px solid #E5E6EB; border-top-color: #165DFF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { padding: 60px 0; text-align: center; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-size: 14px; color: #86909C; margin-bottom: 20px; }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid transparent; transition: all .15s; }
.btn-primary { background: #165DFF; color: #fff; border-color: #165DFF; }
.btn-primary:hover { background: #4080FF; }
</style>