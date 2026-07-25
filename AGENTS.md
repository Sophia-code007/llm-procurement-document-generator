# 采购文件智能生成系统 - 需求拆解文档

## 产品概述

- **产品类型**: 企业级SaaS工具（采购文件智能生成）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 企业采购部门人员、招标专员、合同管理员
- **核心价值**: 通过AI自然语言解析，一键生成招标书/采购合同初稿，附带合规风险预审，大幅提升采购文件编制效率和合规性
- **界面语言**: 中文
- **主题偏好**: 浅色（专业企业级SaaS风格，主色调深蓝色 #165DFF）
- **导航模式**: 路径导航
- **导航布局**: Sidebar（左侧固定侧边栏 + 顶部导航栏）

---

## 页面结构总览

> **说明**：共5个核心页面，均为一级页面，通过侧边栏导航切换访问

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 工作台首页 | `DashboardPage.tsx` | `/` | 一级 | 导航 |
| 需求录入页 | `RequirementInputPage.tsx` | `/create` | 一级 | 导航 / 工作台快捷入口按钮 |
| 字段确认页 | `FieldConfirmPage.tsx` | `/create/fields` | 一级 | 导航 / 需求录入页 → 点击"AI智能解析并生成" |
| 文件预览编辑页 | `FilePreviewPage.tsx` | `/create/preview` | 一级 | 导航 / 字段确认页 → 点击"确认字段，生成文件" |
| 合规风险检测页 | `RiskDetectionPage.tsx` | `/create/risk` | 一级 | 导航 / 文件预览页 → 进入风险检测 |

> **补充说明**：需求录入、字段确认、文件预览、风险检测四页构成完整生成流程，通过顶部步骤条串联，同时支持侧边栏直接跳转访问（各页均有独立演示数据）。

---

## 页面布局建议

### 工作台首页（Dashboard）
- **布局模式**: 上下分区（顶部概览卡片行 + 下方快捷入口 + 最近文件列表）
- **视觉重心**: 数据概览 + 快捷入口（引导用户快速发起新建）
- **结果承载区**: 最近文件列表（展示历史生成记录）；初始态为完整 mock 数据

### 需求录入页
- **布局模式**: 左右分栏（左侧自然语言输入区 + 右侧快捷表单区）+ 顶部步骤条 + 底部操作栏
- **视觉重心**: 自然语言输入区（核心交互入口）
- **结果承载区**: 右侧表单字段实时联动展示（AI解析预览）；初始态为 placeholder + 空表单

### 字段确认页
- **布局模式**: 单栏流式布局（顶部步骤条 + 分类字段卡片组 + 底部操作栏）
- **视觉重心**: 字段分类卡片（用户确认/修改AI提取结果）
- **结果承载区**: 字段卡片组；初始态为完整 mock 提取字段数据

### 文件预览编辑页
- **布局模式**: 左右分栏（左侧文件目录导航 + 右侧富文本预览区）+ 顶部工具栏
- **视觉重心**: 右侧富文本预览区（文件正文编辑）
- **结果承载区**: 富文本预览区；初始态为完整 mock 招标书/合同文本

### 合规风险检测页
- **布局模式**: 上下分区（顶部风险概览卡片 + 下方风险清单列表）+ 底部操作栏
- **视觉重心**: 风险清单列表（核心审查内容）
- **结果承载区**: 风险清单 + 概览统计；初始态为完整 mock 风险数据

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| 采购需求字段提取 | `ai-text-to-json` | 从用户输入的自然语言采购需求中提取结构化采购字段（项目名称、预算、交付、质保等） | unary | 需求录入页 / 字段确认页 |
| 采购文件生成 | `ai-text-generate` | 根据确认后的结构化字段，生成招标书/采购合同全文内容 | stream | 字段确认页 / 文件预览编辑页 |
| 合规风险审查 | `ai-categorization` | 对生成的采购文件进行合规性审查，识别高/中/低风险项并给出修改建议 | unary | 合规风险检测页 |

