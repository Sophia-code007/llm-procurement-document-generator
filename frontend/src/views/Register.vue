<template>
  <div class="register-page">
    <div class="left-panel">
      <div class="deco-dots top-right">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
      <div class="logo-circle">
        <span>采</span>
      </div>
      <div class="system-name">采购文件智能生成系统</div>
      <div class="tagline">LLM大模型驱动 | 智能采购文件全流程解决方案</div>
      <div class="deco-dots bottom-left">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </div>

    <div class="right-panel">
      <div class="register-container">
        <h1 class="register-title">用户注册</h1>
        <p class="register-subtitle">请填写以下信息完成账号注册</p>

        <div class="step-indicator">
          <div class="step-item active">
            <span class="step-number">1</span>
            <span class="step-text">填写信息</span>
          </div>
          <div class="step-connector"></div>
          <div class="step-item pending">
            <span class="step-number">2</span>
            <span class="step-text">验证邮箱</span>
          </div>
          <div class="step-connector"></div>
          <div class="step-item pending">
            <span class="step-number">3</span>
            <span class="step-text">注册成功</span>
          </div>
        </div>

        <div class="form-card">
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>企业名称
              </label>
              <input type="text" class="form-input" v-model="form.companyName" placeholder="请输入企业全称">
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>用户姓名
              </label>
              <input type="text" class="form-input" v-model="form.userName" placeholder="请输入真实姓名">
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>登录账号
              </label>
              <input type="text" class="form-input" v-model="form.username" placeholder="请设置登录账号">
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>登录密码
              </label>
              <div class="password-wrapper">
                <input type="password" class="form-input" v-model="form.password" placeholder="请设置登录密码" @input="checkPasswordStrength">
              </div>
              <div class="strength-bar">
                <div class="strength-segment" :class="strengthClass[0]"></div>
                <div class="strength-segment" :class="strengthClass[1]"></div>
                <div class="strength-segment" :class="strengthClass[2]"></div>
                <span class="strength-text" :class="strengthTextClass">{{ strengthText }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>确认密码
              </label>
              <input type="password" class="form-input" v-model="form.confirmPassword" placeholder="请再次输入密码">
            </div>

            <div class="agreement-row">
              <input type="checkbox" id="agreement" v-model="form.agreement">
              <label for="agreement">
                我已阅读并同意<a href="javascript:void(0)">《用户服务协议》</a>和<a href="javascript:void(0)">《隐私政策》</a>
              </label>
            </div>

            <button type="submit" class="btn-register" :disabled="loading">
              <span v-if="loading">注册中...</span>
              <span v-else>注 册</span>
            </button>
          </form>
        </div>

        <div class="bottom-link">
          已有账号？<a href="/">返回登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'

const router = useRouter()

const form = reactive({
  companyName: '',
  userName: '',
  username: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const loading = ref(false)
const strengthClass = ref(['', '', ''])
const strengthTextClass = ref('')
const strengthText = ref('')

const checkPasswordStrength = () => {
  const pwd = form.password
  let score = 0
  
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++

  strengthClass.value = ['', '', '']
  strengthTextClass.value = ''
  strengthText.value = ''

  if (pwd.length === 0) return

  if (score <= 2) {
    strengthClass.value[0] = 'weak'
    strengthTextClass.value = 'weak'
    strengthText.value = '弱'
  } else if (score <= 3) {
    strengthClass.value = ['medium', 'medium', '']
    strengthTextClass.value = 'medium'
    strengthText.value = '中'
  } else {
    strengthClass.value = ['strong', 'strong', 'strong']
    strengthTextClass.value = 'strong'
    strengthText.value = '强'
  }
}

const handleRegister = async () => {
  if (!form.companyName || !form.userName || !form.username || !form.password) {
    alert('请填写所有必填项')
    return
  }
  
  if (form.password.length < 6) {
    alert('密码长度不能少于6位')
    return
  }
  
  if (form.password !== form.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  if (!form.agreement) {
    alert('请阅读并同意用户服务协议和隐私政策')
    return
  }

  loading.value = true
  try {
    const res = await register(form)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    router.push('/dashboard')
  } catch (error) {
    alert(error.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.left-panel {
  width: 45%;
  background: linear-gradient(135deg, #1a5cff, #4080ff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.deco-dots {
  position: absolute;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.deco-dots.top-right {
  top: 40px;
  right: 40px;
}

.deco-dots.bottom-left {
  bottom: 60px;
  left: 60px;
  grid-template-columns: repeat(3, 1fr);
}

.dot {
  width: 6px;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 24px;
  border: 2px solid rgba(255,255,255,0.3);
}

.system-name {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
}

.tagline {
  font-size: 14px;
  opacity: 0.85;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.register-container {
  width: 100%;
  max-width: 420px;
}

.register-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 24px;
}

.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.step-item.active .step-number {
  background: #165dff;
  color: #fff;
}

.step-item.pending .step-number {
  background: #e5e6eb;
  color: #86909c;
}

.step-text {
  font-size: 13px;
}

.step-item.active .step-text {
  color: #165dff;
  font-weight: 500;
}

.step-item.pending .step-text {
  color: #86909c;
}

.step-connector {
  flex: 1;
  height: 1px;
  background: #e5e6eb;
  margin: 0 8px;
}

.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 6px;
}

.required {
  color: #f53f3f;
  margin-right: 2px;
}

.form-input {
  width: 100%;
  height: 40px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #165dff;
}

.password-wrapper {
  position: relative;
}

.strength-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.strength-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e5e6eb;
  transition: background 0.3s;
}

.strength-segment.weak {
  background: #f53f3f;
}

.strength-segment.medium {
  background: #ff7d00;
}

.strength-segment.strong {
  background: #00b42a;
}

.strength-text {
  font-size: 12px;
  margin-left: 4px;
}

.strength-text.weak {
  color: #f53f3f;
}

.strength-text.medium {
  color: #ff7d00;
}

.strength-text.strong {
  color: #00b42a;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #4e5969;
}

.agreement-row input[type="checkbox"] {
  margin-top: 2px;
}

.agreement-row a {
  color: #165dff;
  text-decoration: none;
}

.btn-register {
  width: 100%;
  height: 44px;
  background: #165dff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-register:hover {
  background: #4080ff;
}

.btn-register:disabled {
  background: #94b4ff;
  cursor: not-allowed;
}

.bottom-link {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: #86909c;
}

.bottom-link a {
  color: #165dff;
  text-decoration: none;
}
</style>