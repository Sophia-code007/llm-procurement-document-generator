# 少样本示例1：完整货物类采购需求

## 用户输入原文
武汉XX科技有限公司计划公开招标采购一批办公设备，总预算80万元。具体包括：台式电脑30台，要求i5处理器、16G内存、512G固态硬盘；激光打印机5台，支持双面打印和无线连接。
交货地点：武汉市洪山区光谷大道XX号公司总部办公楼。
要求合同签订后15个工作日内完成送货安装，整机提供3年免费上门质保，7*24小时技术响应。
付款方式：货到验收合格后支付95%货款，剩余5%作为质保金，质保期满无质量问题一次性付清。
联系人：李经理，联系电话：138XXXX1234。
本项目不属于政府采购项目，不接受进口产品。

## 标准输出结果
```json
{
  "requirementData": {
    "purchaseProjectName": "办公设备采购项目",
    "purchaseOrgName": "武汉XX科技有限公司",
    "purchaseContactPerson": "李经理",
    "purchaseContactPhone": "138XXXX1234",
    "purchaseMethod": "公开招标",
    "purchaseCategory": "goods",
    "totalBudgetAmount": 800000,
    "fundSource": null,
    "purchaseItemList": [
      {
        "itemName": "台式电脑",
        "itemModel": null,
        "techRequirement": "i5处理器、16G内存、512G固态硬盘",
        "allowImportGoods": false
      },
      {
        "itemName": "激光打印机",
        "itemModel": null,
        "techRequirement": "支持双面打印和无线连接",
        "allowImportGoods": false
      }
    ],
    "setMaxPriceLimit": false,
    "maxPriceAmount": null,
    "quoteScope": null,
    "taxRateRequire": null,
    "deliveryAddress": "武汉市洪山区光谷大道XX号公司总部办公楼",
    "deliveryDeadline": "合同签订后15个工作日内完成送货安装",
    "acceptanceStandard": null,
    "paymentMode": "货到验收合格付95%，5%质保金质保期满付清",
    "advancePaymentRatio": null,
    "finalPaymentTerm": "质保期满无质量问题一次性付清",
    "warrantyPeriod": "整机3年免费上门质保",
    "afterServiceResponse": "7*24小时技术响应",
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