> **说明**：本原型为高保真演示原型，用户明确要求"使用模拟数据，不需要真实后端和数据库"。以上插件为系统真实业务逻辑对应的能力，原型阶段使用 mock 数据模拟插件输出效果，确保前端交互完整可演示。

---

## 导航配置

- **导航布局**: Sidebar（左侧固定侧边栏 + 顶部导航栏）
- **侧边栏宽度**: 240px
- **顶部栏高度**: 64px
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标 |
|---------|------|------|
| 工作台首页 | `/` | Dashboard |
| 新建文件 | `/create` | FilePlus |
| 字段确认 | `/create/fields` | CheckSquare |
| 文件预览 | `/create/preview` | FileText |
| 风险检测 | `/create/risk` | ShieldAlert |

- **顶部栏内容**: 左侧系统标题"采购文件智能生成系统"，右侧用户头像 + 用户名

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 工作台统计数据（本月生成数、合规通过率等） | demo-mock | `src/data/dashboard.ts` 中定义静态统计数据 | ✅ 本身就是 mock |
| 最近文件列表 | demo-mock | `src/data/files.ts` 中定义 5 条最近文件记录 | ✅ 本身就是 mock |
| 自然语言需求输入 | local-persist | localStorage 暂存用户输入的需求文本，支持步骤间返回保留 | 无 |
| AI 字段提取结果 | demo-mock | `src/data/extractedFields.ts` 中定义完整分类字段 mock 数据，模拟 AI 解析输出 | ✅ 本身就是 mock |
| 采购字段编辑保存 | local-persist | localStorage 保存用户修改后的字段，供后续生成步骤使用 | 无 |
| 生成的招标书/合同全文 | demo-mock | `src/data/documentTemplates.ts` 中定义完整的招标书和合同 mock 文本（带格式） | ✅ 本身就是 mock |
| 合规风险检测结果 | demo-mock | `src/data/risks.ts` 中定义高/中/低风险项 mock 数据 | ✅ 本身就是 mock |
| 文件导出（Word/PDF/风险报告） | import-export | Blob + URL.createObjectURL + a.click 触发下载，导出 mock 文档内容 | 无 |

> **说明**：用户明确要求"使用模拟数据，不需要真实后端和数据库"，因此核心业务数据均为 demo-mock 类型。localStorage 仅用于步骤间状态保持和用户编辑内容暂存，确保流程连贯性。

---

## 功能列表

### 页面：工作台首页（Dashboard）
- **页面目标**: 展示采购文件生成概览数据，提供快速入口和最近文件访问
- **功能点**:
  - **数据概览展示**: 展示本月生成文件数、合规通过率、平均生成时长、待审核文件 4 个 KPI 卡片，带数值+趋势指示
  - **快捷新建入口**: 两个大按钮（新建招标书、新建采购合同），点击跳转至需求录入页并预设文件类型
  - **最近文件列表**: 表格展示最近 5 份文件（文件名、类型、创建时间、状态），状态用不同颜色标签区分
  - **文件快捷操作**: 最近文件列表行支持点击查看，跳转至对应文件的预览编辑页

### 页面：需求录入页
- **页面目标**: 收集用户采购需求（自然语言 + 表单两种方式），发起 AI 智能解析
- **功能点**:
  - **步骤条导航**: 顶部 4 步步骤条（录入需求→字段确认→生成预览→风险检测），支持点击跳转对应步骤
  - **自然语言输入**: 左侧大文本框，支持多行输入，placeholder 提供示例文案，实时显示字数统计
  - **快捷表单录入**: 右侧核心字段表单（项目名称、采购方式、预算金额、交付地点等），支持手动填写
  - **AI 智能解析触发**: 底部"AI智能解析并生成"主按钮，点击后展示加载动效，跳转至字段确认页（模拟解析过程）

