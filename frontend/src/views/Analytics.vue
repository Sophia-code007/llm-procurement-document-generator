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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">数据统计分析</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">数据统计分析</div>
          <div class="page-desc">采购文件数据可视化分析</div>
        </div>
        <div class="date-filter">
          <span>时间范围：</span>
          <select class="form-select" v-model="timeRange">
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
          </select>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card blue">
          <div class="kpi-label">总文件数</div>
          <div class="kpi-value">156</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-label">招标书</div>
          <div class="kpi-value">89</div>
        </div>
        <div class="kpi-card orange">
          <div class="kpi-label">合同</div>
          <div class="kpi-value">67</div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-label">风险文件</div>
          <div class="kpi-value">8</div>
        </div>
      </div>

      <div class="chart-row">
        <div class="card chart-card">
          <div class="card-title">文件类型分布</div>
          <div class="pie-chart">
            <svg viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="#165DFF" stroke="#fff" stroke-width="4" style="transform: rotate(-90deg); transform-origin: 100px 100px; clip-path: inset(0 0 0 50%);" />
              <circle cx="100" cy="100" r="80" fill="#722ED1" stroke="#fff" stroke-width="4" style="transform: rotate(-90deg); transform-origin: 100px 100px; clip-path: inset(50% 0 0 0);" />
              <circle cx="100" cy="100" r="80" fill="#00B42A" stroke="#fff" stroke-width="4" style="transform: rotate(68.4deg); transform-origin: 100px 100px; clip-path: inset(0 50% 0 0);" />
              <circle cx="100" cy="100" r="60" fill="#fff" />
            </svg>
            <div class="pie-legend">
              <div><span class="legend-dot blue"></span>招标书 57%</div>
              <div><span class="legend-dot purple"></span>合同 43%</div>
            </div>
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-title">月度趋势</div>
          <div class="bar-chart">
            <div class="bar" v-for="(val, idx) in monthlyData" :key="idx">
              <div class="bar-fill" :style="{ height: (val / 40 * 100) + '%' }"></div>
              <div class="bar-label">{{ months[idx] }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">部门统计</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>部门</th><th>文件数</th><th>招标书</th><th>合同</th><th>占比</th></tr>
            </thead>
            <tbody>
              <tr v-for="dept in deptData" :key="dept.name">
                <td style="font-weight:500">{{ dept.name }}</td>
                <td>{{ dept.total }}</td>
                <td>{{ dept.bid }}</td>
                <td>{{ dept.contract }}</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: dept.percent + '%' }"></div>
                  </div>
                  <span style="margin-left:8px;">{{ dept.percent }}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const timeRange = ref('month')
const currentPage = ref('analytics')

const months = ['1月', '2月', '3月', '4月', '5月', '6月']
const monthlyData = [28, 35, 22, 38, 25, 32]

const deptData = ref([
  { name: '采购部', total: 56, bid: 32, contract: 24, percent: 36 },
  { name: '财务部', total: 32, bid: 18, contract: 14, percent: 21 },
  { name: '技术部', total: 28, bid: 20, contract: 8, percent: 18 },
  { name: '行政部', total: 24, bid: 12, contract: 12, percent: 15 },
  { name: '其他', total: 16, bid: 7, contract: 9, percent: 10 }
])

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

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
.date-filter { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4E5969; }
.form-select { height: 32px; border: 1px solid #E5E6EB; border-radius: 4px; padding: 0 8px; font-size: 12px; }

.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.kpi-card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; }
.kpi-card .kpi-label { font-size: 13px; color: #86909C; margin-bottom: 8px; }
.kpi-card .kpi-value { font-size: 28px; font-weight: 700; }
.kpi-card.blue .kpi-value { color: #165DFF; }
.kpi-card.green .kpi-value { color: #00B42A; }
.kpi-card.orange .kpi-value { color: #FF7D00; }
.kpi-card.red .kpi-value { color: #F53F3F; }

.chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

.pie-chart { display: flex; align-items: center; gap: 32px; }
.pie-chart svg { width: 160px; height: 160px; }
.pie-legend { font-size: 13px; }
.pie-legend div { margin-bottom: 8px; }
.legend-dot { display: inline-block; width: 12px; height: 12px; border-radius: 4px; margin-right: 8px; }
.legend-dot.blue { background: #165DFF; }
.legend-dot.purple { background: #722ED1; }

.bar-chart { display: flex; align-items: flex-end; justify-content: space-around; height: 160px; padding-top: 20px; border-bottom: 1px solid #E5E6EB; }
.bar-chart .bar { display: flex; flex-direction: column; align-items: center; width: 32px; }
.bar-chart .bar-fill { width: 100%; background: linear-gradient(180deg, #165DFF, #4080FF); border-radius: 4px 4px 0 0; transition: height .3s; }
.bar-chart .bar-label { font-size: 11px; color: #86909C; margin-top: 8px; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead { background: #F7F8FA; }
th { padding: 10px 12px; text-align: left; font-weight: 600; color: #4E5969; border-bottom: 1px solid #E5E6EB; }
td { padding: 10px 12px; border-bottom: 1px solid #E5E6EB; color: #1D2129; }
tbody tr:hover { background: #F7F8FA; }
.progress-bar { display: inline-block; width: 100px; height: 6px; background: #E5E6EB; border-radius: 3px; overflow: hidden; vertical-align: middle; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #165DFF, #4080FF); border-radius: 3px; }
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