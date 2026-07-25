# Prompt 调优测试记录

## 测试批次

| 项目 | 内容 |
|---|---|
| 测试日期 | 2026-07-23 |
| 测试范围 | 采购需求解析 Prompt |
| 测试集 | `ai/evaluation/ai_parse_test_cases.csv` |
| 用例数量 | 20 |
| 当前版本 | v1.1 |

## 调优记录

| 版本 | 问题 | 调整 |
|---|---|---|
| v1.0 | `purchaseCategory` 在 Prompt 中输出中文枚举，与 Schema/API 的英文枚举不一致 | 改为 `goods/service/project/integration` |
| v1.0 | `purchaseMethod` 未定义英文枚举，前后端展示和后端判断不统一 | 增加 `openTender/competitiveConsultation/inquiry/singleSource/frameworkAgreement` |
| v1.0 | `paymentMode` 输出自然语言，难以做模板分支判断 | 增加 `advanceProgressFinal/acceptanceOneTime/other` |
| v1.0 | 采购数量和单位只混在技术要求中，不利于模板渲染 | 在 `purchaseItemList` 子项中增加 `quantity` 和 `unit` |
| v1.0 | 未提及的布尔字段容易被默认成 false | 明确未提及时返回 null |

## 用例抽检结果

| 用例 | 检查点 | v1.1 判断 |
|---|---|---|
| TC001 | 服务器数量应为100台，不应把2块硬盘乘成200 | Prompt 已补充主采购数量规则 |
| TC005 | 总预算应为50000元，不应输出单价5000 | 金额规则已明确总预算优先 |
| TC011 | 单位应为套，不应把42U当数量单位 | 单位字段已独立提取 |
| TC013 | 原文未提质保期，不得编造 | 空值策略已强化 |
| TC019 | CRM四个模块、源代码交付、驻场开发不可遗漏 | 技术要求保留原文关键条件 |

## 当前遗留事项

后端接入真实模型后，需要把 20 条测试用例实际跑一遍，记录模型原始输出、Schema 校验结果和人工判定结果。当前文件记录的是 Prompt 规范层面的调优结果，作为开发前基准。