### 页面：字段确认页
- **页面目标**: 展示 AI 提取的结构化字段，供用户确认和修改
- **功能点**:
  - **分类字段展示**: 按 8 个分类（基础采购信息、采购标的物信息、商务报价、交付履约、付款条款、质保售后、招标专属字段、合规风控）分组展示字段卡片
  - **字段中英文对照**: 每个字段显示中文名 + 英文标识（如 purchaseProjectName 采购项目名称）
  - **字段编辑修改**: 每个字段值可点击直接编辑（输入框/下拉选择/日期选择等），修改即时生效
  - **必填项校验提示**: 缺失必填字段标红显示，底部显示缺失数量提示
  - **确认生成操作**: 底部"确认字段，生成文件"按钮，点击后跳转至文件预览编辑页

### 页面：文件预览编辑页
- **页面目标**: 展示生成的采购文件全文，支持在线编辑和导出
- **功能点**:
  - **文件目录导航**: 左侧目录树（招标公告、投标人须知、技术规格书、合同条款、附件），点击跳转至对应章节
  - **富文本预览与编辑**: 右侧展示带格式排版的文件全文，点击段落可直接编辑修改（所见即所得）
  - **文件类型切换**: 顶部工具栏支持切换招标书/合同两种文件类型，内容同步切换
  - **版本保存**: 保存当前编辑版本，toast 提示保存成功
  - **文件导出**: 支持导出 Word 和 PDF 两种格式，触发浏览器下载

### 页面：合规风险检测页
- **页面目标**: 展示文件合规风险检测结果，支持风险定位和修复
- **功能点**:
  - **风险概览统计**: 顶部 4 个统计卡片（高风险、中风险、低风险数量 + 合规通过率百分比）
  - **风险清单列表**: 列表展示所有风险项，含风险等级标签（红/黄/蓝）、风险位置、风险描述
  - **风险详情展开**: 点击风险项可展开查看修改建议和详细说明
  - **风险定位跳转**: 点击"查看位置"跳转至文件预览页对应段落（原型中模拟跳转效果）
  - **一键修复建议**: 底部按钮触发，展示 toast 提示"修复建议已生成"（模拟效果）
  - **风险报告导出**: 导出风险检测报告（PDF 格式），触发浏览器下载

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__global_procurement_currentFileType` | 当前创建的文件类型，`'bid' | 'contract'` | 需求录入页、字段确认页、文件预览页、风险检测页 |
| `__global_procurement_requirementText` | 用户输入的自然语言需求文本，`string` | 需求录入页、字段确认页 |
| `__global_procurement_fields` | 确认后的采购字段数据，`IPurchaseFields` | 字段确认页、文件预览页、风险检测页 |
| `__global_procurement_recentFiles` | 最近文件列表，`IFileItem[]` | 工作台首页、文件预览页 |

```ts
// 采购字段接口
interface IPurchaseFields {
  // 基础采购信息
  purchaseProjectName: string;      // 采购项目名称
  purchaseOrgName: string;          // 采购组织单位
  purchaseMethod: string;           // 采购方式
  purchaseCategory: string;         // 采购类别
  
  // 采购标的物信息
  purchaseItemList: IPurchaseItem[]; // 采购清单明细
  
  // 商务报价
  totalBudgetAmount: number;        // 预算总金额
  
  // 交付履约
  deliveryAddress: string;          // 交付地点
  deliveryDeadline: string;         // 交付期限
  
  // 付款条款
  paymentMode: string;              // 付款方式
  
  // 质保售后
  warrantyPeriod: string;           // 质保期限
  
  // 招标专属字段
  bidDeadline: string;              // 投标截止时间
  
  // 合规风控
  isGovernmentProcurement: boolean; // 是否政府采购
}

interface IPurchaseItem {
  id: string;
  name: string;        // 物品名称
  specification: string; // 规格型号
  quantity: number;    // 数量
  unit: string;        // 单位
  estimatedPrice: number; // 预估单价
}

