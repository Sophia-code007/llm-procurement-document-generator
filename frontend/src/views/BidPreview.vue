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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">招标书预览</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">招标书预览</div>
          <div class="page-desc">预览生成的招标文件内容</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="btn btn-default" @click="switchPage('field-confirm')">返回修改</button>
          <button class="btn btn-primary" @click="exportWord">导出Word</button>
          <button class="btn btn-warning" @click="exportPDF">导出PDF</button>
          <button class="btn btn-success" @click="publishBid">发布招标书</button>
          <label class="collab-toggle" title="开启后其他人可协同编辑此文件">
            <input type="checkbox" v-model="isCollabEnabled">
            <span>协同编辑</span>
          </label>
          <button class="btn btn-default" @click="showTranslatePanel = true">🌐 翻译</button>
          <button v-if="translatedContent" class="btn btn-default" @click="restoreOriginal">恢复原文</button>
        </div>
      </div>

      <!-- 风险检测结果提示 -->
      <div v-if="riskLoading" class="risk-panel risk-loading">
        <span class="risk-icon">🔍</span>
        <span>风险检测中...</span>
      </div>
      <div v-else-if="riskCheckResult" class="risk-panel" :class="{ 'risk-high': riskCheckResult.summary.high > 0, 'risk-medium': riskCheckResult.summary.high === 0 && riskCheckResult.summary.medium > 0, 'risk-safe': riskCheckResult.summary.total === 0 }">
        <span class="risk-icon">{{ riskCheckResult.summary.total === 0 ? '✅' : (riskCheckResult.summary.high > 0 ? '⚠️' : '⚠️') }}</span>
        <span class="risk-text">
          风险检测完成：共发现 {{ riskCheckResult.summary.total }} 条风险（高风险 {{ riskCheckResult.summary.high }} 条，中风险 {{ riskCheckResult.summary.medium }} 条，低风险 {{ riskCheckResult.summary.low }} 条）
        </span>
        <button v-if="riskCheckResult.summary.total > 0" class="btn btn-sm btn-default" @click="showRiskDetails = true">查看详情</button>
      </div>

      <div class="preview-layout">
        <div class="preview-sidebar">
          <div class="toc-list">
            <div v-for="(section, index) in tocSections" :key="index" class="toc-item" :class="{ active: activeSection === index }" @click="scrollToSection('section-' + index)">
              {{ section }}
            </div>
          </div>
        </div>

        <div class="preview-main">
          <div v-if="!hasData" class="doc-content empty-state">
            <div style="text-align:center;padding:80px 20px;">
              <div style="font-size:48px;margin-bottom:16px;">📋</div>
              <div style="font-size:16px;color:#1D2129;margin-bottom:8px;">暂无待预览的招标书</div>
              <div style="font-size:13px;color:#86909C;margin-bottom:24px;">请依次完成：需求录入 → 模板选择 → 字段确认，然后再查看招标书预览</div>
              <button class="btn btn-primary" @click="switchPage('requirement')">开始录入需求</button>
            </div>
          </div>
          <template v-else>
            <div v-if="isCollabEnabled" class="collab-bar">
              <span>📝 协同编辑已开启</span>
              <button class="btn btn-default btn-sm" @click="showCollabSettings = true">权限设置</button>
              <button class="btn btn-default btn-sm" @click="showEditHistory = true">编辑记录</button>
            </div>
            <div class="doc-content" v-html="translatedContent || renderedContent"></div>
          </template>
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

    <!-- 风险检测详情弹窗 -->
    <div v-if="showRiskDetails" class="modal-overlay" @click.self="showRiskDetails = false">
      <div class="modal-content" style="width:600px;">
        <div class="modal-header">
          <span class="modal-title">🔍 风险检测结果</span>
          <span class="modal-close" @click="showRiskDetails = false">×</span>
        </div>
        <div class="modal-body">
          <div v-if="riskCheckResult" class="risk-list">
          <div v-for="(risk, index) in riskCheckResult.risks" :key="index" class="risk-item" :class="risk.level">
            <div class="risk-header">
              <span class="risk-badge" :class="risk.level">{{ risk.level === 'high' ? '高风险' : (risk.level === 'medium' ? '中风险' : '低风险') }}</span>
              <span class="risk-category">{{ risk.category }}</span>
            </div>
            <div class="risk-title">{{ risk.title }}</div>
            <div class="risk-desc">{{ risk.description }}</div>
            <div v-if="risk.matchedText && risk.matchedText.length > 0" class="risk-matched">
              <span style="font-size:12px;color:#86909C;">匹配到的文本：</span>
              <span style="font-size:12px;color:#F53F3F;font-weight:500;">{{ risk.matchedText.join('；') }}</span>
            </div>
            <div class="risk-suggestion">💡 建议：{{ risk.suggestion }}</div>
          </div>
        </div>
          <div v-else class="empty-state" style="padding:20px;">
            <div class="es-text">暂无风险检测结果</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="showRiskDetails = false">关闭</button>
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
              <option value="auth">仅指定人员</option>
              <option value="view">仅查看</option>
            </select>
          </div>
          <div class="setting-item">
            <label>邀请协作者</label>
            <input class="form-input" type="text" v-model="collabInvitees" placeholder="输入用户名或邮箱，用逗号分隔">
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
import { analyzeRisk } from '../api/risk'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const requirementData = ref(null)
const selectedTemplate = ref(null)
const renderedContent = ref('')
const tocSections = ref([])
const activeSection = ref(0)
const currentPage = ref('bid-preview')
const errorInfo = ref('')

