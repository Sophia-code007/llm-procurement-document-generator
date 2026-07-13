import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, FileText, FileSignature, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';

const STEPS = [
  { id: 1, label: '录入需求', path: '/create' },
  { id: 2, label: '字段确认', path: '/create/fields' },
  { id: 3, label: '生成预览', path: '/create/preview' },
  { id: 4, label: '风险检测', path: '/create/risk' },
];

const exampleTexts = [
  '我需要采购10台机架式服务器，预算50万，要求3年质保，合同签订后30天内交付到宜昌产业园',
  '采购一批办公桌椅，预算20万，要求环保材质，送货到公司总部，货到验收合格后付款',
  '软件开发服务采购，预算80万，周期6个月，需要驻场开发，分四期付款',
];

export default function RequirementInputPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [requirementText, setRequirementText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [fileType, setFileType] = useState<'bid' | 'contract'>('bid');
  const [projectName, setProjectName] = useState('');
  const [purchaseMethod, setPurchaseMethod] = useState('公开招标');
  const [budget, setBudget] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'contract') {
      setFileType('contract');
    }
    const savedText = scopedStorage.getItem('procurement_requirementText');
    if (savedText) {
      setRequirementText(savedText);
    }
  }, [searchParams]);

  const handleUseExample = (text: string) => {
    setRequirementText(text);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!requirementText.trim()) {
      toast.error('请输入采购需求描述');
      return;
    }
    setIsParsing(true);
    scopedStorage.setItem('procurement_requirementText', requirementText);
    scopedStorage.setItem('procurement_fileType', fileType);

    toast.loading('AI 正在智能解析您的采购需求...', { id: 'parsing' });

    // 模拟 AI 解析过程
    await new Promise((r) => setTimeout(r, 1800));

    toast.success('解析完成，已提取 12 个采购字段', { id: 'parsing' });
    setIsParsing(false);
    navigate('/create/fields');
  };

  const handleStepClick = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      navigate(step.path);
    }
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
                      step.id === 1
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      step.id === 1 ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-border mx-2 md:mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 文件类型切换 */}
      <div className="flex gap-2">
        <Button
          variant={fileType === 'bid' ? 'default' : 'secondary'}
          onClick={() => setFileType('bid')}
          className="gap-2"
        >
          <FileText className="size-4" />
          招标书
        </Button>
        <Button
          variant={fileType === 'contract' ? 'default' : 'secondary'}
          onClick={() => setFileType('contract')}
          className="gap-2"
        >
          <FileSignature className="size-4" />
          采购合同
        </Button>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧：自然语言输入区 */}
        <Card className="lg:col-span-3 border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-5 text-primary" />
              自然语言描述需求
            </CardTitle>
            <CardDescription>
              用自然语言描述您的采购需求，AI 将自动提取关键字段
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={requirementText}
                onChange={(e) => setRequirementText(e.target.value)}
                placeholder="例如：我需要采购10台机架式服务器，预算50万，要求3年质保，合同签订后30天内交付到宜昌产业园"
                className="min-h-[280px] resize-none text-base leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {requirementText.length} 字
              </div>
            </div>

            {/* 快捷示例 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lightbulb className="size-3.5" />
                快捷示例，点击填入
              </div>
              <div className="flex flex-wrap gap-2">
                {exampleTexts.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => handleUseExample(text)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors max-w-[320px] truncate"
                  >
                    {text.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：快捷表单录入区 */}
        <Card className="lg:col-span-2 border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">快捷表单录入</CardTitle>
            <CardDescription>手动填写核心字段，或等 AI 自动解析</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">项目名称</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="请输入项目名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseMethod">采购方式</Label>
                <Select value={purchaseMethod} onValueChange={setPurchaseMethod}>
                  <SelectTrigger id="purchaseMethod">
                    <SelectValue placeholder="选择采购方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="公开招标">公开招标</SelectItem>
                    <SelectItem value="邀请招标">邀请招标</SelectItem>
                    <SelectItem value="竞争性谈判">竞争性谈判</SelectItem>
                    <SelectItem value="单一来源">单一来源</SelectItem>
                    <SelectItem value="询价采购">询价采购</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">预算金额（元）</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="请输入预算金额"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">交付地点</Label>
                <Input
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="请输入交付地点"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate">交付期限</Label>
                <Input id="deliveryDate" type="date" />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 底部操作栏 */}
      <div className="sticky bottom-0 z-30 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/90 backdrop-blur-md border-t border-border/30">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <p className="text-sm text-muted-foreground hidden md:block">
            输入需求后，AI 将自动解析并生成完整的采购文件初稿
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isParsing}
            size="lg"
            className="gap-2 ml-auto"
          >
            <Sparkles className="size-4" />
            {isParsing ? 'AI 解析中...' : 'AI 智能解析并生成'}
          </Button>
        </div>
      </div>
    </div>
  );
}
