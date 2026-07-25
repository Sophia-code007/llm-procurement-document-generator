### 2. `few_shot_parse_2.md` — 极简采购需求示例
**场景**：用户只说一句话，信息极度不全，大量字段返回null，验证AI不编造信息的能力

```markdown
# 少样本示例2：极简采购需求

## 用户输入原文
买5台笔记本电脑，预算3万块钱。

## 标准输出结果
```json
{
  "requirementData": {
    "purchaseProjectName": "笔记本电脑采购项目",
    "purchaseOrgName": null,
    "purchaseContactPerson": null,
    "purchaseContactPhone": null,
    "purchaseMethod": "询价",
    "purchaseCategory": "goods",
    "totalBudgetAmount": 30000,
    "fundSource": null,
    "purchaseItemList": [
      {
        "itemName": "笔记本电脑",
        "itemModel": null,
        "techRequirement": null,
        "allowImportGoods": false
      }
    ],
    "setMaxPriceLimit": false,
    "maxPriceAmount": null,
    "quoteScope": null,
    "taxRateRequire": null,
    "deliveryAddress": null,
    "deliveryDeadline": null,
    "acceptanceStandard": null,
    "paymentMode": null,
    "advancePaymentRatio": null,
    "finalPaymentTerm": null,
    "warrantyPeriod": null,
    "afterServiceResponse": null,
    "docObtainStartTime": null,
    "docObtainEndTime": null,
    "bidDeadline": null,
    "bidOpenAddress": null,
    "needBidBond": false,
    "bidBondAmount": null,
    "isGovernmentProcurement": false,
    "allowSubcontract": false,
    "ipOwnershipRequire": null,
    "otherSpecialRequirement": null
  }
}