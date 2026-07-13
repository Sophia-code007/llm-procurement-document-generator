import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Pencil,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  Package,
  DollarSign,
  Truck,
  CreditCard,
  ShieldCheck,
  FileText,
  Scale,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MOCK_EXTRACTED_FIELDS, type IPurchaseFields, type IPurchaseItem } from '@/data/extractedfields';

const STEPS = [
  { id: 1, label: '录入需求', path: '/create' },
  { id: 2, label: '字段确认', path: '/create/fields' },
  { id: 3, label: '生成预览', path: '/create/preview' },
  { id: 4, label: '风险检测', path: '/create/risk' },
];

interface FieldGroup {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldDef[];
}

interface FieldDef {
  key: keyof IPurchaseFields | string;
  label: string;
  enLabel: string;
  required?: boolean;
  type: 'text' | 'number' | 'select' | 'date' | 'switch' | 'list';
  options?: string[];
}

const fieldGroups: FieldGroup[] = [
  {
    key: 'basic',
    title: '基础采购信息',
    icon: Info,
    fields: [
      { key: 'purchaseProjectName', label: '采购项目名称', enLabel: 'purchaseProjectName', required: true, type: 'text' },
      { key: 'purchaseOrgName', label: '采购组织单位', enLabel: 'purchaseOrgName', required: true, type: 'text' },
      { key: 'purchaseMethod', label: '采购方式', enLabel: 'purchaseMethod', required: true, type: 'select', options: ['公开招标', '邀请招标', '竞争性谈判', '单一来源', '询价采购'] },
      { key: 'purchaseCategory', label: '采购类别', enLabel: 'purchaseCategory', required: true, type: 'select', options: ['货物类', '服务类', '工程类'] },
    ],
  },
  {
    key: 'items',
    title: '采购标的物信息',
    icon: Package,
    fields: [
      { key: 'purchaseItemList', label: '采购清单明细', enLabel: 'purchaseItemList', required: true, type: 'list' },
    ],
  },
  {
    key: 'price',
    title: '商务报价',
    icon: DollarSign,
    fields: [
      { key: 'totalBudgetAmount', label: '预算总金额', enLabel: 'totalBudgetAmount', required: true, type: 'number' },
    ],
  },
  {
    key: 'delivery',
    title: '交付履约',
    icon: Truck,
    fields: [
      { key: 'deliveryAddress', label: '交付地点', enLabel: 'deliveryAddress', required: true, type: 'text' },
      { key: 'deliveryDeadline', label: '交付期限', enLabel: 'deliveryDeadline', required: true, type: 'text' },
    ],
  },
  {
    key: 'payment',
    title: '付款条款',
    icon: CreditCard,
    fields: [
      { key: 'paymentMode', label: '付款方式', enLabel: 'paymentMode', required: true, type: 'text' },
    ],
  },
  {
    key: 'warranty',
    title: '质保售后',
    icon: ShieldCheck,
    fields: [
      { key: 'warrantyPeriod', label: '质保期限', enLabel: 'warrantyPeriod', required: true, type: 'text' },
    ],
  },
  {
    key: 'bid',
    title: '招标专属字段',
    icon: FileText,
    fields: [
      { key: 'bidDeadline', label: '投标截止时间', enLabel: 'bidDeadline', required: false, type: 'text' },
    ],
  },
  {
    key: 'compliance',
    title: '合规风控',
    icon: Scale,
    fields: [
      { key: 'isGovernmentProcurement', label: '是否政府采购', enLabel: 'isGovernmentProcurement', required: false, type: 'switch' },
    ],
  },
];

