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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">模板选择</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">选择模板</div>
          <div class="page-desc">请选择招标文件的类型和模板</div>
        </div>
      </div>

      <div class="tpl-progress-bar">
        <div class="tpl-progress-step current">
          选择招标模板（当前）
        </div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step">
          录入需求
        </div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step">
          字段确认
        </div>
        <span class="tpl-progress-arrow">→</span>
        <div class="tpl-progress-step">
          生成文件
        </div>
      </div>

      <div class="card">
        <div class="card-title">选择采购类型</div>
        <div class="category-grid">
          <div 
            class="category-card" 
            :class="{ selected: selectedCategory === 'goods', 'cat-goods': true }"
            @click="selectCategory('goods')"
          >
            <div class="cat-icon">📦</div>
            <div class="cat-name">货物类招标</div>
            <div class="cat-desc">适用于各类货物招标项目，包括办公设备、IT产品、原材料等采购招标</div>
            <div class="cat-tags">
              <span class="tag tag-info">办公设备</span>
              <span class="tag tag-info">IT产品</span>
              <span class="tag tag-info">原材料</span>
            </div>
            <div v-if="templates.goods?.length" class="cat-recommend">推荐</div>
          </div>
          <div 
            class="category-card" 
            :class="{ selected: selectedCategory === 'engineering', 'cat-engineering': true }"
            @click="selectCategory('engineering')"
          >
            <div class="cat-icon">🏗️</div>
            <div class="cat-name">工程类招标</div>
            <div class="cat-desc">适用于各类工程招标项目，包括建筑施工、基础设施建设等工程招标</div>
            <div class="cat-tags">
              <span class="tag tag-warning">建筑施工</span>
              <span class="tag tag-warning">基础设施</span>
              <span class="tag tag-warning">装修改造</span>
            </div>
            <div v-if="templates.engineering?.length" class="cat-recommend">推荐</div>
          </div>
          <div 
            class="category-card" 
            :class="{ selected: selectedCategory === 'services', 'cat-services': true }"
            @click="selectCategory('services')"
          >
            <div class="cat-icon">💼</div>
            <div class="cat-name">服务类招标</div>
            <div class="cat-desc">适用于各类服务招标项目，包括物业管理、咨询服务、技术服务等服务招标</div>
            <div class="cat-tags">
              <span class="tag tag-success">物业管理</span>
              <span class="tag tag-success">咨询服务</span>
              <span class="tag tag-success">技术服务</span>
            </div>
            <div v-if="templates.services?.length" class="cat-recommend">推荐</div>
          </div>
        </div>
      </div>

      <div v-if="selectedCategory && subTemplates.length" class="card">
        <div class="card-title">选择模板 <span style="font-weight:normal;color:#86909c;font-size:12px;">（已自动推荐默认模板，可手动切换）</span></div>
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
            <div class="sub-tpl-id">{{ tpl._id }}</div>
            <div class="sub-tpl-chapters">
              <b>包含章节：</b>{{ (tpl.sections || []).join('、') }}
            </div>
            <div class="sub-tpl-tags">
              <span class="tag tag-gray">{{ (tpl.sections || []).length }}个章节</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedTemplate" class="card">
        <div class="card-title">已选模板信息</div>
        <div class="field-list">
          <div class="field-item">
            <span class="fi-label"><b>模板名称</b></span>
            <span class="fi-value">{{ selectedTemplate.name }}</span>
          </div>
          <div class="field-item">
            <span class="fi-label"><b>模板编号</b></span>
            <span class="fi-value">{{ selectedTemplate._id }}</span>
          </div>
          <div class="field-item">
            <span class="fi-label"><b>采购类型</b></span>
            <span class="fi-value">{{ getCategoryName(selectedTemplate.category) }}</span>
          </div>
          <div class="field-item">
            <span class="fi-label"><b>文件类型</b></span>
            <span class="fi-value">{{ selectedTemplate.type === 'bid' ? '招标文件' : '合同文件' }}</span>
          </div>
          <div class="field-item">
            <span class="fi-label"><b>章节数量</b></span>
            <span class="fi-value">{{ (selectedTemplate.sections || []).length }}个章节</span>
          </div>
        </div>
        <div style="margin-top:16px; text-align:right;">
          <button class="btn btn-default" @click="resetSelection">重新选择</button>
          <button class="btn btn-primary" style="margin-left:10px" @click="confirmTemplate">确认并进入需求录入 →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTemplates } from '../api/templates'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const templates = ref({ goods: [], engineering: [], services: [] })
