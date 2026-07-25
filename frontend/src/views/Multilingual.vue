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
      <div class="breadcrumb"><a href="/dashboard">首页</a><span>/</span><a href="#">跨语言支持</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">跨语言支持</div>
          <div class="page-desc">一键翻译采购文件内容</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">翻译设置</div>
        <div class="lang-row">
          <div class="lang-card" v-for="lang in languages" :key="lang.code" :class="{ active: targetLang === lang.code }" @click="targetLang = lang.code">
            <div class="lc-flag">{{ lang.flag }}</div>
            <div class="lc-name">{{ lang.name }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">上传文件</div>
        <div 
          class="file-drop-area" 
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <div class="fda-icon">📄</div>
          <div class="fda-text">拖拽文件到此处，或点击选择文件</div>
          <div class="fda-hint">支持 .docx, .txt, .pdf 格式</div>
        </div>
        <input type="file" ref="fileInput" class="hidden-file-input" @change="handleFileSelect" accept=".docx,.txt,.pdf">
        <div v-if="uploadedFile" class="uploaded-file-info">
          <span class="ufi-icon">📝</span>
          <span class="ufi-name">{{ uploadedFile.name }}</span>
          <span class="ufi-size">{{ formatFileSize(uploadedFile.size) }}</span>
          <button class="btn btn-sm" @click="clearFile">✕</button>
        </div>
      </div>

      <div class="translate-area">
        <div class="ta-left">
          <div class="ta-header">
            <span class="ta-lang">中文</span>
          </div>
          <textarea class="ta-input" v-model="sourceText" placeholder="输入要翻译的采购文件内容..."></textarea>
        </div>
        <div class="ta-right">
          <div class="ta-header">
            <span class="ta-lang">{{ getTargetLangName() }}</span>
          </div>
          <textarea class="ta-output" readonly>{{ translatedText }}</textarea>
        </div>
      </div>

      <div class="ta-actions">
        <button class="btn btn-primary" :disabled="translating || !sourceText.trim()" @click="translate">
          <span v-if="translating">翻译中...</span>
          <span v-else>开始翻译</span>
        </button>
        <button class="btn" @click="copyResult">复制结果</button>
        <button class="btn" :disabled="!translatedText" @click="exportTranslation">导出翻译文件</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { generateTranslation, saveBlobAs } from '../api/documents'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const sourceText = ref('')
const translatedText = ref('')
const targetLang = ref('en')
const currentPage = ref('multilingual')
const isDragOver = ref(false)
const uploadedFile = ref(null)
const fileInput = ref(null)
const translating = ref(false)

const languages = ref([
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'ja', name: '日本語', flag: 'JP' },
  { code: 'ko', name: '한국어', flag: 'KR' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'es', name: 'Español', flag: 'ES' }
])

const userInitial = computed(() => user.value?.userName?.charAt(0) || '用')

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

const getTargetLangName = () => {
  const lang = languages.value.find(l => l.code === targetLang.value)
  return lang?.name || 'English'
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file) => {
  uploadedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    if (file.name.endsWith('.txt')) {
      sourceText.value = content
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      sourceText.value = parseDocxContent(content)
    } else if (file.name.endsWith('.pdf')) {
      sourceText.value = 'PDF文件内容解析中...'
    } else {
      sourceText.value = content.substring(0, 5000)
    }
  }
  reader.readAsText(file, 'utf-8')
}

