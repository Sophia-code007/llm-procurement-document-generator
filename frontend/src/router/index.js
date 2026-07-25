import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
<<<<<<< HEAD
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
=======
    redirect: '/dashboard'
>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
<<<<<<< HEAD
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/requirement',
    name: 'Requirement',
    component: () => import('../views/Requirement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/template',
    name: 'Template',
    component: () => import('../views/Template.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/field-confirm',
    name: 'FieldConfirm',
    component: () => import('../views/FieldConfirm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bid-preview',
    name: 'BidPreview',
    component: () => import('../views/BidPreview.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contract-gen',
    name: 'ContractGen',
    component: () => import('../views/ContractGen.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contract-preview',
    name: 'ContractPreview',
    component: () => import('../views/ContractPreview.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/risk-check',
    name: 'RiskCheck',
    component: () => import('../views/RiskCheck.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/regulation',
    name: 'Regulation',
    component: () => import('../views/Regulation.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collab',
    name: 'Collab',
    component: () => import('../views/Collab.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/version',
    name: 'Version',
    component: () => import('../views/Version.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-chat',
    name: 'AIChat',
    component: () => import('../views/AIChat.vue'),
    meta: { requiresAuth: true }
=======
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '工作台', section: 'dashboard' }
  },
  {
    path: '/template-select',
    name: 'TemplateSelect',
    component: () => import('@/views/TemplateSelect.vue'),
    meta: { title: '模板选择', section: 'generate' }
  },
  {
    path: '/input-method',
    name: 'InputMethodSelect',
    component: () => import('@/views/InputMethodSelect.vue'),
    meta: { title: '录入方式', section: 'generate' }
  },
  {
    path: '/ai-input',
    name: 'AiInput',
    component: () => import('@/views/AiInput.vue'),
    meta: { title: '自然语言录入', section: 'generate' }
  },
  {
    path: '/field-form',
    name: 'FieldForm',
    component: () => import('@/views/FieldForm.vue'),
    meta: { title: '表单填写', section: 'generate' }
  },
  {
    path: '/generating',
    name: 'Generating',
    component: () => import('@/views/Generating.vue'),
    meta: { title: '生成中', section: 'generate' }
  },
  {
    path: '/doc-preview',
    name: 'DocPreview',
    component: () => import('@/views/DocPreview.vue'),
    meta: { title: '文件预览', section: 'generate' }
  },
  {
    path: '/contract',
    name: 'ContractGen',
    component: () => import('@/views/ContractGen.vue'),
    meta: { title: '合同生成', section: 'generate' }
  },
  {
    path: '/history',
    name: 'HistoryReuse',
    component: () => import('@/views/HistoryReuse.vue'),
    meta: { title: '历史复用', section: 'assist' }
  },
  {
    path: '/collaborate',
    name: 'Collaborate',
    component: () => import('@/views/Collaborate.vue'),
    meta: { title: '协同编辑', section: 'assist' }
  },
  {
    path: '/version',
    name: 'VersionManage',
    component: () => import('@/views/VersionManage.vue'),
    meta: { title: '版本管理', section: 'assist' }
  },
  {
    path: '/ai-assist',
    name: 'AiAssist',
    component: () => import('@/views/AiAssist.vue'),
    meta: { title: 'AI智能问答', section: 'assist' }
>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
  },
  {
    path: '/supplier',
    name: 'Supplier',
<<<<<<< HEAD
    component: () => import('../views/Supplier.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/Analytics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/multilingual',
    name: 'Multilingual',
    component: () => import('../views/Multilingual.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true }
=======
    component: () => import('@/views/Supplier.vue'),
    meta: { title: '供应商推荐', section: 'assist' }
  },
  {
    path: '/compliance',
    name: 'Compliance',
    component: () => import('@/views/Compliance.vue'),
    meta: { title: '合规审查', section: 'assist' }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/Stats.vue'),
    meta: { title: '统计分析', section: 'data' }
  },
  {
    path: '/translate',
    name: 'Translate',
    component: () => import('@/views/Translate.vue'),
    meta: { title: '多语言支持', section: 'data' }
>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
<<<<<<< HEAD
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/')
  } else {
    next()
  }
=======
  document.title = to.meta.title ? `${to.meta.title} - 采购文件智能生成系统` : '采购文件智能生成系统'
  next()
>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
})

export default router