// 风险检测
const riskCheckResult = ref(null)
const riskLoading = ref(false)
const showRiskDetails = ref(false)

// 协同编辑与翻译
const isCollabEnabled = ref(false)
const showCollabSettings = ref(false)
const showEditHistory = ref(false)
const collabPermission = ref('all')
const collabInvitees = ref('')
const editRecords = ref([])

const loadEditRecords = () => {
  const saved = localStorage.getItem('bidEditRecords')
  if (saved) {
    try {
      editRecords.value = JSON.parse(saved)
    } catch (e) {
      editRecords.value = []
    }
  }
}

const saveEditRecord = (actionText) => {
  const record = {
    user: user.value?.userName || '当前用户',
    action: actionText,
    time: new Date().toLocaleString()
  }
  editRecords.value.unshift(record)
  localStorage.setItem('bidEditRecords', JSON.stringify(editRecords.value))
}
const showTranslatePanel = ref(false)
const selectedLang = ref('')
const translating = ref(false)
const translatedContent = ref('')
const languages = ref([
  { code: 'en', name: '英语', flag: '🇺🇸' },
  { code: 'ja', name: '日语', flag: '🇯🇵' },
  { code: 'ko', name: '韩语', flag: '🇰🇷' },
  { code: 'fr', name: '法语', flag: '🇫🇷' },
  { code: 'de', name: '德语', flag: '🇩🇪' },
  { code: 'es', name: '西班牙语', flag: '🇪🇸' }
])

const hasData = computed(() => !!requirementData.value && !!selectedTemplate.value)

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

const doTranslate = async () => {
  if (!selectedLang.value) return
  translating.value = true
  try {
    const data = await axios.post('/translate/document', {
      content: renderedContent.value || '',
      targetLang: selectedLang.value,
      isHtml: true
    }, { timeout: 300000 })
    if (data?.translatedContent) {
      translatedContent.value = data.translatedContent
      showTranslatePanel.value = false
      saveEditRecord('翻译文档为 ' + (data.targetLangName || selectedLang.value))
    } else {
      throw new Error('翻译结果为空')
    }
  } catch (error) {
    alert('翻译失败：' + (error.response?.data?.message || error.message || '未知错误'))
  } finally {
    translating.value = false
  }
}

const restoreOriginal = () => {
  translatedContent.value = ''
}

const saveCollabSettings = () => {
  showCollabSettings.value = false
  localStorage.setItem('collabPermission', collabPermission.value)
  localStorage.setItem('collabInvitees', collabInvitees.value)
  const permText = collabPermission.value === 'all' ? '所有人可编辑' : collabPermission.value === 'auth' ? '仅指定人员' : '仅查看'
  saveEditRecord('修改协同编辑权限为：' + permText)
  alert('协同编辑权限设置已保存')
}

