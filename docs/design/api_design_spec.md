# API 接口设计规范 v1.1

## 设计原则

本规范是采购文档智能生成系统后端接口的统一设计标准。接口设计遵循 RESTful 风格，所有响应使用统一结构，字段命名与产品字段、AI Schema、模板占位符保持一致。

> 接口权威管理工具：Apifox，在线文档地址：`a8lm1ziy13.apifox.cn`

## 统一返回格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `code` | number | 是 | 业务状态码，`0` 表示成功，非 0 表示异常 |
| `message` | string | 是 | 状态描述，成功时固定为 `success` |
| `data` | object/array/null | 是 | 业务响应数据 |

## 命名规范

| 类型 | 规则 |
|---|---|
| 接口路径 | 使用小写字母，多层级以 `/` 分隔，统一前缀 `/api/` |
| 字段名 | 使用 camelCase，禁止下划线、拼音和中英文混合命名 |
| 枚举值 | 使用小写英文或 lowerCamelCase 编码，前端展示时转中文 |
| 时间字段 | 明确日期时间使用 ISO 8601；仅有相对期限时保留原文短语 |
| 金额字段 | 单位统一为元，类型为 number |
| 比例字段 | 使用数字，如 30 表示 30% |

## 核心枚举

| 字段 | 枚举值 |
|---|---|
| `purchaseCategory` | `goods`、`service`、`project`、`integration` |
| `purchaseMethod` | `openTender`、`competitiveConsultation`、`inquiry`、`singleSource`、`frameworkAgreement` |
| `paymentMode` | `advanceProgressFinal`、`acceptanceOneTime`、`other` |
| `level` | `high`、`medium`、`low` |

## 核心接口

### 采购需求解析

| 项目 | 内容 |
|---|---|
| 接口路径 | `POST /api/requirements/parse` |
| 功能 | 接收自然语言采购需求，调用大模型返回结构化采购参数 |
| 请求字段 | `requirementText` |
| 响应数据 | `requirementData` |

请求示例：

```json
{
  "requirementText": "采购10台服务器，预算50万元，30天内交付，质保3年。"
}
```

### 文档生成

| 项目 | 内容 |
|---|---|
| 接口路径 | `POST /api/documents/generate` |
| 功能 | 根据结构化采购参数匹配模板并生成采购文档 |
| 请求字段 | `requirementData`、`templateType` |
| 响应数据 | `projectId`、`documentTitle`、`previewContent`、`downloadUrl` |

### 文档风险检测

| 项目 | 内容 |
|---|---|
| 接口路径 | `POST /api/documents/risk-check` |
| 功能 | 对生成后的采购文档或合同文本检测风险 |
| 请求字段 | `documentContent`、`documentType` |
| 响应数据 | `riskTotal`、`riskLevelCount`、`riskList` |

### 文件导出

| 项目 | 内容 |
|---|---|
| 接口路径 | `POST /api/documents/export` |
| 功能 | 将采购文档导出为 Word 或 PDF |
| 请求字段 | `projectId`、`exportFormat` |
| 响应数据 | `fileName`、`fileFormat`、`fileSize`、`downloadUrl` |

## 状态码

| code | 分类 | 含义 |
|---|---|---|
| `0` | 成功 | 请求处理成功 |
| `10001` | 参数校验 | 请求参数缺失、格式错误、类型不匹配 |
| `10002` | AI 服务 | 大模型调用失败、响应超时 |
| `10003` | AI 服务 | AI 返回格式解析失败、字段校验不通过 |
| `10004` | 模板服务 | 模板匹配失败、模板文件不存在 |
| `10005` | 导出服务 | Word/PDF 文件生成失败 |
| `10006` | 风险检测 | 风险检测执行失败 |
| `20001` | 权限 | 用户未授权或无操作权限 |
| `30001` | 数据 | 项目不存在或查询为空 |
| `50000` | 服务器 | 服务器内部未知错误 |

## 字段一致性

字段以 `docs/design/field_consistency_check_table.md` 为基准。任何字段变更必须同步到 Apifox、AI Schema、Prompt 和模板占位符，避免前端、后端、AI 输出、模板渲染之间出现不一致。
