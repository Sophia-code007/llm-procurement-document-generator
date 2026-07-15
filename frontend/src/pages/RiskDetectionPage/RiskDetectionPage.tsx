import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Wand2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { MOCK_RISKS, type IRisk } from '@/data/risks';

const STEPS = [
  { id: 1, label: '录入需求', path: '/create' },
  { id: 2, label: '字段确认', path: '/create/fields' },
  { id: 3, label: '生成预览', path: '/create/preview' },
  { id: 4, label: '风险检测', path: '/create/risk' },
];

const levelConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  high: {
    label: '高风险',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    icon: AlertTriangle,
  },
  medium: {
    label: '中风险',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: AlertCircle,
  },
  low: {
    label: '低风险',
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/30',
    icon: Info,
  },
};

export default function RiskDetectionPage() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [isFixing, setIsFixing] = useState(false);

  const stats = useMemo(() => {
    const high = MOCK_RISKS.filter((r) => r.level === 'high').length;
    const medium = MOCK_RISKS.filter((r) => r.level === 'medium').length;
    const low = MOCK_RISKS.filter((r) => r.level === 'low').length;
    const total = MOCK_RISKS.length;
    const passRate = total > 0 ? Math.round(((total - high) / total) * 100) : 100;
    return { high, medium, low, total, passRate };
  }, []);

  const filteredRisks = useMemo(() => {
    if (filterLevel === 'all') return MOCK_RISKS;
    return MOCK_RISKS.filter((r) => r.level === filterLevel);
  }, [filterLevel]);

  const handleStepClick = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      navigate(step.path);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleQuickFix = async () => {
    setIsFixing(true);
    toast.loading('正在生成修复建议...', { id: 'fixing' });
    await new Promise((r) => setTimeout(r, 1500));
    toast.success('修复建议已生成，共优化 4 处风险项', { id: 'fixing' });
    setIsFixing(false);
  };

  const handleExportReport = () => {
    const content = `合规风险检测报告\n\n检测时间：2024-01-15\n检测文件：机架式服务器采购招标书\n\n风险概览：\n- 高风险：${stats.high} 项\n- 中风险：${stats.medium} 项\n- 低风险：${stats.low} 项\n- 合规通过率：${stats.passRate}%\n\n风险明细：\n${MOCK_RISKS.map((r, i) => `${i + 1}. [${levelConfig[r.level].label}] ${r.location}\n   风险描述：${r.description}\n   修改建议：${r.suggestion}`).join('\n\n')}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '合规风险检测报告.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('风险报告已导出');
  };

  const handleLocate = (risk: IRisk) => {
    toast.info(`正在定位到：${risk.location}`);
    navigate('/create/preview');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* 步骤条 */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="py-6 px-4 md:px-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id <= 4
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }`}
                  >
                    {step.id === 4 ? <Check className="size-4" /> : step.id}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      step.id <= 4 ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 md:mx-4 ${
                      step.id < 4 ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 标题区 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="size-6 text-primary" />
            合规风险检测
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            基于采购法规及企业内部规范，智能识别文件中的合规风险点
          </p>
        </div>
      </div>

      {/* 风险概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">高风险</p>
                <p className="text-2xl font-bold text-destructive tabular-nums">
                  {stats.high}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning/10">
                <AlertCircle className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">中风险</p>
                <p className="text-2xl font-bold text-warning tabular-nums">
                  {stats.medium}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-info/10">
                <Info className="size-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">低风险</p>
                <p className="text-2xl font-bold text-info tabular-nums">
                  {stats.low}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <ShieldAlert className="size-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">合规通过率</p>
                <p className="text-2xl font-bold text-success tabular-nums">
                  {stats.passRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">风险等级：</span>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'high', label: '高风险' },
                  { value: 'medium', label: '中风险' },
                  { value: 'low', label: '低风险' },
                ].map((item) => (
                  <Button
                    key={item.value}
                    variant={filterLevel === item.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterLevel(item.value)}
                    className="text-xs h-8"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              共 <span className="font-medium text-foreground">{filteredRisks.length}</span> 条风险
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 风险清单 */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">风险清单</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRisks.map((risk, index) => {
            const config = levelConfig[risk.level];
            const Icon = config.icon;
            const isExpanded = expandedId === risk.id;

            return (
              <div
                key={risk.id}
                className={`border rounded-lg overflow-hidden transition-all ${config.border} ${
                  isExpanded ? 'bg-card' : 'bg-card hover:bg-muted/30'
                }`}
              >
                <button
                  onClick={() => toggleExpand(risk.id)}
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <div className={`p-2 rounded-md ${config.bg} shrink-0 mt-0.5`}>
                    <Icon className={`size-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={`${config.bg} ${config.color} border-0`}
                        variant="outline"
                      >
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {risk.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <FileText className="size-3" />
                      {risk.location}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pl-14">
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          风险描述
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {risk.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          修改建议
                        </h4>
                        <div className="p-3 rounded-md bg-muted/50 border border-border/50">
                          <p className="text-sm text-foreground leading-relaxed">
                            {risk.suggestion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocate(risk);
                          }}
                        >
                          <FileText className="size-4" />
                          查看文档位置
                          <ArrowRight className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-muted-foreground"
                        >
                          标记已处理
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredRisks.length === 0 && (
            <div className="py-12 text-center">
              <ShieldAlert className="size-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">暂无该等级的风险项</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 底部操作栏 */}
      <div className="sticky bottom-0 z-30 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/90 backdrop-blur-md border-t border-border/30">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/create/preview')}>
            返回上一步
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleExportReport}
              className="gap-2"
            >
              <Download className="size-4" />
              导出风险报告
            </Button>
            <Button
              onClick={handleQuickFix}
              disabled={isFixing}
              className="gap-2"
            >
              <Wand2 className="size-4" />
              {isFixing ? '生成中...' : '一键修复建议'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
