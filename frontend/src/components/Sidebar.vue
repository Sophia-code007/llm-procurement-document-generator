<template>
  <div class="sidebar">
    <div class="sidebar-brand">
      <el-icon><Document /></el-icon>
      <span>采购文件智能生成</span>
    </div>
    
    <div class="sidebar-menu">
      <div class="menu-section">工作台</div>
      <router-link to="/dashboard" class="menu-item" :class="{ active: isActive('dashboard') }">
        <el-icon><HomeFilled /></el-icon>
        <span>工作台</span>
      </router-link>
      
      <div class="menu-section">文件生成</div>
      <router-link to="/template-select" class="menu-item" :class="{ active: isActive('template-select') }">
        <el-icon><Files /></el-icon>
        <span>模板选择</span>
      </router-link>
      <router-link to="/input-method" class="menu-item" :class="{ active: isActive('input-method') }">
        <el-icon><MagicStick /></el-icon>
        <span>录入方式</span>
      </router-link>
      <router-link to="/ai-input" class="menu-item" :class="{ active: isActive('ai-input') }">
        <el-icon><ChatDotRound /></el-icon>
        <span>自然语言录入</span>
      </router-link>
      <router-link to="/field-form" class="menu-item" :class="{ active: isActive('field-form') }">
        <el-icon><EditPen /></el-icon>
        <span>表单填写</span>
      </router-link>
      <router-link to="/generating" class="menu-item" :class="{ active: isActive('generating') }">
        <el-icon><Setting /></el-icon>
        <span>生成中</span>
      </router-link>
      <router-link to="/doc-preview" class="menu-item" :class="{ active: isActive('doc-preview') }">
        <el-icon><Document /></el-icon>
        <span>文件预览</span>
      </router-link>
      <router-link to="/contract" class="menu-item" :class="{ active: isActive('contract') }">
        <el-icon><Stamp /></el-icon>
        <span>合同生成</span>
      </router-link>
      
      <div class="menu-section">辅助功能</div>
      <router-link to="/history" class="menu-item" :class="{ active: isActive('history') }">
        <el-icon><Clock /></el-icon>
        <span>历史复用</span>
      </router-link>
      <router-link to="/collaborate" class="menu-item" :class="{ active: isActive('collaborate') }">
        <el-icon><User /></el-icon>
        <span>协同编辑</span>
      </router-link>
      <router-link to="/version" class="menu-item" :class="{ active: isActive('version') }">
        <el-icon><Share /></el-icon>
        <span>版本管理</span>
      </router-link>
      <router-link to="/ai-assist" class="menu-item" :class="{ active: isActive('ai-assist') }">
        <el-icon><Cpu /></el-icon>
        <span>AI智能问答</span>
      </router-link>
      <router-link to="/supplier" class="menu-item" :class="{ active: isActive('supplier') }">
        <el-icon><OfficeBuilding /></el-icon>
        <span>供应商推荐</span>
      </router-link>
      <router-link to="/compliance" class="menu-item" :class="{ active: isActive('compliance') }">
        <el-icon><ShieldCheck /></el-icon>
        <span>合规审查</span>
      </router-link>
      
      <div class="menu-section">数据中心</div>
      <router-link to="/stats" class="menu-item" :class="{ active: isActive('stats') }">
        <el-icon><DataAnalysis /></el-icon>
        <span>统计分析</span>
      </router-link>
      <router-link to="/translate" class="menu-item" :class="{ active: isActive('translate') }">
        <el-icon><ChatLineSquare /></el-icon>
        <span>多语言支持</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path) {
  return route.path === '/' + path
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #1e293b;
  color: #cbd5e1;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-brand {
  padding: 20px;
  border-bottom: 1px solid #334155;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-menu {
  padding: 12px 0;
}

.menu-section {
  padding: 12px 20px 6px;
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.menu-item {
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  transition: all 0.2s;
  color: #cbd5e1;
  text-decoration: none;
}

.menu-item:hover {
  background: #334155;
  color: #fff;
}

.menu-item.active {
  background: #2563eb;
  color: #fff;
}

.menu-item .el-icon {
  width: 18px;
  font-size: 16px;
}
</style>