interface IFileItem {
  id: string;
  fileName: string;     // 文件名
  fileType: 'bid' | 'contract'; // 文件类型
  createdAt: string;    // 创建时间
  status: 'draft' | 'pending' | 'approved' | 'rejected'; // 状态
  riskLevel?: 'high' | 'medium' | 'low'; // 风险等级（可选）
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 无参考图，按产品语义与企业采购场景自主设计
- **核心情绪 / 应用类型**: 面向企业采购部门的AI生产力工具，情绪关键词：专业、可信、高效、精密
- **独特记忆点**: 以"采购文件+AI智能提取"为语义锚点，用字段卡片分组的结构化视觉语言贯穿字段确认页，配合蓝色进度光晕体现AI解析过程

## 2. Art Direction

- **方向名**: 企业级精密SaaS
- **Design Style**: Swiss Minimalist + Material Order —— 瑞士极简的网格秩序感搭配Material的层级阴影，适合B端采购工具的专业高效气质
- **DNA 参数**: 圆角 medium（rounded-md / rounded-lg）/ 阴影 subtle-to-layered（shadow-sm ~ shadow-md）/ 间距 standard（gap-4 / p-6）/ 字体方向 现代无衬线、中文清晰易读 / 装饰手法 细线分隔、轻量渐变按钮、字段分组卡片
- **应用类型**: Workflow Tool —— 左侧固定侧边栏 + 顶部导航 + 主内容区任务流布局

## 3. Color System

**色彩关系**: 深蓝品牌主色 + 同色系浅蓝反馈底 + 冷白中性背景 + 深墨灰正文
**配色设计理由**: 主色深蓝承担品牌识别与主行动CTA，传递企业采购所需的专业可信；冷白背景降低长时间操作的视觉疲劳；浅灰accent承接hover、选中、骨架屏等轻量反馈；语义色用于风险等级与合规状态。
**主色推导**: 以用户指定的 #165DFF 为锚点，转换为 HSL(221 100% 54%)，通过明度提升/降低衍生accent与primaryForeground；中性色从冷灰阶推导，保持与主色同色温。
**使用比例**: 65% 中性 / 25% 辅助浅蓝 / 10% primary深蓝；primary仅用于主按钮、当前页高亮、关键状态标签，tab/icon/边框/链接使用accent或中性色。

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(214 32% 97%) | 页面背景，冷调浅灰 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 卡片、表单、弹层承载面 |
| text | `--foreground` | `text-foreground` | hsl(217 33% 17%) | 标题和正文，深墨灰 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 16% 47%) | 说明、辅助元信息、占位符 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(221 100% 54%) | 主交互、CTA、激活态、品牌识别（#165DFF） |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | primary上的文字图标 |
| accent | `--accent` | `bg-accent` | hsl(220 100% 96%) | hover/focus浅底、选中浅底、菜单项状态 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(221 100% 45%) | accent上的文字图标，深蓝低饱和 |
| border | `--border` | `border-border` | hsl(214 20% 90%) | 输入框、卡片、菜单边界 |

**语义色提示**: 
- 高风险（红）: bg hsl(0 85% 96%) / border hsl(0 80% 85%) / text hsl(0 75% 42%) —— 饱和度与primary对齐，用于高风险标签、错误提示
- 中风险（橙）: bg hsl(32 95% 95%) / border hsl(32 90% 82%) / text hsl(28 80% 38%) —— 用于中风险标签、警告提示
- 低风险（蓝）: bg hsl(210 100% 96%) / border hsl(210 90% 85%) / text hsl(215 85% 40%) —— 用于低风险、提示信息
- 成功（绿）: bg hsl(145 60% 95%) / border hsl(145 50% 80%) / text hsl(150 60% 30%) —— 用于合规通过、成功状态
- 所有语义色饱和度控制在 50%-85%，与primary色温偏冷方向对齐，避免突兀

## 4. 字体与节奏