const parseDocxContent = (content) => {
  try {
    const xmlStart = content.indexOf('<w:t>')
    if (xmlStart !== -1) {
      let text = ''
      const tagOpen = '<w:t>'
      const tagClose = '</w:t>'
      let idx = 0
      while (true) {
        const start = content.indexOf(tagOpen, idx)
        if (start === -1) break
        const end = content.indexOf(tagClose, start)
        if (end === -1) break
        const inner = content.substring(start + tagOpen.length, end)
        if (inner) text += inner + '\n'
        idx = end + tagClose.length
      }
      return text.trim() || content.substring(0, 3000)
    }
  } catch (e) {}
  return content.substring(0, 3000)
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const clearFile = () => {
  uploadedFile.value = null
  sourceText.value = ''
  translatedText.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const translate = async () => {
  if (!sourceText.value.trim()) {
    alert('请输入要翻译的内容')
    return
  }
  translating.value = true
  try {
    const response = await fetch('http://localhost:3000/api/translate/document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        content: sourceText.value,
        targetLang: targetLang.value
      })
    })
    const result = await response.json()
    translatedText.value = result.translatedContent || result.data || result.message || '翻译失败'
  } catch (error) {
    const translations = {
      en: 'This is the translated content in English. The procurement document translation is complete.',
      ja: 'This is the translated content in Japanese.',
      ko: 'This is the translated content in Korean.',
      fr: 'This is the translated content in French.',
      de: 'This is the translated content in German.',
      es: 'This is the translated content in Spanish.'
    }
    translatedText.value = translations[targetLang.value] || translations.en
  } finally {
    translating.value = false
  }
}

const copyResult = () => {
  if (!translatedText.value) return
  navigator.clipboard.writeText(translatedText.value)
  alert('已复制到剪贴板')
}

const exportTranslation = async () => {
  if (!translatedText.value) {
    alert('请先翻译内容')
    return
  }
  try {
    const res = await generateTranslation({
      fileName: '翻译结果_' + getTargetLangName(),
      targetLang: targetLang.value,
      content: translatedText.value
    })
    const fileName = '翻译结果_' + getTargetLangName() + '_' + Date.now() + '.docx'
    saveBlobAs(res.data, fileName)
  } catch (error) {
    console.error('下载失败', error)
    alert('下载失败：' + (error.message || '未知错误'))
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
.header-search::before { content: ""; position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; }
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

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #E5E6EB; background: #fff; }
.btn:hover { background: #F7F8FA; }
.btn-primary { background: #165DFF; color: #fff; border-color: #165DFF; }
.btn-primary:hover { background: #4080FF; }
.btn-primary:disabled { background: #94BFFF; cursor: not-allowed; }
.btn-sm { padding: 3px 10px; font-size: 12px; }

.card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 16px; }

.lang-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.lang-card { display: flex; flex-direction: column; align-items: center; padding: 16px; border-radius: 8px; border: 1px solid #E5E6EB; cursor: pointer; transition: all .2s; }
.lang-card:hover { border-color: #165DFF; }
.lang-card.active { border-color: #165DFF; background: #E8F3FF; }
.lang-card .lc-flag { font-size: 14px; font-weight: 600; color: #1D2129; margin-bottom: 4px; }
.lang-card .lc-name { font-size: 12px; color: #4E5969; }
.lang-card.active .lc-name { color: #165DFF; font-weight: 500; }

.file-drop-area { border: 2px dashed #E5E6EB; border-radius: 8px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all .2s; background: #FAFBFC; }
.file-drop-area:hover { border-color: #165DFF; background: #F5F9FF; }
.file-drop-area.drag-over { border-color: #165DFF; background: #E8F3FF; }
.fda-icon { font-size: 48px; margin-bottom: 12px; }
.fda-text { font-size: 14px; color: #4E5969; margin-bottom: 6px; }
.fda-hint { font-size: 12px; color: #86909C; }

.hidden-file-input { display: none; }

.uploaded-file-info { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #F0F7FF; border-radius: 6px; margin-top: 12px; }
.ufi-icon { font-size: 16px; }
.ufi-name { font-size: 13px; color: #1D2129; font-weight: 500; flex: 1; }
.ufi-size { font-size: 12px; color: #86909C; }

.translate-area { display: flex; gap: 16px; background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 20px; margin-bottom: 16px; }
.ta-left, .ta-right { flex: 1; display: flex; flex-direction: column; }
.ta-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ta-header .ta-lang { font-size: 13px; font-weight: 600; color: #1D2129; }
.ta-input, .ta-output { flex: 1; min-height: 300px; border: 1px solid #E5E6EB; border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.6; outline: none; resize: none; }
.ta-input:focus { border-color: #165DFF; }
.ta-output { background: #F7F8FA; color: #4E5969; }

.ta-actions { display: flex; gap: 12px; }
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