<template>
  <div class="placeholder-page">
    <el-card class="placeholder-card">
      <el-icon :size="64" color="#cbd5e1"><Share /></el-icon>
      <h2 class="placeholder-title">版本管理</h2>
      <p class="placeholder-desc">管理文件的多个版本，支持版本对比和回滚</p>
      <el-tag type="info">功能开发中</el-tag>
    </el-card>
  </div>
</template>

<script setup></script>

<style scoped>
.placeholder-page { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
.placeholder-card { text-align: center; padding: 48px 64px; border-radius: 16px; min-width: 400px; }
.placeholder-title { font-size: 20px; font-weight: 600; color: #0f172a; margin: 20px 0 8px; }
.placeholder-desc { color: #64748b; font-size: 14px; margin-bottom: 20px; }
</style>
