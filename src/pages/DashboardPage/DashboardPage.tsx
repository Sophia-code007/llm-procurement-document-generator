import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Clock,
  FileClock,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  FileSignature,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MOCK_DASHBOARD_STATS } from '@/data/dashboard';
import { MOCK_FILES } from '@/data/files';

const statusMap: Record<string, { label: string; variant: string }> = {
  draft: { label: '草稿', variant: 'secondary' },
  pending: { label: '待审核', variant: 'default' },
  approved: { label: '已通过', variant: 'default' },
  rejected: { label: '已驳回', variant: 'destructive' },
};

const kpiConfig = [
  {
    key: 'monthlyGeneratedCount',
    label: '本月生成文件数',
    value: (s: typeof MOCK_DASHBOARD_STATS) => s.monthlyGeneratedCount,
    unit: '份',
    trend: (s: typeof MOCK_DASHBOARD_STATS) => s.monthlyGeneratedTrend,
    icon: FileText,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    key: 'compliancePassRate',
    label: '合规通过率',
    value: (s: typeof MOCK_DASHBOARD_STATS) => `${s.compliancePassRate}%`,
    unit: '',
    trend: (s: typeof MOCK_DASHBOARD_STATS) => s.compliancePassRateTrend,
    icon: ShieldCheck,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    key: 'avgGenerationDuration',
    label: '平均生成时长',
    value: (s: typeof MOCK_DASHBOARD_STATS) => s.avgGenerationDuration,
    unit: '',
    trend: (s: typeof MOCK_DASHBOARD_STATS) => s.avgGenerationDurationTrend,
    icon: Clock,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    key: 'pendingReviewCount',
    label: '待审核文件',
    value: (s: typeof MOCK_DASHBOARD_STATS) => s.pendingReviewCount,
    unit: '份',
    trend: (s: typeof MOCK_DASHBOARD_STATS) => s.pendingReviewTrend,
    icon: FileClock,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const stats = MOCK_DASHBOARD_STATS;

  const recentFiles = useMemo(() => MOCK_FILES.slice(0, 5), []);

  const handleCreateBid = () => {
    navigate('/create?type=bid');
  };

  const handleCreateContract = () => {
    navigate('/create?type=contract');
  };

  const handleViewFile = (fileId: string) => {
    navigate('/create/preview');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="size-4 text-success" />;
      case 'pending':
        return <AlertCircle className="size-4 text-warning" />;
      case 'rejected':
        return <XCircle className="size-4 text-destructive" />;
      default:
        return <Clock className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* 欢迎区 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">工作台</h2>
          <p className="text-sm text-muted-foreground mt-1">
            欢迎回来，今天也要高效完成采购文件编制工作哦~
          </p>
        </div>
      </div>

      {/* 数据概览卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.icon;
          const trendVal = kpi.trend(stats);
          const isUp = trendVal > 0;
          const isGood =
            kpi.key === 'avgGenerationDuration' || kpi.key === 'pendingReviewCount'
              ? !isUp
              : isUp;
          return (
            <Card key={kpi.key} className="border border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground tabular-nums">
                        {kpi.value(stats)}
                      </span>
                      <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {isUp ? (
                        <TrendingUp
                          className={`size-3 ${isGood ? 'text-success' : 'text-destructive'}`}
                        />
                      ) : (
                        <TrendingDown
                          className={`size-3 ${isGood ? 'text-success' : 'text-destructive'}`}
                        />
                      )}
                      <span className={isGood ? 'text-success' : 'text-destructive'}>
                        {Math.abs(trendVal)}%
                      </span>
                      <span className="text-muted-foreground">较上月</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bg}`}>
                    <Icon className={`size-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">新建招标书</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI 智能生成招标公告、投标人须知、技术规格书等
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreateBid}
                className="gap-1"
              >
                <Plus className="size-4" />
                新建
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <FileSignature className="size-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">新建采购合同</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    一键生成标准合同条款，自动匹配采购标的物
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleCreateContract}
                className="gap-1"
              >
                <Plus className="size-4" />
                新建
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近文件列表 */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">最近文件</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={() => navigate('/create/preview')}
          >
            查看全部
            <ArrowRight className="size-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">文件名</TableHead>
                  <TableHead className="whitespace-nowrap">类型</TableHead>
                  <TableHead className="whitespace-nowrap">创建时间</TableHead>
                  <TableHead className="whitespace-nowrap">状态</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => handleViewFile(file.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        {file.fileType === 'bid' ? (
                          <FileText className="size-4 shrink-0 text-primary" />
                        ) : (
                          <FileSignature className="size-4 shrink-0 text-success" />
                        )}
                        <span className="truncate max-w-[240px]">{file.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {file.fileType === 'bid' ? '招标书' : '采购合同'}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {file.createdAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        <Badge
                          variant={
                            statusMap[file.status]?.variant === 'destructive'
                              ? 'destructive'
                              : statusMap[file.status]?.variant === 'secondary'
                              ? 'secondary'
                              : 'default'
                          }
                          className={
                            file.status === 'approved'
                              ? 'bg-success/10 text-success hover:bg-success/15'
                              : file.status === 'pending'
                              ? 'bg-warning/10 text-warning hover:bg-warning/15'
                              : ''
                          }
                        >
                          {statusMap[file.status]?.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFile(file.id);
                        }}
                      >
                        查看
                        <ArrowRight className="size-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