const loadCollabSettings = () => {
  const saved = localStorage.getItem('collabPermission')
  if (saved) {
    collabPermission.value = saved
  }
  const savedInvitees = localStorage.getItem('collabInvitees')
  if (savedInvitees !== null) {
    collabInvitees.value = savedInvitees
  }
}

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const loadRequirementData = async () => {
  try {
    const saved = localStorage.getItem('requirementData')
    if (saved) {
      requirementData.value = JSON.parse(saved)
    }
    const templateSaved = localStorage.getItem('selectedTemplate')
    if (templateSaved) {
      selectedTemplate.value = JSON.parse(templateSaved)
    }
    
    localStorage.removeItem('bidPreviewContent')
    await renderDocument()
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

const processRenderedContent = (data) => {
  const h2Tags = data.match(new RegExp('<h2[^>]*>([^<]+)' + '</h2>', 'gi')) || []
  tocSections.value = h2Tags.map(tag => tag.replace(new RegExp('<h2[^>]*>([^<]+)' + '</h2>', 'i'), '$1').trim())

  let idx = 1
  renderedContent.value = data.replace(/<div[^>]*>/gi, () => {
    const id = 'section-' + idx
    idx++
    return '<div id="' + id + '">'
  })
  errorInfo.value = ''
  localStorage.setItem('lastRenderedContent', data)
}

const renderDocument = async () => {
  if (!requirementData.value || !selectedTemplate.value) return

  const templateId = selectedTemplate.value._id || selectedTemplate.value.templateId
  if (!templateId) {
    errorInfo.value = '模板ID缺失，请重新选择模板'
    renderedContent.value = '<p style="color:#F53F3F">模板ID缺失，请返回"模板选择"页面重新选择模板</p>'
    return
  }

  try {
    const data = await axios.post('/documents/generate-from-template', {
      templateId: templateId,
      data: requirementData.value,
      outputType: 'html'
    })

    if (typeof data !== 'string') {
      errorInfo.value = '后端返回数据格式错误: ' + JSON.stringify(data)
      renderedContent.value = '<p style="color:#F53F3F">后端返回数据格式错误，请联系管理员</p>'
      return
    }

    renderedContent.value = data
    processRenderedContent(data)
    autoRiskCheck()
  } catch (error) {
    console.error('渲染文档失败', error)
    const status = error.response?.status || ''
    const msg = error.response?.data?.message || error.message || '未知错误'
    errorInfo.value = msg
    renderedContent.value = '<div style="color:#F53F3F;padding:20px;"><p><strong>文档渲染失败</strong></p><p>HTTP状态: ' + status + '</p><p>错误信息: ' + msg + '</p><p style="margin-top:12px;font-size:12px;color:#86909C">请打开浏览器控制台(F12)查看详细日志，或检查后端服务是否正常运行。</p></div>'
  }
}

const exportWord = async () => {
  try {
    if (!requirementData.value || !selectedTemplate.value) {
      alert('请先录入需求并选择模板')
      return
    }
    
    const res = await axios.post('/documents/generate-from-template', {
      templateId: selectedTemplate.value._id || selectedTemplate.value.templateId,
      data: requirementData.value,
      outputType: 'word'
    }, { responseType: 'blob' })

    const docName = requirementData.value.projectName || '招标书'
    const blob = res instanceof Blob ? res : new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = docName + '招标文件.docx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出Word失败', error)
    alert('导出Word失败：' + (error.message || '未知错误'))
  }
}

const exportPDF = async () => {
  try {
    let html = ''
    const docName = (requirementData.value?.projectName || '招标书') + '招标文件'

    if (translatedContent.value) {
      html = translatedContent.value
    } else if (requirementData.value && selectedTemplate.value) {
      html = await axios.post('/documents/generate-from-template', {
        templateId: selectedTemplate.value._id || selectedTemplate.value.templateId,
        data: requirementData.value,
        outputType: 'pdf'
      })
      if (typeof html !== 'string') {
        alert('获取PDF内容失败')
        return
      }
    } else {
      alert('请先录入需求并选择模板')
      return
    }

    // 构造完整HTML文档（带打印样式）
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${docName}</title>
<style>
  body { font-family: "SimSun", "宋体", "Noto Sans JP", "Hiragino Kaku Gothic Pro", "Malgun Gothic", "Arial", sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1D2129; line-height: 1.8; }
  h1 { text-align: center; font-size: 22px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #165DFF; }
  h2 { font-size: 16px; color: #1D2129; margin: 24px 0 12px; padding-left: 10px; border-left: 3px solid #165DFF; }
  h3 { font-size: 14px; color: #4E5969; margin: 16px 0 8px; }
  p { font-size: 13px; color: #4E5969; margin-bottom: 12px; text-indent: 2em; }
  table { border: 1px solid #E5E6EB; margin: 12px 0; border-radius: 4px; width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #E5E6EB; padding: 8px 12px; font-size: 13px; text-align: left; }
  th { background: #F2F3F5; font-weight: 500; color: #4E5969; }
  ul { margin: 12px 0; padding-left: 24px; }
  li { font-size: 13px; color: #4E5969; line-height: 1.8; }
  @media print {
    body { padding: 0; }
    @page { margin: 2cm; }
  }
  .print-toolbar { position: fixed; top: 0; left: 0; right: 0; background: #165DFF; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 9999; }
  .print-toolbar button { background: #fff; color: #165DFF; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; }
  .print-toolbar button:hover { background: #F2F3F5; }
  @media print { .print-toolbar { display: none; } }
  .content { margin-top: 50px; }
</style>
</head>
<body>
<div class="print-toolbar">
  <span>📄 ${docName} - 打印预览</span>
  <div>
    <button onclick="window.print()">🖨 打印/另存为PDF</button>
    <button onclick="window.close()">关闭</button>
  </div>
</div>
<div class="content">
${html}
</div>
</body>
</html>`

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (printWindow) {
      printWindow.document.write(fullHtml)
      printWindow.document.close()
    } else {
      // 如果被浏览器拦截，使用下载方式
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = docName + '.html'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      alert('已下载HTML文件，请用浏览器打开后使用"打印"功能保存为PDF')
    }
  } catch (error) {
    console.error('导出PDF失败', error)
    alert('导出PDF失败：' + (error.message || '未知错误'))
  }
}

const autoRiskCheck = async () => {
  riskLoading.value = true
  try {
    if (!requirementData.value) return
    const result = await analyzeRisk({
      docType: 'bid',
      data: requirementData.value,
      content: renderedContent.value,
      docId: 'bid-' + Date.now()
    })
    riskCheckResult.value = result
    localStorage.setItem('lastRiskCheck', JSON.stringify({
      docType: 'bid',
      docName: requirementData.value.projectName || '未命名招标书',
      risks: result.risks,
      summary: result.summary,
      timestamp: new Date().toISOString()
    }))
    console.log('招标书风险检测完成，发现', result.summary.total, '条风险')
  } catch (error) {
    console.error('自动风险检测失败', error)
    riskCheckResult.value = null
  } finally {
    riskLoading.value = false
  }
}

const publishBid = async () => {
  if (!confirm('确定要发布这份招标书吗？')) return

  try {
    let docContent = renderedContent.value || ''
    if (docContent.length > 25000) {
      docContent = docContent.substring(0, 25000)
    }
    await axios.post('/documents', {
      title: requirementData.value?.projectName + '招标文件',
      name: requirementData.value?.projectName + '招标文件',
      type: 'bid',
      content: docContent,
      status: 'published',
      templateId: selectedTemplate.value?._id || selectedTemplate.value?.templateId,
      category: selectedTemplate.value?.category,
      templateName: selectedTemplate.value?.name,
      data: requirementData.value
    })

    alert('招标书发布成功')
    router.push('/dashboard')
  } catch (error) {
    alert('发布失败：' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

onMounted(() => {
  loadRequirementData()
  loadCollabSettings()
  loadEditRecords()
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
.btn-warning { background: #FAAD14; color: #fff; border-color: #FAAD14; }
.btn-warning:hover { background: #FFC53D; }

.preview-layout { display: flex; gap: 16px; }
.preview-sidebar { width: 200px; flex-shrink: 0; }
.preview-main { flex: 1; min-width: 0; }

.toc-list { background: #F7F8FA; border-radius: 8px; padding: 12px; }
.toc-item { padding: 6px 12px; font-size: 13px; color: #4E5969; cursor: pointer; border-radius: 4px; margin-bottom: 2px; transition: all .15s; }
.toc-item:hover { background: #E8F3FF; color: #165DFF; }
.toc-item.active { background: #E8F3FF; color: #165DFF; font-weight: 500; }

.doc-content { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 40px; min-height: 600px; max-height: 70vh; overflow-y: auto; }
.doc-content h1 { font-size: 22px; text-align: center; color: #1D2129; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #165DFF; }
.doc-content h2 { font-size: 16px; color: #1D2129; margin: 24px 0 12px; padding-left: 10px; border-left: 3px solid #165DFF; }
.doc-content h3 { font-size: 14px; color: #4E5969; margin: 16px 0 8px; }
.doc-content p { font-size: 13px; color: #4E5969; line-height: 1.8; margin-bottom: 12px; text-indent: 2em; }
.doc-content table { border: 1px solid #E5E6EB; margin: 12px 0; border-radius: 4px; width: 100%; border-collapse: collapse; }
.doc-content th, .doc-content td { border: 1px solid #E5E6EB; padding: 8px 12px; font-size: 13px; text-align: left; }
.doc-content th { background: #F2F3F5; font-weight: 500; color: #4E5969; }
.doc-content ul { margin: 12px 0; padding-left: 24px; }
.doc-content li { font-size: 13px; color: #4E5969; line-height: 1.8; }
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

.collab-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #4E5969; cursor: pointer; }
.collab-toggle input { cursor: pointer; accent-color: #165DFF; }

.collab-bar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #E8F3FF; border: 1px solid #BEDAFF; border-radius: 6px; margin-bottom: 16px; font-size: 13px; color: #165DFF; }
.collab-bar .btn { height: 28px; padding: 0 12px; font-size: 12px; }
.btn-sm { height: 28px; padding: 0 12px; font-size: 12px; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: #fff; border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; max-height: 80vh; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #E5E6EB; }
.modal-title { font-size: 16px; font-weight: 600; color: #1D2129; }
.modal-close { font-size: 24px; color: #86909C; cursor: pointer; line-height: 1; transition: color .15s; }
.modal-close:hover { color: #1D2129; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 12px 20px; border-top: 1px solid #E5E6EB; }

.lang-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.lang-option { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #E5E6EB; border-radius: 6px; cursor: pointer; transition: all .15s; }
.lang-option:hover { border-color: #165DFF; background: #F5F9FF; }
.lang-option.selected { border-color: #165DFF; background: #E8F3FF; }
.lang-flag { font-size: 20px; }
.lang-name { font-size: 13px; color: #1D2129; }

.setting-item { margin-bottom: 16px; }
.setting-item:last-child { margin-bottom: 0; }
.setting-item label { display: block; font-size: 13px; color: #4E5969; margin-bottom: 6px; }
.form-select { width: 100%; height: 36px; padding: 0 12px; font-size: 13px; color: #1D2129; background: #fff; border: 1px solid #E5E6EB; border-radius: 4px; outline: none; cursor: pointer; }
.form-select:focus { border-color: #165DFF; }
.form-input { width: 100%; height: 36px; padding: 0 12px; font-size: 13px; color: #1D2129; background: #fff; border: 1px solid #E5E6EB; border-radius: 4px; outline: none; }
.form-input:focus { border-color: #165DFF; }

.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #F7F8FA; border-radius: 4px; }
.history-user { font-size: 13px; color: #1D2129; font-weight: 500; }
.history-action { font-size: 12px; color: #4E5969; }
.history-time { font-size: 12px; color: #86909C; }
</style>