const selectedCategory = ref('')
const selectedTemplate = ref(null)
const currentPage = ref('template')

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const subTemplates = computed(() => {
  if (!selectedCategory.value) return []
  return (templates.value[selectedCategory.value] || []).filter(t => t.type === 'bid')
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

const getCategoryName = (category) => {
  const names = { goods: '货物类', engineering: '工程类', services: '服务类' }
  return names[category] || category
}

const selectCategory = (category) => {
  selectedCategory.value = category
  // 自动选中该类型下的第一个招标模板（bid），没有则选第一个
  const list = templates.value[category] || []
  const defaultTpl = list.find(t => t.type === 'bid') || list[0]
  selectedTemplate.value = defaultTpl || null
}

const selectTemplate = (tpl) => {
  selectedTemplate.value = tpl
}

const resetSelection = () => {
  selectedCategory.value = ''
  selectedTemplate.value = null
}

const confirmTemplate = () => {
  localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate.value))
  localStorage.setItem('selectedCategory', selectedCategory.value)
  router.push('/requirement')
}

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
.header-user .avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #165DFF, #722ED1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
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
.btn-default { background: #fff; color: #4E5969; border-color: #E5E6EB; }
.btn-default:hover { border-color: #165DFF; color: #165DFF; }
.btn-sm { padding: 3px 10px; font-size: 12px; }

.tpl-progress-bar { display: flex; align-items: center; gap: 0; margin-bottom: 24px; background: #F7F8FA; border-radius: 8px; padding: 12px 20px; }
.tpl-progress-step { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #86909C; white-space: nowrap; }
.tpl-progress-step.current { color: #165DFF; font-weight: 600; }
.tpl-progress-arrow { color: #C9CDD4; margin: 0 12px; font-size: 14px; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

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
.cat-recommend { position: absolute; top: 12px; right: 12px; background: #FF7D00; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 10px; }

.tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap; }
.tag-info { background: #E8F3FF; color: #165DFF; }
.tag-warning { background: #FFF7E8; color: #FF7D00; }
.tag-success { background: #E8FFEA; color: #00B42A; }
.tag-gray { background: #F2F3F5; color: #86909C; }

.sub-template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.sub-tpl-card { background: #fff; border-radius: 10px; border: 1px solid #E5E6EB; padding: 20px; cursor: pointer; transition: all .2s; }
.sub-tpl-card:hover { border-color: #165DFF; box-shadow: 0 4px 16px rgba(22,93,255,0.1); }
.sub-tpl-card.selected { border-color: #165DFF; background: #F0F7FF; }
.sub-tpl-type { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.sub-tpl-type.bid { background: #E8F3FF; color: #165DFF; }
.sub-tpl-type.contract { background: #E8FFEA; color: #00B42A; }
.sub-tpl-name { font-size: 15px; font-weight: 600; color: #1D2129; }
.sub-tpl-desc { font-size: 12px; color: #86909C; margin-bottom: 10px; }
.sub-tpl-id { font-size: 11px; color: #165DFF; background: #E8F3FF; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 10px; }
.sub-tpl-chapters { font-size: 11px; color: #86909C; line-height: 1.6; padding: 8px 12px; background: #F7F8FA; border-radius: 6px; margin-bottom: 12px; }
.sub-tpl-chapters b { color: #4E5969; }
.sub-tpl-tags { display: flex; gap: 6px; flex-wrap: wrap; }

.field-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.field-item { background: #F7F8FA; border-radius: 6px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
.field-item .fi-label { font-size: 13px; color: #4E5969; }
.field-item .fi-label b { color: #1D2129; }
.field-item .fi-value { font-size: 13px; color: #1D2129; font-weight: 500; }
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