- **font-display**: Inter + Noto Sans SC —— 现代无衬线，数字与英文清晰，中文稳重，适合企业SaaS标题与数据展示
- **font-body**: Inter + Noto Sans SC —— 正文阅读舒适，长表单与文档预览不累眼
- **字号**: H1 text-2xl ~ text-3xl（页面标题）；H2 text-lg ~ text-xl（卡片标题、分组标题）；body text-sm ~ text-base；muted text-xs ~ text-sm。
- **圆角**: 中 —— 卡片 rounded-lg，按钮 rounded-md，输入框 rounded-md，标签 rounded-full；既不尖锐也不过于圆润，保持专业感

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导，5个核心页面通过左侧固定侧边栏切换
- **Page / Section Order**: 工作台首页 → 需求录入页 → 字段确认页 → 文件预览编辑页 → 合规风险检测页，与需求1:1对齐
- **Standard Content Zone**: 后台 `max-w-[1400px]` + `mx-auto`，适配B端多卡片、宽表格、分栏布局
- **Shell / Frame Alignment**: 左侧固定侧边栏（240px）+ 顶部导航栏（60px），内容区独立滚动，内容容器与框架右内边距对齐
- **Padding & Rhythm**: `px-6 lg:px-8 py-6`，卡片内 `p-5 ~ p-6`，保持 4/8px 倍数节奏
- **Full-bleed Zones**: 顶部导航栏、侧边栏全高；页面内部无全宽例外，所有内容受Standard Content Zone约束
- **Local Narrowing**: 需求录入表单、字段确认详情可在容器内使用 `max-w-4xl` 居中，文件预览页左右分栏占满内容区
- **Overflow Strategy**: 字段分组卡片、风险清单、最近文件表格使用 `overflow-x-auto`，步骤条在窄屏横向滚动
- **Flexibility Boundary**: 允许移动端侧边栏折叠、卡片内边距微调、列表列数自适应；不允许切换主色、圆角系统、阴影语言或导航模式

## 6. 视觉与动效

- **装饰**: 细线分隔、字段分组卡片边框、AI解析进度光晕
- **阴影/边界**: 轻到中 —— 卡片 shadow-sm，hover 时 shadow-md，弹层 shadow-lg；边界用 1px solid border
- **动效**: 克制 —— 按钮/卡片 hover 有 150ms 过渡，AI解析有进度条与微光动效，风险项展开有 200ms 高度过渡；无多余入场动画

## 7. 组件原则

- 按钮、表单、菜单、卡片必须有 Default / Hover / Active / Focus-visible / Disabled 状态
- Primary 承担主行动（生成、确认、导出）；Secondary 用 outline + 中性色；Ghost 按钮用于工具栏次要操作
- 步骤条当前步用 primary 填充，已完成用 primary 线框+对勾，未完成用中性灰
- 字段卡片分组用浅border + 轻背景区分，必填缺失字段左侧加红色竖条提示
- 加载与空状态延续同色系浅底 + 图标，不使用默认shadcn样式

## 8. Image Direction

- **Image Role**: 无强制图片需求，优先通过排版、色彩、字段卡片分组和数据可视化建立视觉记忆点
- **Image Art Direction**: 无强制图片需求
- **Image Prompt Keywords**: 无
- **Image Avoidance**: 避免通用商务人物握手图、无意义抽象科技蓝渐变图、廉价办公场景素材库图

## 9. Anti-patterns

- **Split personality**: 页面之间切换主色、圆角或阴影语言；全站共享同一套深蓝+冷灰视觉系统
- **Default SaaS drift**: 回到默认蓝紫渐变、通用图标堆砌；用采购字段分组卡片、AI解析进度光晕等产品语义元素塑造界面
- **Mono-hue tyranny**: 主色铺满按钮、tab、icon、边框、链接、图表；按65-25-10比例把primary收回到CTA与关键状态
- **Invisible interaction**: hover/active做了，focus-visible丢了；每个可交互元素都要有键盘可见的outline或ring状态
- **Status color overload**: 风险红/警告橙饱和度过高，与主色克制感脱节；语义色饱和度与primary对齐±15%
- **Dense form fatigue**: 字段确认页所有字段平铺无分组；必须按8大分类用卡片分组，建立信息呼吸感