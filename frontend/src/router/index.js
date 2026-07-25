import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
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
  },
  {
    path: '/supplier',
    name: 'Supplier',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/')
  } else {
    next()
  }
})

export default router