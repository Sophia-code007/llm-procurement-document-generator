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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">合同预览</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">合同预览</div>
          <div class="page-desc">{{ contractPayload?.categoryName || '' }}合同 · 模板：{{ contractPayload?.template?.name || '' }} · 共 {{ totalFields }} 个字段</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="btn btn-default" @click="switchPage('contract-gen')">返回修改</button>
          <button class="btn btn-danger" @click="goToRiskCheck">风险检测</button>
          <button class="btn btn-primary" @click="exportWord">导出Word文档</button>
          <button class="btn btn-warning" @click="exportPDF">导出PDF</button>
          <button class="btn btn-success" @click="submitForApproval">提交审批</button>
          <label class="collab-toggle" title="开启后其他人可协同编辑此文件">
            <input type="checkbox" v-model="isCollabEnabled">
            <span>协同编辑</span>
          </label>
          <button class="btn btn-default" @click="showTranslatePanel = true">🌐 翻译</button>
        </div>
      </div>

      <div class="preview-layout">
        <div class="preview-sidebar">
          <div class="toc-list">
            <div class="toc-item active" @click="scrollToSection('section-header')">合同封面</div>
            <div
              class="toc-item"
              v-for="(g, i) in fieldGroups"
              :key="i"
              @click="scrollToSection('group-' + i)"
            >{{ g.title }}</div>
            <div class="toc-item" @click="scrollToSection('section-sign')">签署栏</div>
          </div>
        </div>

        <div class="preview-main">
          <div v-if="isCollabEnabled" class="collab-bar">
            <span>📝 协同编辑已开启</span>
            <button class="btn btn-default btn-sm" @click="showCollabSettings = true">权限设置</button>
            <button class="btn btn-default btn-sm" @click="showEditHistory = true">编辑记录</button>
          </div>
          <div class="doc-content">
            <div v-if="translatedContent" v-html="translatedContent"></div>
            <template v-else>
              <h1 id="section-header">{{ getCategoryName(contractPayload?.category) || '' }}采购合同</h1>
              <p style="text-align:center; margin-bottom:24px;">合同编号：{{ contractData.contractNo || '（待填写）' }}</p>

              <div v-for="(g, i) in fieldGroups" :key="i" :id="'group-' + i">
                <h2>{{ g.title }}</h2>
                <table>
                  <tr v-for="item in g.items" :key="item.key">
                    <th style="width:30%">{{ item.label }}</th>
                    <td>{{ contractData[item.key] || '（未填写）' }}</td>
                  </tr>
                </table>
              </div>

              <div id="section-sign" style="margin-top:40px; display:flex; justify-content:space-between;">
                <div style="text-align:center;">
                  <div style="font-weight:600; margin-bottom:20px;">甲方（盖章）：{{ contractData.purchaseOrgName || '（未填写）' }}</div>
                  <div>代表人（签字）：________________</div>
                  <div>日期：{{ contractData.signDate || new Date().toLocaleDateString() }}</div>
                </div>
                <div style="text-align:center;">
                  <div style="font-weight:600; margin-bottom:20px;">乙方（盖章）：{{ contractData.sellerName || '（未填写）' }}</div>
                  <div>代表人（签字）：________________</div>
                  <div>日期：________________</div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 翻译弹窗 -->
    <div v-if="showTranslatePanel" class="modal-overlay" @click.self="showTranslatePanel = false">
      <div class="modal-content" style="width:400px;">
        <div class="modal-header">
          <span class="modal-title">🌐 跨语言翻译</span>
          <span class="modal-close" @click="showTranslatePanel = false">×</span>
        </div>
        <div class="modal-body">
          <p style="font-size:13px;color:#4E5969;margin-bottom:16px;">请选择翻译后的目标语言：</p>
          <div class="lang-options">
            <div v-for="lang in languages" :key="lang.code" class="lang-option" :class="{ selected: selectedLang === lang.code }" @click="selectedLang = lang.code">
              <span class="lang-flag">{{ lang.flag }}</span>
              <span class="lang-name">{{ lang.name }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="showTranslatePanel = false">取消</button>
          <button class="btn btn-primary" :disabled="!selectedLang || translating" @click="doTranslate">
            {{ translating ? '翻译中...' : '开始翻译' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 协同编辑权限弹窗 -->
    <div v-if="showCollabSettings" class="modal-overlay" @click.self="showCollabSettings = false">
      <div class="modal-content" style="width:420px;">
        <div class="modal-header">
          <span class="modal-title">⚙️ 协同编辑权限设置</span>
          <span class="modal-close" @click="showCollabSettings = false">×</span>
        </div>
        <div class="modal-body">
          <div class="setting-item">
            <label>编辑权限</label>
            <select class="form-select" v-model="collabPermission">
              <option value="all">所有人可编辑</option>
              <option value="auth">仅授权用户可编辑</option>
              <option value="view">仅查看</option>
            </select>
          </div>
          <div class="setting-item">
            <label>邀请协作者</label>
            <input class="form-input" type="text" placeholder="输入用户名或邮箱，用逗号分隔">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="showCollabSettings = false">取消</button>
          <button class="btn btn-primary" @click="saveCollabSettings">保存设置</button>
        </div>
      </div>
    </div>

    <!-- 编辑记录弹窗 -->
    <div v-if="showEditHistory" class="modal-overlay" @click.self="showEditHistory = false">
      <div class="modal-content" style="width:480px;">
        <div class="modal-header">
          <span class="modal-title">📋 编辑记录</span>
          <span class="modal-close" @click="showEditHistory = false">×</span>
        </div>
        <div class="modal-body">
          <div class="history-list">
            <div v-for="(record, idx) in editRecords" :key="idx" class="history-item">
              <div class="history-user">{{ record.user }}</div>
              <div class="history-action">{{ record.action }}</div>
              <div class="history-time">{{ record.time }}</div>
            </div>
            <div v-if="editRecords.length === 0" class="empty-state" style="padding:20px;">
              <div class="es-text" style="font-size:13px;">暂无编辑记录</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="showEditHistory = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../api/axios'
import { generateFromTemplate, saveBlobAs, createDocument } from '../api/documents'
import { analyzeRisk } from '../api/risk'
import { contractFields } from '../utils/contractFields'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const contractPayload = ref(null)
const contractData = ref({})
const currentPage = ref('contract-preview')

// 协同编辑与翻译
const isCollabEnabled = ref(false)
const showCollabSettings = ref(false)
const showEditHistory = ref(false)
const collabPermission = ref('all')
const editRecords = ref([
  { user: '系统', action: '生成合同', time: '刚刚' }
])
const showTranslatePanel = ref(false)
const selectedLang = ref('')
const translating = ref(false)
const translatedContent = ref('')
const languages = ref([
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
])

const fieldGroups = computed(() => {
  if (!contractPayload.value || !contractPayload.value.fieldGroups) {
    return contractFields.map(g => ({ title: g.group, items: g.items.map(it => ({ key: it.key, label: it.label })) }))
  }
  return contractPayload.value.fieldGroups
})

const totalFields = computed(() => {
  return fieldGroups.value.reduce((s, g) => s + (g.items ? g.items.length : 0), 0)
})

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const switchPage = (page) => {
  currentPage.value = page
  router.push('/' + page)
}

const goToRiskCheck = () => {
  router.push('/risk-check')
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

const doTranslate = async () => {
  if (!selectedLang.value) return
  translating.value = true
  try {
    const { data } = await axios.post('/translate/document', {
      content: document.querySelector('.doc-content')?.innerHTML || '',
      targetLang: selectedLang.value,
      isHtml: true
    }, { timeout: 300000 })
    if (data?.translatedContent) {
      translatedContent.value = data.translatedContent
      showTranslatePanel.value = false
      const langName = languages.value.find(l => l.code === selectedLang.value)?.name || selectedLang.value
      alert(`已将文档翻译为 ${langName}`)
    } else {
      throw new Error('翻译结果为空')
    }
  } catch (error) {
    alert('翻译失败：' + (error.response?.data?.message || error.message || '未知错误'))
  } finally {
    translating.value = false
  }
}

const saveCollabSettings = () => {
  showCollabSettings.value = false
  alert('协同编辑权限设置已保存')
}

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const getCategoryName = (cat) => {
  const m = { goods: '货物类', engineering: '工程类', services: '服务类' }
  return m[cat] || ''
}

const getTemplateId = () => {
  const tpl = contractPayload.value?.template
  if (!tpl) return null
  return tpl._id || tpl.templateId || null
}

const buildExportData = () => {
  const data = { ...contractData.value }
  if (!data.purchaseProjectName && contractPayload.value?.template) {
    data.purchaseProjectName = contractPayload.value.template.name
  }
  return data
}

const exportWord = async () => {
  const templateId = getTemplateId()
  if (!templateId) {
    alert('未找到合同模板，无法导出')
    return
  }
  try {
    const data = buildExportData()
    const docName = (contractPayload.value?.template?.name || '合同') + '_' + (contractData.value.purchaseProjectName || Date.now())
    const res = await generateFromTemplate({
      templateId,
      data,
      outputType: 'word',
      fileName: docName
    })
    saveBlobAs(res, docName + '_' + Date.now() + '.docx')
  } catch (error) {
    console.error('下载失败', error)
    alert('下载失败：' + (error.message || '未知错误'))
  }
}

const exportPDF = async () => {
  const templateId = getTemplateId()
  if (!templateId) {
    alert('未找到合同模板，无法导出')
    return
  }
  try {
    const data = buildExportData()
    const docName = (contractPayload.value?.template?.name || '合同') + '_' + (contractData.value.purchaseProjectName || Date.now())
    const res = await generateFromTemplate({
      templateId,
      data,
      outputType: 'pdf',
      fileName: docName
    })
    const blob = res instanceof Blob ? res : new Blob([res], { type: 'text/html; charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (!win) {
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    setTimeout(function() { window.URL.revokeObjectURL(url) }, 60000)
  } catch (error) {
    console.error('导出PDF失败', error)
    alert('导出PDF失败：' + (error.message || '未知错误'))
  }
}

const submitForApproval = async () => {
  if (!confirm('确定要提交审批吗？')) return
  try {
    await createDocument({
      name: (contractPayload.value?.template?.name || '合同') + '_' + (contractData.value.purchaseProjectName || ''),
      type: 'contract',
      content: JSON.stringify(contractData.value),
      status: 'pending',
      templateId: contractPayload.value?.template?._id,
      requirementId: 'temp'
    })
    alert('合同已提交审批')
    router.push('/dashboard')
  } catch (error) {
    alert('提交失败：' + (error.response?.data?.msg || error.response?.data?.message || '未知错误'))
  }
}

const autoRiskCheck = async () => {
  try {
    if (!contractData.value || Object.keys(contractData.value).length === 0) return
    const result = await analyzeRisk({
      docType: 'contract',
      data: contractData.value,
      docId: 'contract-' + Date.now()
    })
    localStorage.setItem('lastRiskCheck', JSON.stringify({
      docType: 'contract',
      docName: contractData.value.purchaseProjectName || contractData.value.projectName || '未命名合同',
      risks: result.risks,
      summary: result.summary,
      timestamp: new Date().toISOString()
    }))
    console.log('合同风险检测完成，发现', result.summary.total, '条风险')
  } catch (error) {
    console.error('自动风险检测失败', error)
  }
}

onMounted(() => {
  const saved = localStorage.getItem('contractData')
  if (saved) {
    try {
      contractPayload.value = JSON.parse(saved)
      contractData.value = contractPayload.value.fields || {}
    } catch (e) {
      console.error('合同数据解析失败', e)
    }
  }
  const opts = localStorage.getItem('contractOptions')
  if (opts && !contractData.value.purchaseProjectName) {
    try {
      contractData.value = { ...contractData.value, ...JSON.parse(opts) }
    } catch (e) {}
  }
  // 自动触发风险检测
  autoRiskCheck()
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
.btn-danger { background: #F53F3F; color: #fff; border-color: #F53F3F; }
.btn-danger:hover { background: #F76560; }
.btn-warning { background: #FF7D00; color: #fff; border-color: #FF7D00; }
.btn-warning:hover { background: #FF9626; }
.btn-sm { padding: 4px 10px; font-size: 12px; }

.preview-layout { display: flex; gap: 16px; }
.preview-sidebar { width: 220px; flex-shrink: 0; }
.preview-main { flex: 1; min-width: 0; }

.toc-list { background: #F7F8FA; border-radius: 8px; padding: 12px; max-height: 75vh; overflow-y: auto; }
.toc-item { padding: 6px 12px; font-size: 12px; color: #4E5969; cursor: pointer; border-radius: 4px; margin-bottom: 2px; transition: all .15s; }
.toc-item:hover { background: #E8F3FF; color: #165DFF; }
.toc-item.active { background: #E8F3FF; color: #165DFF; font-weight: 500; }

.doc-content { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 40px; min-height: 600px; max-height: 80vh; overflow-y: auto; }
.doc-content h1 { font-size: 22px; text-align: center; color: #1D2129; margin-bottom: 8px; padding-bottom: 16px; border-bottom: 2px solid #165DFF; }
.doc-content h2 { font-size: 16px; color: #1D2129; margin: 24px 0 12px; padding-left: 10px; border-left: 3px solid #165DFF; }
.doc-content h3 { font-size: 14px; color: #4E5969; margin: 16px 0 8px; }
.doc-content p { font-size: 13px; color: #4E5969; line-height: 1.8; margin-bottom: 12px; }
.doc-content table { border: 1px solid #E5E6EB; margin: 8px 0; border-radius: 4px; width: 100%; border-collapse: collapse; }
.doc-content td, .doc-content th { padding: 8px 12px; font-size: 12px; border: 1px solid #E5E6EB; }
.doc-content th { background: #F7F8FA; font-weight: 600; text-align: left; width: 30%; color: #1D2129; }
.doc-content td { color: #4E5969; }
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

.collab-bar { background: #E8F3FF; border: 1px solid #165DFF; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; font-size: 13px; color: #165DFF; }
.collab-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #4E5969; cursor: pointer; user-select: none; }
.collab-toggle input { cursor: pointer; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1200; }
.modal-content { background: #fff; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #E5E6EB; }
.modal-title { font-size: 15px; font-weight: 600; color: #1D2129; }
.modal-close { font-size: 20px; color: #86909C; cursor: pointer; line-height: 1; }
.modal-close:hover { color: #1D2129; }
.modal-body { padding: 16px; max-height: 60vh; overflow-y: auto; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 12px 16px; border-top: 1px solid #E5E6EB; }

.lang-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.lang-option { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #E5E6EB; border-radius: 6px; cursor: pointer; transition: all .15s; }
.lang-option:hover { border-color: #165DFF; background: #F5F9FF; }
.lang-option.selected { border-color: #165DFF; background: #E8F3FF; color: #165DFF; font-weight: 500; }
.lang-flag { font-size: 20px; }
.lang-name { font-size: 13px; }

.setting-item { margin-bottom: 14px; }
.setting-item label { display: block; font-size: 13px; color: #4E5969; margin-bottom: 6px; font-weight: 500; }
.form-select, .form-input { width: 100%; height: 36px; border: 1px solid #E5E6EB; border-radius: 4px; padding: 0 10px; font-size: 13px; outline: none; }
.form-select:focus, .form-input:focus { border-color: #165DFF; }

.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #F7F8FA; border-radius: 6px; font-size: 13px; }
.history-user { font-weight: 600; color: #1D2129; width: 80px; flex-shrink: 0; }
.history-action { flex: 1; color: #4E5969; }
.history-time { color: #86909C; font-size: 12px; width: 70px; text-align: right; flex-shrink: 0; }
</style>
