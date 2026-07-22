# 采购文档摘要生成 Prompt 规范 v1.0

## 一、文档说明

### 1.1 功能定位
本Prompt为**扩展预留功能**，用于对生成完成的采购招标文件、采购合同等长文档进行智能摘要提取，自动提炼项目核心信息，输出结构化摘要结果。

### 1.2 适用场景
- 文档列表页：每条历史记录展示核心摘要，无需打开全文
- 文档生成完成页：顶部快速展示项目关键信息
- 历史文件检索：辅助用户快速定位目标文档
- 导出文档扉页：自动生成文档内容概览

### 1.3 调用说明
- 适用大模型：DeepSeek API
- 调用时机：文档生成完成后按需调用，非主流程必选环节
- 输入：完整的采购文档全文（Markdown/纯文本）
- 输出：结构化JSON格式的文档摘要

---

## 二、系统提示词（System Prompt）

```
你是一名专业的采购文档摘要专家，擅长从长篇采购招标文件、合同文本中精准提取核心信息，生成简洁、准确、结构化的内容摘要。

## 核心原则
1. **忠实原文**：所有信息必须完全来自输入文档，禁止编造、补充、推断文档中未明确说明的内容
2. **精准提炼**：只保留核心业务信息，剔除套话、通用条款、格式化表述
3. **结构统一**：严格按照指定字段和格式输出
4. **客观中立**：不做评价、不给出建议，只做信息提取与归纳
5. **空值处理**：对应字段文档中未提及的，统一返回 null

## 摘要提取范围
优先提取以下维度信息：
- 项目基本信息：项目名称、采购方式、采购类别
- 商务核心信息：预算金额、资金来源
- 交付履约信息：交付地点、交付期限、质保期限
- 采购核心内容：主要标的物、数量、核心技术要求
- 关键条款：付款方式、验收标准核心要求
```

---

## 三、用户提示词模板（User Prompt）

> 后端调用时将 `{{documentContent}}` 替换为实际文档全文，`{{docType}}` 替换为文档类型

```
请对以下采购文档进行核心信息摘要，严格按照要求输出结构化JSON。

文档类型：{{docType}}
可选值：tender(招标书) / purchase_contract(采购合同) / service_contract(服务合同)

文档全文：
"""
{{documentContent}}
"""

## 输出字段定义
- documentTitle (string)：文档标题
- projectName (string)：采购项目名称
- purchaseCategory (string)：采购类别（goods/service/project）
- purchaseMethod (string)：采购方式
- totalBudgetAmount (number)：预算总金额，单位元，纯数字
- mainItems (array)：主要采购标的物列表，每项包含名称+简要描述
- deliveryAddress (string)：交付地点
- deliveryDeadline (string)：交付/完工期限
- warrantyPeriod (string)：质保期限
- paymentMode (string)：付款方式简述
- coreSummary (string)：100字以内的整体内容概述
- keyHighlights (array)：3-5条核心要点，字符串数组

## 输出要求
1. 只返回纯JSON，不要任何解释、说明、markdown格式
2. 字段名严格使用上面给出的驼峰命名
3. 文档中未提及的字段值为 null
4. 金额只返回数字，不包含单位和千分位
```

---

## 四、输出格式约束

### 4.1 标准输出结构
```json
{
  "documentTitle": "string",
  "projectName": "string",
  "purchaseCategory": "string",
  "purchaseMethod": "string",
  "totalBudgetAmount": "number | null",
  "mainItems": [
    {
      "itemName": "string",
      "description": "string"
    }
  ],
  "deliveryAddress": "string | null",
  "deliveryDeadline": "string | null",
  "warrantyPeriod": "string | null",
  "paymentMode": "string | null",
  "coreSummary": "string",
  "keyHighlights": ["string", "string", "string"]
}
```

### 4.2 长度约束
- `coreSummary`：控制在 80-120 字
- `keyHighlights`：3-5 条，每条不超过 30 字
- `mainItems`：不超过 5 项，核心标的物优先

---

## 五、输出示例

### 输入文档片段（节选）
> 机架式服务器采购项目公开招标书
> 项目预算：50万元
> 采购内容：机架式服务器10台，配置Intel Xeon银牌处理器、32G内存、2T SSD硬盘
> 交付地点：武汉市东湖高新区光谷软件园A栋
> 交付期限：合同签订后30日历天内
> 质保要求：整机3年免费质保，7*24小时技术支持
> 付款方式：合同签订后预付30%，验收合格后支付65%，质保期满支付5%尾款

### 预期输出
```json
{
  "documentTitle": "机架式服务器采购项目公开招标书",
  "projectName": "机架式服务器采购项目",
  "purchaseCategory": "goods",
  "purchaseMethod": "公开招标",
  "totalBudgetAmount": 500000,
  "mainItems": [
    {
      "itemName": "机架式服务器",
      "description": "10台，Intel Xeon银牌处理器、32G内存、2T SSD"
    }
  ],
  "deliveryAddress": "武汉市东湖高新区光谷软件园A栋",
  "deliveryDeadline": "合同签订后30日历天内",
  "warrantyPeriod": "整机3年免费质保，7*24小时技术支持",
  "paymentMode": "30%预付款 + 65%验收款 + 5%质保尾款",
  "coreSummary": "本项目为机架式服务器公开招标采购，预算50万元，采购10台服务器，要求30天内交付，提供3年质保，采用分阶段付款方式。",
  "keyHighlights": [
    "采购10台机架式服务器，预算50万元",
    "合同签订后30天内完成交付",
    "整机提供3年免费质保及技术支持",
    "采用预付款+验收款+尾款三阶段付款"
  ]
}
```

---

## 六、异常处理规则

1. **文档内容过短**：不足200字的文档，直接提取全部有效信息，coreSummary精简输出
2. **信息极度缺失**：无法识别项目名称等核心字段时，对应字段返回null，不做推断
3. **非采购类文档**：返回 `{ "summaryFailed": true, "reason": "文档内容不属于采购类文档" }`
4. **格式混乱文档**：尽力提取可识别信息，无法确定的字段统一返回null

---

## 七、使用建议

### 7.1 使用建议
- 主流程不强制接入，作为扩展功能预留
- 可先用于「历史文档列表」页面，提升页面信息密度
- 文档生成成功页可选展示摘要卡片

### 7.2 后续扩展方向
- 支持摘要长度档位切换：精简版 / 标准版 / 详细版
- 支持按章节生成分段摘要
- 支持多文档对比摘要