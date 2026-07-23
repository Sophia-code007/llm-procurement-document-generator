# 三字段对齐对照表

本文档是采购文件智能生成系统的字段对齐基准，用于统一产品字段、API 字段、AI 输出 Schema 和模板占位符。字段发生变化时，必须同步更新 Apifox、`ai/schemas/requirement_data_schema.json`、`ai/prompts/requirement_parse_prompt.md` 和采购文件模板。

## 对齐规则

| 规则 | 说明 |
|---|---|
| 字段命名 | API、AI Schema、模板占位符统一使用 camelCase |
| 枚举值 | 接口传输统一使用英文编码，前端展示时再转为中文 |
| 金额单位 | 统一为元，类型为 number |
| 比例单位 | 统一为百分比数值，例如 30 表示 30% |
| 空值处理 | 用户未提及时返回 null，不用 false 或空字符串代替未知信息 |
| 模板占位符 | 默认与 API 字段同名，例如 `{purchaseProjectName}` |

## 字段对照

| 产品字段 | API 字段 | AI Schema 路径 | 类型 | 模板是否必用 | 枚举/单位 | 主要使用位置 |
|---|---|---|---|---|---|---|
| 采购项目名称 | `purchaseProjectName` | `requirementData.purchaseProjectName` | string|null | 否 | 无 | 模板标题、项目概述 |
| 采购组织单位 | `purchaseOrgName` | `requirementData.purchaseOrgName` | string|null | 否 | 无 | 采购人信息 |
| 采购联系人 | `purchaseContactPerson` | `requirementData.purchaseContactPerson` | string|null | 否 | 无 | 联系人 |
| 联系电话 | `purchaseContactPhone` | `requirementData.purchaseContactPhone` | string|null | 否 | 无 | 联系电话 |
| 采购方式 | `purchaseMethod` | `requirementData.purchaseMethod` | enum|null | 否 | openTender/competitiveConsultation/inquiry/singleSource/frameworkAgreement | 流程与标题 |
| 采购类别 | `purchaseCategory` | `requirementData.purchaseCategory` | enum|null | 否 | goods/service/project/integration | 模板匹配 |
| 预算总金额 | `totalBudgetAmount` | `requirementData.totalBudgetAmount` | number|null | 否 | 单位元 | 预算条款 |
| 资金来源 | `fundSource` | `requirementData.fundSource` | string|null | 否 | 无 | 资金来源说明 |
| 采购清单 | `purchaseItemList` | `requirementData.purchaseItemList` | array | 是 | 数组 | 采购内容章节 |
| 标的物名称 | `itemName` | `requirementData.purchaseItemList[].itemName` | string | 是 | 无 | 采购清单 |
| 规格型号 | `itemModel` | `requirementData.purchaseItemList[].itemModel` | string|null | 否 | 无 | 采购清单 |
| 技术参数要求 | `techRequirement` | `requirementData.purchaseItemList[].techRequirement` | string|null | 否 | 无 | 技术要求 |
| 采购数量 | `quantity` | `requirementData.purchaseItemList[].quantity` | number|null | 否 | 无 | 采购清单 |
| 采购单位 | `unit` | `requirementData.purchaseItemList[].unit` | string|null | 否 | 无 | 采购清单 |
| 是否允许进口产品 | `allowImportGoods` | `requirementData.purchaseItemList[].allowImportGoods` | boolean|null | 否 | true/false/null | 资格与响应要求 |
| 是否设置最高限价 | `setMaxPriceLimit` | `requirementData.setMaxPriceLimit` | boolean|null | 否 | true/false/null | 报价要求 |
| 最高限价金额 | `maxPriceAmount` | `requirementData.maxPriceAmount` | number|null | 否 | 单位元 | 报价要求 |
| 报价包含范围 | `quoteScope` | `requirementData.quoteScope` | string|null | 否 | 无 | 报价要求 |
| 税率要求 | `taxRateRequire` | `requirementData.taxRateRequire` | string|null | 否 | 无 | 报价要求 |
| 交付地点 | `deliveryAddress` | `requirementData.deliveryAddress` | string|null | 否 | 无 | 交付条款 |
| 交付/完工期限 | `deliveryDeadline` | `requirementData.deliveryDeadline` | string|null | 否 | 无 | 交付条款 |
| 验收标准 | `acceptanceStandard` | `requirementData.acceptanceStandard` | string|null | 否 | 无 | 验收条款 |
| 付款方式 | `paymentMode` | `requirementData.paymentMode` | enum|null | 否 | advanceProgressFinal/acceptanceOneTime/other | 付款条款 |
| 预付款比例 | `advancePaymentRatio` | `requirementData.advancePaymentRatio` | number|null | 否 | 百分比数值 | 付款条款 |
| 尾款支付时限 | `finalPaymentTerm` | `requirementData.finalPaymentTerm` | string|null | 否 | 无 | 付款条款 |
| 质保期限 | `warrantyPeriod` | `requirementData.warrantyPeriod` | string|null | 否 | 无 | 质保条款 |
| 售后响应要求 | `afterServiceResponse` | `requirementData.afterServiceResponse` | string|null | 否 | 无 | 售后条款 |
| 招标文件获取开始时间 | `docObtainStartTime` | `requirementData.docObtainStartTime` | string|null | 否 | ISO 8601 或原文短语 | 招标公告 |
| 招标文件获取截止时间 | `docObtainEndTime` | `requirementData.docObtainEndTime` | string|null | 否 | ISO 8601 或原文短语 | 招标公告 |
| 投标截止时间 | `bidDeadline` | `requirementData.bidDeadline` | string|null | 否 | ISO 8601 或原文短语 | 投标须知 |
| 开标地点 | `bidOpenAddress` | `requirementData.bidOpenAddress` | string|null | 否 | 无 | 投标须知 |
| 是否需要保证金 | `needBidBond` | `requirementData.needBidBond` | boolean|null | 否 | true/false/null | 保证金条款 |
| 保证金金额 | `bidBondAmount` | `requirementData.bidBondAmount` | number|null | 否 | 单位元 | 保证金条款 |
| 是否政府采购项目 | `isGovernmentProcurement` | `requirementData.isGovernmentProcurement` | boolean|null | 否 | true/false/null | 合规条款 |
| 是否允许分包转包 | `allowSubcontract` | `requirementData.allowSubcontract` | boolean|null | 否 | true/false/null | 履约条款 |
| 知识产权归属要求 | `ipOwnershipRequire` | `requirementData.ipOwnershipRequire` | string|null | 否 | 无 | 知识产权条款 |
| 其他特殊需求 | `otherSpecialRequirement` | `requirementData.otherSpecialRequirement` | string|null | 否 | 无 | 补充条款 |

## 枚举码表

| 字段 | 编码 | 中文含义 |
|---|---|---|
| `purchaseCategory` | `goods` | 货物类 |
| `purchaseCategory` | `service` | 服务类 |
| `purchaseCategory` | `project` | 工程类 |
| `purchaseCategory` | `integration` | 软硬件集成 |
| `purchaseMethod` | `openTender` | 公开招标 |
| `purchaseMethod` | `competitiveConsultation` | 竞争性磋商 |
| `purchaseMethod` | `inquiry` | 询价 |
| `purchaseMethod` | `singleSource` | 单一来源 |
| `purchaseMethod` | `frameworkAgreement` | 框架协议 |
| `paymentMode` | `advanceProgressFinal` | 预付款+进度款+尾款 |
| `paymentMode` | `acceptanceOneTime` | 货到/服务完成并验收合格后一次性支付 |
| `paymentMode` | `other` | 其他付款方式 |
| `level` | `high` | 高风险 |
| `level` | `medium` | 中风险 |
| `level` | `low` | 低风险 |

## 变更流程

字段新增、删除或改名时，先更新本表，再同步更新 Schema、Prompt、Apifox 和模板占位符。后端联调前应以本表逐项核对，避免前端字段、AI 输出和模板字段不一致。
