<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f1f5f9;
}

.app-container {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 24px;
  min-height: 100vh;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 24px;
}

.action-bar-right {
  display: flex;
  gap: 12px;
}

/* 侧边栏样式 */
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

.menu-item i {
  width: 18px;
  text-align: center;
}
</style>
