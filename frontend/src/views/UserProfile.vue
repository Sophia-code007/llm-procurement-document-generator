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
            <img v-if="userAvatarBase64" :src="userAvatarBase64" class="avatar-img" alt="avatar">
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
      <div class="breadcrumb"><a href="#">首页</a><span>/</span><a href="#">个人主页</a></div>
      <div class="page-header">
        <div>
          <div class="page-title">个人主页</div>
          <div class="page-desc">管理和编辑您的个人信息</div>
        </div>
      </div>

      <div class="card profile-card">
        <div class="profile-avatar-section">
          <div class="avatar-large">
            <img v-if="userAvatarBase64" :src="userAvatarBase64" class="avatar-img-large" alt="avatar">
            <span v-else>{{ userInitial }}</span>
          </div>
          <label class="btn btn-outline avatar-upload">
            <input type="file" accept="image/*" @change="onAvatarChange" style="display:none">
            更换头像
          </label>
        </div>
      </div>

      <div class="card">
        <div class="card-title">基本信息</div>
        <div class="form-grid">
          <div class="form-item">
            <label>用户名</label>
            <input v-model="form.userName" type="text" placeholder="请输入用户名">
          </div>
          <div class="form-item">
            <label>邮箱</label>
            <input v-model="form.email" type="text" readonly class="readonly">
          </div>
          <div class="form-item">
            <label>手机号</label>
            <input v-model="form.phone" type="text" placeholder="请输入手机号">
          </div>
          <div class="form-item">
            <label>所属部门</label>
            <input v-model="form.department" type="text" placeholder="请输入所属部门">
          </div>
          <div class="form-item fullwidth">
            <label>个人简介</label>
            <textarea v-model="form.bio" rows="3" placeholder="请输入个人简介"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveProfile">保存</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">账号绑定</div>
        <div class="bind-list">
          <div class="bind-item">
            <div class="bind-info">
              <div class="bind-icon" style="background:#07C160; color:#fff;">微</div>
              <div>
                <div class="bind-name">微信</div>
                <div class="bind-status">{{ bindStatus.wechat || '未绑定' }}</div>
              </div>
            </div>
            <button class="btn btn-outline" @click="bindWechat">绑定</button>
          </div>
          <div class="bind-item">
            <div class="bind-info">
              <div class="bind-icon" style="background:#3370FF; color:#fff;">钉</div>
              <div>
                <div class="bind-name">钉钉</div>
                <div class="bind-status">{{ bindStatus.dingtalk || '未绑定' }}</div>
              </div>
            </div>
            <button class="btn btn-outline" @click="bindDingtalk">绑定</button>
          </div>
          <div class="bind-item">
            <div class="bind-info">
              <div class="bind-icon" style="background:#2B2B2B; color:#fff;">企</div>
              <div>
                <div class="bind-name">企业微信</div>
                <div class="bind-status">{{ bindStatus.wecom || '未绑定' }}</div>
              </div>
            </div>
            <button class="btn btn-outline" @click="bindWecom">绑定</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">安全设置</div>
        <div class="form-grid">
          <div class="form-item">
            <label>旧密码</label>
            <input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码">
          </div>
          <div class="form-item">
            <label>新密码</label>
            <input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码">
          </div>
          <div class="form-item">
            <label>确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="changePassword">确认修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const currentPage = ref('profile')
const showUserMenu = ref(false)
const showMsgPanel = ref(false)

const userInitial = computed(() => {
  return user.value?.userName?.charAt(0) || '用'
})

const userAvatarBase64 = computed(() => {
  return localStorage.getItem('userAvatar') || user.value?.avatar || ''
})

const defaultMessages = [
  { id: 1, title: '欢迎使用采购文件智能生成系统', time: '刚刚', read: false },
  { id: 2, title: '您有一份待处理的采购文件需要审核', time: '10分钟前', read: false },
  { id: 3, title: '系统更新：新增AI智能问答功能', time: '1小时前', read: true }
]

const messages = ref([])

const unreadCount = computed(() => {
  return messages.value.filter(m => !m.read).length
})

