import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileSignature,
  Save,
  Download,
  FileDown,
  FileType,
  Edit3,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { MOCK_DOCUMENT_TEMPLATES, type IDocumentSection } from '@/data/documenttemplates';

const STEPS = [
  { id: 1, label: '录入需求', path: '/create' },
  { id: 2, label: '字段确认', path: '/create/fields' },
  { id: 3, label: '生成预览', path: '/create/preview' },
  { id: 4, label: '风险检测', path: '/create/risk' },
];

export default function FilePreviewPage() {
  const navigate = useNavigate();
  const [fileType, setFileType] = useState<'bid' | 'contract'>('bid');
  const [activeSectionId, setActiveSectionId] = useState<string>('s1');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [sections, setSections] = useState<IDocumentSection[]>(
    MOCK_DOCUMENT_TEMPLATES[0].sections
  );

  const currentDoc = useMemo(
    () => MOCK_DOCUMENT_TEMPLATES.find((d) => d.type === fileType),
    [fileType]
  );

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId),
    [sections, activeSectionId]
  );

  const handleStepClick = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      navigate(step.path);
    }
  };

  const handleFileTypeChange = (type: string) => {
    const newType = type as 'bid' | 'contract';
    setFileType(newType);
    const doc = MOCK_DOCUMENT_TEMPLATES.find((d) => d.type === newType);
    if (doc) {
      setSections(doc.sections);
      setActiveSectionId(doc.sections[0]?.id || '');
    }
  };

  const startEdit = (section: IDocumentSection) => {
    setEditingSectionId(section.id);
    setEditContent(section.content);
  };

  const saveEdit = () => {
    if (!editingSectionId) return;
    setSections((prev) =>
      prev.map((s) => (s.id === editingSectionId ? { ...s, content: editContent } : s))
    );
    setEditingSectionId(null);
    toast.success('内容已保存');
  };

  const cancelEdit = () => {
    setEditingSectionId(null);
  };

  const handleSaveVersion = () => {
    toast.success('版本已保存，版本号 v1.0.2');
  };

  const handleExport = (format: string) => {
    const content = sections.map((s) => `${s.title}\n\n${s.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc?.name || '采购文件'}.${format === 'pdf' ? 'txt' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${format.toUpperCase()} 文件`);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-4" />;
      if (/^\d+\.\s/.test(line) || /^[一二三四五六七八九十]+、/.test(line)) {
        return (
          <p key={i} className="text-foreground leading-relaxed mb-2">
            {line}
          </p>
        );
      }
      if (/^第[一二三四五六七八九十]+条/.test(line)) {
        return (
          <p key={i} className="text-foreground font-medium leading-relaxed mb-2 mt-4">
            {line}
          </p>
        );
      }
      if (line.startsWith('|') && line.endsWith('|')) {
        return (
          <div key={i} className="text-sm text-muted-foreground font-mono bg-muted/30 px-3 py-1 rounded my-1">
            {line}
          </div>
        );
      }
      return (
        <p key={i} className="text-foreground leading-relaxed mb-2">
          {line}
        </p>
      );
    });
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
                      step.id <= 3
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }`}
                  >
                    {step.id === 3 ? <Check className="size-4" /> : step.id}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      step.id <= 3 ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 md:mx-4 ${
                      step.id < 3 ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 顶部工具栏 */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {fileType === 'bid' ? (
                  <FileText className="size-5 text-primary" />
                ) : (
                  <FileSignature className="size-5 text-success" />
                )}
                <span className="font-semibold text-foreground">
                  {currentDoc?.name}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                草稿
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={fileType} onValueChange={handleFileTypeChange}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="文件类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bid">招标书</SelectItem>
                  <SelectItem value="contract">采购合同</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="secondary" size="sm" onClick={handleSaveVersion} className="gap-1.5">
                <Save className="size-4" />
                保存版本
              </Button>

              <div className="flex items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 rounded-r-none"
                  onClick={() => handleExport('word')}
                >
                  <FileDown className="size-4" />
                  导出 Word
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 rounded-l-none border-l-0"
                  onClick={() => handleExport('pdf')}
                >
                  <Download className="size-4" />
                  PDF
                </Button>
              </div>

              <Button
                onClick={() => navigate('/create/risk')}
                size="sm"
                className="gap-1.5"
              >
                <ShieldAlert className="size-4" />
                风险检测
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧目录 */}
        <Card className="lg:col-span-1 border border-border/50 shadow-sm h-fit sticky top-24">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">文件目录</h3>
            <Separator className="mb-3" />
            <nav className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                    activeSectionId === section.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-xs opacity-60 w-5">{index + 1}</span>
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* 右侧预览区 */}
        <Card className="lg:col-span-4 border border-border/50 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-border/50 px-6 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{activeSection?.title}</h3>
              {!editingSectionId && activeSection && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(activeSection)}
                  className="gap-1.5 text-muted-foreground"
                >
                  <Edit3 className="size-4" />
                  编辑
                </Button>
              )}
              {editingSectionId && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEdit}
                    className="gap-1 text-muted-foreground"
                  >
                    <X className="size-4" />
                    取消
                  </Button>
                  <Button size="sm" onClick={saveEdit} className="gap-1">
                    <Check className="size-4" />
                    保存
                  </Button>
                </div>
              )}
            </div>

            <div className="p-6 md:p-10 bg-muted/20 min-h-[500px]">
              <div className="max-w-3xl mx-auto bg-card rounded-lg shadow-sm border border-border/30 p-8 md:p-12">
                {editingSectionId ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[400px] resize-none font-mono text-sm leading-relaxed"
                  />
                ) : (
                  <article className="prose prose-sm max-w-none">
                    <h2 className="text-xl font-bold text-foreground mb-6 text-center border-b border-border pb-4">
                      {activeSection?.title}
                    </h2>
                    <div className="text-foreground text-sm leading-relaxed">
                      {activeSection && renderContent(activeSection.content)}
                    </div>
                  </article>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部操作栏 */}
      <div className="sticky bottom-0 z-30 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/90 backdrop-blur-md border-t border-border/30">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/create/fields')}>
            返回上一步
          </Button>
          <Button onClick={() => navigate('/create/risk')} size="lg" className="gap-2">
            <ShieldAlert className="size-4" />
            下一步：合规风险检测
          </Button>
        </div>
      </div>
    </div>
  );
}
