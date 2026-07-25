# 采购文件智能生成系统 (Vue3 + Element Plus)

基于 Vue3 + Element Plus + Pinia + Vite 构建的采购文件智能生成前端系统。

## 功能特性

- 📋 **三类模板**：工程类、货物类、服务类标准化模板
- ✍️ **双录入方式**：自然语言AI录入 + 表单逐项填写
- 🤖 **AI智能解析**：自动识别采购需求中的关键字段
- 📝 **动态表单**：根据模板类型自动渲染对应字段分组
- 💾 **草稿自动保存**：localStorage 本地存储，防止数据丢失
- 📊 **填写进度**：实时计算已填字段百分比
- 📄 **文档预览**：生成前可预览招标文件内容
- 🎨 **现代化UI**：Element Plus 组件库，专业商务风格

## 技术栈

- **框架**: Vue 3 (Composition API + <script setup>)
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **HTTP**: Axios
- **图标**: @element-plus/icons-vue

## 项目结构

```
v3.2-vue/
├── index.html                 # Vite 入口HTML
├── package.json               # 项目依赖
├── vite.config.js             # Vite 配置
├── README.md                  # 项目说明
└── src/
    ├── main.js                # 入口文件
    ├── App.vue                # 根组件
    ├── router/
    │   └── index.js           # 路由配置
    ├── stores/
    │   └── tender.js          # Pinia 状态管理
    ├── config/
    │   └── templateFields.js  # 三类模板字段配置
    ├── utils/
    │   └── aiParse.js         # AI自然语言解析工具
    ├── api/
    │   └── tender.js          # API接口封装
    ├── components/
    │   ├── Sidebar.vue        # 侧边栏导航
    │   └── DynamicForm.vue    # 动态表单组件
    └── views/                 # 页面组件
        ├── Dashboard.vue          # 工作台
        ├── TemplateSelect.vue     # 模板选择
        ├── InputMethodSelect.vue  # 录入方式选择
        ├── AiInput.vue            # 自然语言录入
        ├── FieldForm.vue          # 表单填写
        ├── Generating.vue         # 生成中
        ├── DocPreview.vue         # 文件预览
        ├── ContractGen.vue        # 合同生成
        ├── HistoryReuse.vue       # 历史复用
        ├── Collaborate.vue        # 协同编辑
        ├── VersionManage.vue      # 版本管理
        ├── AiAssist.vue           # AI智能问答
        ├── Supplier.vue           # 供应商推荐
        ├── Compliance.vue         # 合规审查
        ├── Stats.vue              # 统计分析
        └── Translate.vue          # 多语言支持
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认端口: http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 页面流程

```
工作台 → 模板选择 → 录入方式选择
                    ├─ 自然语言录入 → (可跳转表单完善)
                    └─ 表单填写
                          ↓
                       生成中
                          ↓
                      文件预览 → 下载
```

## 后端对接

前端 API 请求通过 Vite 代理转发到后端：

- 开发环境: `/api` → `http://localhost:3000/api`
- 生产环境: 需配置 Nginx 反向代理

后端接口详见 `API对接说明.md`。

## 核心配置

### 模板字段配置

文件: `src/config/templateFields.js`

三类模板（工程/货物/服务）的字段分组配置，支持以下字段类型：
- `input` - 文本输入
- `number` - 数字输入
- `select` - 下拉选择
- `textarea` - 多行文本
- `date` - 日期选择
- `table` - 表格类型（isTable: true）

### 状态管理

使用 Pinia 的 `useTenderStore` 管理全局状态：
- `currentTemplate` - 当前模板类型
- `currentInputMethod` - 录入方式
- `formData` - 表单数据
- `aiParsedData` - AI解析数据
- `fillProgress` - 填写进度（计算属性）

### AI解析

本地规则版 AI 解析位于 `src/utils/aiParse.js`，基于正则匹配识别关键字段。
如需接入真实大模型，可修改 `src/api/tender.js` 中的 `aiParse` 接口。

## 设计规范

- 主色调: #2563eb (蓝色)
- 成功色: #10b981 (绿色)
- 警告色: #f59e0b (黄色)
- 危险色: #ef4444 (红色)
- 卡片圆角: 12px
- 侧边栏背景: #1e293b
- 页面背景: #f1f5f9

## 后续扩展

- [ ] 接入真实大模型API替换本地正则解析
- [ ] 用户登录/权限系统
- [ ] 文件存储服务（OSS/MinIO）
- [ ] 更多模板类型
- [ ] 在线预览（docx转html/pdf）
- [ ] 版本对比功能
- [ ] WebSocket 实时协同编辑

## License

MIT
