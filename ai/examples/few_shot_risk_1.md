### 3. `few_shot_risk_shtu` — 风险检测示例
**场景**：一段采购合同片段 + AI识别出的标准风险列表，对齐 `risk_item_schema.json`

```markdown
# 少样本示例1：采购合同风险检测

## 输入文档片段
第一条 合同金额
本合同总金额为人民币500000元整，合同签订后3个工作日内，甲方一次性支付全部货款。

第二条 交付要求
乙方收到货款后安排发货，交付地点为甲方指定地点。

第三条 质量保证
乙方保证产品为正品，如有质量问题乙方负责处理。

第四条 违约责任
双方应严格履行合同，如有违约协商解决。

## 标准输出结果
```json
{
  "riskList": [
    {
      "riskId": "R001",
      "level": "high",
      "category": "付款风险",
      "location": "第一条 合同金额",
      "description": "合同签订后一次性支付100%货款，甲方资金风险极高，无任何履约约束",
      "currentContent": "合同签订后3个工作日内，甲方一次性支付全部货款",
      "suggestion": "建议设置分阶段付款，如预付30%、验收合格付65%、质保期满付5%",
      "regulationBasis": "采购合同商务风险防控规范"
    },
    {
      "riskId": "R002",
      "level": "medium",
      "category": "条款缺失",
      "location": "第二条 交付要求",
      "description": "未明确交付期限、验收标准和验收流程，易产生交付纠纷",
      "currentContent": "乙方收到货款后安排发货，交付地点为甲方指定地点",
      "suggestion": "补充明确交付期限、验收标准、验收流程及不合格处理方式",
      "regulationBasis": "《民法典》第五百一十条"
    },
    {
      "riskId": "R003",
      "level": "medium",
      "category": "违约责任",
      "location": "第四条 违约责任",
      "description": "违约责任条款过于笼统，未约定具体违约情形和违约金计算方式",
      "currentContent": "双方应严格履行合同，如有违约协商解决",
      "suggestion": "明确逾期交付、质量不合格等具体违约情形及对应违约金标准",
      "regulationBasis": "《民法典》第五百八十五条"
    }
  ]
}