export default function FieldConfirmPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<IPurchaseFields>(MOCK_EXTRACTED_FIELDS);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const missingRequiredCount = useMemo(() => {
    let count = 0;
    fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.required) {
          const val = (fields as unknown as Record<string, unknown>)[field.key];
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
            count++;
          }
        }
      });
    });
    return count;
  }, [fields]);

  const handleStepClick = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      navigate(step.path);
    }
  };

  const startEdit = (key: string, value: string | number) => {
    setEditingField(key);
    setEditValue(String(value));
  };

  const saveEdit = (key: keyof IPurchaseFields) => {
    setFields((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'number' ? Number(editValue) : editValue,
    }));
    setEditingField(null);
    toast.success('字段已更新');
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  const handleSwitchChange = (key: keyof IPurchaseFields, checked: boolean) => {
    setFields((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSelectChange = (key: keyof IPurchaseFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = async () => {
    if (missingRequiredCount > 0) {
      toast.error(`还有 ${missingRequiredCount} 个必填字段未填写`);
      return;
    }
    toast.loading('正在生成采购文件...', { id: 'generating' });
    await new Promise((r) => setTimeout(r, 1500));
    toast.success('文件生成完成', { id: 'generating' });
    navigate('/create/preview');
  };

  const renderFieldValue = (field: FieldDef) => {
    const key = field.key as keyof IPurchaseFields;
    const value = fields[key];
    const isRequired = field.required;
    const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

    if (editingField === field.key) {
      if (field.type === 'select') {
        return (
          <Select value={String(value)} onValueChange={(v) => handleSelectChange(key, v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <Input
            type={field.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveEdit(key)}>
            <Check className="size-4 text-success" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
            <X className="size-4 text-muted-foreground" />
          </Button>
        </div>
      );
    }

    if (field.type === 'list') {
      const items = fields.purchaseItemList;
      return (
        <div className="space-y-2">
          {items.map((item: IPurchaseItem) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="font-medium truncate">{item.name}</span>
                <span className="text-muted-foreground truncate">
                  {item.specification}
                </span>
              </div>
              <span className="shrink-0 text-muted-foreground">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'switch') {
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleSwitchChange(key, checked)}
          />
          <span className="text-sm text-muted-foreground">
            {value ? '是' : '否'}
          </span>
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isEmpty && isRequired ? 'text-destructive' : 'text-foreground'}`}>
            {String(value || '—')}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => startEdit(field.key, String(value || ''))}
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${
            isEmpty && isRequired ? 'text-destructive font-medium' : 'text-foreground'
          }`}
        >
          {field.type === 'number' && value
            ? `¥${Number(value).toLocaleString()}`
            : String(value || '—')}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => startEdit(field.key, String(value || ''))}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    );
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
                      step.id <= 2
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }`}
                  >
                    {step.id === 2 ? <Check className="size-4" /> : step.id}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      step.id <= 2 ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 md:mx-4 ${
                      step.id < 2 ? 'bg-primary' : 'bg-border'
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
          <h2 className="text-xl font-bold text-foreground">字段确认</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI 已从您的需求描述中提取以下字段，请确认或修改
          </p>
        </div>
        {missingRequiredCount > 0 ? (
          <Badge variant="destructive" className="w-fit gap-1">
            <AlertTriangle className="size-3.5" />
            缺失 {missingRequiredCount} 个必填字段
          </Badge>
        ) : (
          <Badge className="w-fit gap-1 bg-success/10 text-success hover:bg-success/15">
            <CheckCircle2 className="size-3.5" />
            全部必填字段已完整
          </Badge>
        )}
      </div>

      {/* 字段分类卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.key} className="border border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  {group.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  共 {group.fields.length} 个字段
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.fields.map((field) => {
                  const value = (fields as unknown as Record<string, unknown>)[field.key];
                  const isEmpty =
                    value === undefined ||
                    value === null ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0);
                  const isMissing = field.required && isEmpty;

                  return (
                    <div
                      key={field.key}
                      className={`group flex flex-col gap-1 p-3 rounded-lg border transition-colors ${
                        isMissing
                          ? 'border-destructive/30 bg-destructive/5'
                          : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-destructive text-xs">*</span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          {field.enLabel}
                        </span>
                      </div>
                      <div className="min-h-[32px]">{renderFieldValue(field)}</div>
                      {isMissing && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="size-3" />
                          此字段为必填项，请补充
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底部操作栏 */}
      <div className="sticky bottom-0 z-30 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/90 backdrop-blur-md border-t border-border/30">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/create')}>
            返回上一步
          </Button>
          <Button onClick={handleConfirm} size="lg" className="gap-2">
            <CheckCircle2 className="size-4" />
            确认字段，生成文件
          </Button>
        </div>
      </div>
    </div>
  );
}
