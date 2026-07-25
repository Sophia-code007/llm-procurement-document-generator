<template>
  <div class="login-wrapper">
    <div class="left-panel">
      <div class="decor-circle-1"></div>
      <div class="decor-circle-2"></div>
      <div class="decor-dots">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
      <div class="left-content">
        <div class="logo-icon">
          <span>采</span>
        </div>
        <h1 class="system-name">采购文件智能生成系统</h1>
        <p class="system-tagline">LLM大模型驱动 | 智能采购文件全流程解决方案</p>
      </div>
    </div>

    <div class="right-panel">
      <div class="login-form-wrapper">
        <h2 class="form-title">用户登录</h2>
        <p class="form-subtitle">请输入您的账号信息以登录系统</p>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="username">用户名</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input type="text" id="username" v-model="form.username" placeholder="请输入用户名" autocomplete="username">
            </div>
          </div>

          <div class="input-group">
            <label for="password">密码</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input type="password" id="password" v-model="form.password" placeholder="请输入密码" autocomplete="current-password">
            </div>
          </div>

          <div class="options-row">
            <label class="remember-me">
              <input type="checkbox" v-model="form.remember"> 记住我
            </label>
            <a href="javascript:void(0)" class="forgot-password">忘记密码?</a>
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="loading">登录中...</span>
            <span v-else>登 录</span>
          </button>
        </form>

        <div class="divider">
          <span>其他登录方式</span>
        </div>

        <div class="secondary-login">
          <button type="button" class="btn-secondary">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.07c-.18.28-.56.36-.84.18-2.3-1.41-5.2-1.73-8.62-.95-.32.07-.64-.13-.72-.46-.07-.32.13-.64.46-.72 3.72-.85 6.92-.49 9.54 1.12.29.17.37.56.18.83zm1.23-2.72c-.23.35-.7.47-1.05.24-2.64-1.62-6.66-2.09-9.78-1.14-.4.12-.82-.1-.94-.5-.12-.4.1-.82.5-.94 3.54-1.07 7.97-.55 11 1.3.35.22.47.7.27 1.04zm.11-2.83c-3.16-1.88-8.37-2.05-11.38-1.13-.48.15-1-.12-1.14-.6-.15-.48.12-1 .6-1.14 3.45-1.05 9.17-.85 12.8 1.32.43.26.57.82.32 1.24-.26.43-.82.57-1.2.31z"/>
            </svg>
            企业微信登录
          </button>
          <button type="button" class="btn-secondary">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            钉钉登录
          </button>
        </div>

        <div class="register-link">
          还没有账号？<a href="/register">立即注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    alert('请填写用户名和密码')
    return
  }

  loading.value = true
  try {
    const res = await login(form)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    router.push('/dashboard')
  } catch (error) {
    alert(error.response?.data?.msg || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #F7F8FA;
  color: #1D2129;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.left-panel {
  position: relative;
  width: 480px;
  min-width: 480px;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
}

.left-panel::before {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  top: -80px;
  left: -100px;
}

.left-panel::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  bottom: 60px;
  right: -40px;
}

.decor-circle-1 {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  top: 140px;
  right: 60px;
}

.decor-circle-2 {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  bottom: 180px;
  left: 50px;
}

.decor-dots {
  position: absolute;
  bottom: 100px;
  right: 80px;
  display: grid;
  grid-template-columns: repeat(3, 8px);
  gap: 10px;
}

.decor-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.left-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  backdrop-filter: blur(4px);
}

.logo-icon span {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0;
}

.system-name {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.system-tagline {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  letter-spacing: 0.5px;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #F7F8FA;
}

.login-form-wrapper {
  width: 380px;
  max-width: 100%;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: #86909C;
  margin-bottom: 36px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 8px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #C9CDD4;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 40px;
  font-size: 14px;
  font-family: inherit;
  color: #1D2129;
  background: #fff;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrap input::placeholder {
  color: #C9CDD4;
}

.input-wrap input:focus {
  border-color: #165DFF;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #4E5969;
  user-select: none;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #165DFF;
  cursor: pointer;
}

.forgot-password {
  color: #165DFF;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #0E42D2;
}

.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  font-family: inherit;
  color: #fff;
  background: #165DFF;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  letter-spacing: 1px;
}

.btn-login:hover {
  background: #0E42D2;
}

.btn-login:active {
  background: #0033CC;
}

.btn-login:disabled {
  background: #94BFFF;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 28px 0;
  gap: 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #E5E6EB;
}

.divider span {
  font-size: 13px;
  color: #86909C;
  white-space: nowrap;
}

.secondary-login {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  font-size: 14px;
  font-family: inherit;
  color: #4E5969;
  background: #fff;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-secondary:hover {
  border-color: #165DFF;
  color: #165DFF;
}

.btn-secondary svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.register-link {
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: #86909C;
}

.register-link a {
  color: #165DFF;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.register-link a:hover {
  color: #0E42D2;
  text-decoration: underline;
}
</style>