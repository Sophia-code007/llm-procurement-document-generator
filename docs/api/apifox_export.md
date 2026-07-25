# Apifox 接口文档导出说明

## 云端文档

接口权威管理工具为 Apifox，云端文档地址：`a8lm1ziy13.apifox.cn`。

## 导出内容

Apifox 中应包含以下核心接口：

| 模块 | 接口 | 说明 |
|---|---|---|
| 需求解析 | `POST /api/requirements/parse` | 自然语言采购需求解析 |
| 文档生成 | `POST /api/documents/generate` | 根据结构化参数生成采购文件 |
| 风险检测 | `POST /api/documents/risk-check` | 检测采购文件或合同风险 |
| 文件导出 | `POST /api/documents/export` | 导出 Word 或 PDF |

## 导出要求

导出接口文档时，需包含请求参数、响应参数、成功示例、失败示例和 Mock 数据。字段定义以 `docs/design/field_consistency_check_table.md` 为准，接口响应格式以 `docs/design/api_design_spec.md` 为准。

## 文件维护方式

当前仓库保留 Markdown 快照，便于 GitHub 查看。Apifox 云端文档发生字段调整时，应同步更新以下文件：

- `docs/design/api_design_spec.md`
- `docs/design/mock_data_spec.md`
- `docs/design/field_consistency_check_table.md`
- `ai/schemas/requirement_data_schema.json`
