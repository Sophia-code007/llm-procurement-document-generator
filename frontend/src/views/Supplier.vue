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
          <div class="avatar">{{ userInitial }}</div>
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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">供应商匹配推荐</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">供应商匹配推荐</div>
          <div class="page-desc">基于采购需求智能匹配优质供应商</div>
        </div>
        <button class="btn btn-primary" @click="runMatching">开始匹配</button>
      </div>

      <div class="card">
        <div class="card-title">匹配条件</div>
        <div class="condition-tags">
          <div class="condition-tag">
            <span class="ct-key">采购类型：</span>
            <span>{{ matchCondition.category || '未选择' }}</span>
            <span class="ct-remove" @click="matchCondition.category = ''">×</span>
          </div>
          <div class="condition-tag">
            <span class="ct-key">预算范围：</span>
            <span>{{ matchCondition.budget || '不限' }}</span>
            <span class="ct-remove" @click="matchCondition.budget = ''">×</span>
          </div>
          <div class="condition-tag">
            <span class="ct-key">评分要求：</span>
            <span>{{ matchCondition.minScore || '不限' }}分以上</span>
            <span class="ct-remove" @click="matchCondition.minScore = ''">×</span>
          </div>
        </div>
        <div class="req-field-row" style="margin-top:16px;">
          <div class="req-field">
            <div class="req-label">采购类型</div>
            <select class="form-select" v-model="matchCondition.category">
              <option value="">请选择</option>
              <option value="goods">货物类</option>
              <option value="engineering">工程类</option>
              <option value="services">服务类</option>
            </select>
          </div>
          <div class="req-field">
            <div class="req-label">最低评分</div>
            <select class="form-select" v-model="matchCondition.minScore">
              <option value="">不限</option>
              <option value="80">80分以上</option>
              <option value="85">85分以上</option>
              <option value="90">90分以上</option>
              <option value="95">95分以上</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">匹配结果 <span style="font-weight:400;">（共{{ suppliers.length }}家供应商）</span></div>
        <div v-if="suppliers.length === 0" class="empty-state">
          <div class="es-icon">🏢</div>
          <div class="es-text">暂无匹配结果，请设置匹配条件后点击开始匹配</div>
        </div>
        <div v-else class="supplier-grid">
          <div class="supplier-card" v-for="supplier in suppliers" :key="supplier._id">
            <div class="sc-header">
              <div class="sc-logo">{{ supplier.name.charAt(0) }}</div>
              <div>
                <div class="sc-name">{{ supplier.name }}</div>
                <div class="sc-cat">{{ getCategoryName(supplier.category) }}</div>
              </div>
            </div>
            <div class="sc-score">
              <span class="score-num">{{ supplier.score }}</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: supplier.score + '%' }"></div>
              </div>
            </div>
            <div class="sc-tags">
              <span v-for="tag in supplier.tags" :key="tag" class="tag tag-info">{{ tag }}</span>
            </div>
            <div class="sc-info">
              <span>联系人：<span>{{ supplier.contactPerson || '未填写' }}</span></span>
              <span>电话：<span>{{ supplier.contactPhone || '未填写' }}</span></span>
            </div>
            <button class="btn btn-primary btn-sm" style="margin-top:12px; width:100%;">选择此供应商</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSuppliers } from '../api/suppliers'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const suppliers = ref([])
const currentPage = ref('supplier')

const matchCondition = ref({
  category: '',
  budget: '',
  minScore: ''
})

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

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

const getCategoryName = (category) => {
  const names = { goods: '货物类', engineering: '工程类', services: '服务类' }
  return names[category] || category
}

const runMatching = async () => {
  try {
    let data = await getSuppliers()
    if (matchCondition.value.category) {
      data = data.filter(s => s.category === matchCondition.value.category)
    }
    if (matchCondition.value.minScore) {
      data = data.filter(s => s.score >= parseInt(matchCondition.value.minScore))
    }
    suppliers.value = data.sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error('获取供应商失败:', error)
  }
}

onMounted(async () => {
  try {
    suppliers.value = await getSuppliers()
  } catch (error) {
    console.error('获取供应商失败:', error)
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
.header-user .avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #165DFF, #722ED1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
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
.btn-sm { padding: 3px 10px; font-size: 12px; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

.condition-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.condition-tag { display: flex; align-items: center; gap: 4px; padding: 4px 12px; background: #F2F3F5; border-radius: 20px; font-size: 12px; color: #4E5969; }
.condition-tag .ct-key { color: #86909C; }
.condition-tag .ct-remove { cursor: pointer; color: #C9CDD4; margin-left: 4px; }
.condition-tag .ct-remove:hover { color: #F53F3F; }

.req-field-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.req-field { margin-bottom: 14px; }
.req-field .req-label { font-size: 12px; color: #4E5969; margin-bottom: 5px; font-weight: 500; }
.form-select { width: 100%; height: 36px; border: 1px solid #E5E6EB; border-radius: 4px; padding: 0 12px; font-size: 13px; color: #1D2129; outline: none; appearance: auto; }
.form-select:focus { border-color: #165DFF; box-shadow: 0 0 0 2px rgba(22,93,255,0.1); }

.empty-state { text-align: center; padding: 48px 20px; color: #86909C; }
.empty-state .es-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state .es-text { font-size: 14px; margin-bottom: 16px; }

.supplier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.supplier-card { background: #fff; border-radius: 8px; border: 1px solid #E5E6EB; padding: 20px; transition: all .2s; }
.supplier-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.supplier-card .sc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.supplier-card .sc-logo { width: 44px; height: 44px; border-radius: 8px; background: #F7F8FA; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #165DFF; }
.supplier-card .sc-name { font-size: 14px; font-weight: 600; color: #1D2129; }
.supplier-card .sc-cat { font-size: 11px; color: #86909C; margin-top: 2px; }
.supplier-card .sc-score { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.supplier-card .sc-score .score-num { font-size: 22px; font-weight: 700; color: #165DFF; }
.supplier-card .sc-score .score-bar { flex: 1; height: 6px; background: #E5E6EB; border-radius: 3px; overflow: hidden; }
.supplier-card .sc-score .score-fill { height: 100%; background: linear-gradient(90deg, #165DFF, #4080FF); border-radius: 3px; }
.supplier-card .sc-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.supplier-card .sc-info { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px; color: #86909C; }
.supplier-card .sc-info span:last-child { color: #1D2129; }

.tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap; }
.tag-info { background: #E8F3FF; color: #165DFF; }
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
=======
  <div class="placeholder-page">
    <el-card class="placeholder-card">
      <el-icon :size="64" color="#cbd5e1"><OfficeBuilding /></el-icon>
      <h2 class="placeholder-title">供应商推荐</h2>
      <p class="placeholder-desc">基于项目需求智能推荐优质供应商</p>
      <el-tag type="info">功能开发中</el-tag>
    </el-card>
  </div>
</template>

<script setup></script>

<style scoped>
.placeholder-page { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
.placeholder-card { text-align: center; padding: 48px 64px; border-radius: 16px; min-width: 400px; }
.placeholder-title { font-size: 20px; font-weight: 600; color: #0f172a; margin: 20px 0 8px; }
.placeholder-desc { color: #64748b; font-size: 14px; margin-bottom: 20px; }
</style>
>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
