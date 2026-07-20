<template>
  <div class="stats-page">
    <h2 class="page-title">统计分析</h2>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num" style="color: #2563eb">128</div>
          <div class="stat-label">累计生成文件</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num" style="color: #10b981">86%</div>
          <div class="stat-label">AI解析准确率</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num" style="color: #f59e0b">24</div>
          <div class="stat-label">本月生成数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num" style="color: #8b5cf6">3.2min</div>
          <div class="stat-label">平均生成时长</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header><span style="font-weight: 600">模板类型分布</span></template>
          <div class="chart-placeholder">图表区域</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span style="font-weight: 600">生成趋势</span></template>
          <div class="chart-placeholder">图表区域</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup></script>

<style scoped>
.stats-row { margin-bottom: 8px; }
.stat-card { border-radius: 12px; border: none; }
.stat-num { font-size: 32px; font-weight: 700; line-height: 1.2; }
.stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }
.chart-placeholder {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 8px;
}
</style>
