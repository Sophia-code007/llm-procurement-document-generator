// EXPORTS: IDashboardStats, MOCK_DASHBOARD_STATS
export interface IDashboardStats {
  id: string
  monthlyGeneratedCount: number      // 本月生成文件数
  monthlyGeneratedTrend: number      // 环比增长百分比（正数上升，负数下降）
  compliancePassRate: number         // 合规通过率（0-100）
  compliancePassRateTrend: number    // 环比增长百分比
  avgGenerationDuration: string      // 平均生成时长（如"2.3分钟"）
  avgGenerationDurationTrend: number // 环比变化百分比
  pendingReviewCount: number         // 待审核文件数
  pendingReviewTrend: number         // 环比变化百分比
}

export const MOCK_DASHBOARD_STATS: IDashboardStats = {
  id: '1',
  monthlyGeneratedCount: 128,
  monthlyGeneratedTrend: 15,
  compliancePassRate: 92,
  compliancePassRateTrend: 3,
  avgGenerationDuration: '2.3分钟',
  avgGenerationDurationTrend: -12,
  pendingReviewCount: 8,
  pendingReviewTrend: -5,
}