const loadMessages = () => {
  const stored = localStorage.getItem('messages')
  if (stored) {
    try {
      messages.value = JSON.parse(stored)
    } catch {
      messages.value = [...defaultMessages]
    }
  } else {
    messages.value = [...defaultMessages]
    localStorage.setItem('messages', JSON.stringify(messages.value))
  }
}

const toggleMsgPanel = () => {
  showMsgPanel.value = !showMsgPanel.value
}

const readMsg = (msg) => {
  msg.read = true
  localStorage.setItem('messages', JSON.stringify(messages.value))
}

const markAllRead = () => {
  messages.value.forEach(m => { m.read = true })
  localStorage.setItem('messages', JSON.stringify(messages.value))
}

const goToAllMessages = () => {
  alert('查看全部消息')
}

const form = ref({
  userName: user.value.userName || '',
  email: user.value.email || '',
  phone: user.value.phone || '',
  department: user.value.department || '',
  bio: user.value.bio || ''
})

const bindStatus = ref({
  wechat: localStorage.getItem('bind_wechat') || '',
  dingtalk: localStorage.getItem('bind_dingtalk') || '',
  wecom: localStorage.getItem('bind_wecom') || ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const switchPage = (page) => {
  currentPage.value = page
  router.push(`/${page}`)
}

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

const onAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const base64 = event.target.result
    localStorage.setItem('userAvatar', base64)
    const updatedUser = { ...user.value, avatar: base64 }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    user.value = updatedUser
    alert('头像更换成功')
  }
  reader.readAsDataURL(file)
}

const saveProfile = () => {
  const updatedUser = { ...user.value, ...form.value }
  localStorage.setItem('user', JSON.stringify(updatedUser))
  user.value = updatedUser
  alert('个人信息已保存')
}

const bindWechat = () => {
  alert('微信绑定功能演示')
}

const bindDingtalk = () => {
  alert('钉钉绑定功能演示')
}

const bindWecom = () => {
  alert('企业微信绑定功能演示')
}

const changePassword = () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    alert('请填写所有密码字段')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('新密码与确认密码不一致')
    return
  }
  alert('密码修改成功')
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
}

onMounted(() => {
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
  if (savedUser.userName) form.value.userName = savedUser.userName
  if (savedUser.email) form.value.email = savedUser.email
  if (savedUser.phone) form.value.phone = savedUser.phone
  if (savedUser.department) form.value.department = savedUser.department
  if (savedUser.bio) form.value.bio = savedUser.bio
  loadMessages()
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

.header-user .name {
  font-size: 13px;
  color: #1D2129;
}

.header-user .arrow {
  color: #C9CDD4;
  font-size: 10px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 140px;
  padding: 6px 0;
  z-index: 1100;
  margin-top: 4px;
}

.user-dropdown-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #4E5969;
  cursor: pointer;
  transition: background .15s;
}

.user-dropdown-item:hover {
  background: #F2F3F5;
  color: #165DFF;
}

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

.profile-card {
  display: flex;
  justify-content: center;
  padding: 32px 20px;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165DFF, #722ED1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-upload {
  cursor: pointer;
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

.btn-outline {
  background: #fff;
  color: #4E5969;
  border-color: #E5E6EB;
}

.btn-outline:hover {
  border-color: #165DFF;
  color: #165DFF;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item.fullwidth {
  grid-column: 1 / -1;
}

.form-item label {
  font-size: 13px;
  color: #4E5969;
  font-weight: 500;
}

.form-item input,
.form-item textarea {
  height: 36px;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 13px;
  outline: none;
  transition: border-color .2s;
  font-family: inherit;
}

.form-item input:focus,
.form-item textarea:focus {
  border-color: #165DFF;
}

.form-item input.readonly {
  background: #F7F8FA;
  color: #86909C;
  cursor: not-allowed;
}

.form-item textarea {
  height: auto;
  padding: 8px 12px;
  resize: vertical;
}

.form-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.bind-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bind-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  background: #F7F8FA;
}

.bind-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bind-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.bind-name {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
}

.bind-status {
  font-size: 12px;
  color: #86909C;
  margin-top: 2px;
}
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