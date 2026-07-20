<template>
  <div class="placeholder-page">
    <el-card class="placeholder-card">
      <el-icon :size="64" color="#cbd5e1"><Cpu /></el-icon>
      <h2 class="placeholder-title">AI智能问答</h2>
      <p class="placeholder-desc">基于招标文件内容的智能问答助手</p>
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
