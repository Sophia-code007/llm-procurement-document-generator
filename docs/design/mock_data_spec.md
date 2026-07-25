# Mock 数据说明

本文档用于统一 Apifox Mock 数据、前端联调数据和后端接口返回样例。所有接口响应遵循 `docs/design/api_design_spec.md` 中的统一返回格式。

## 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 采购需求解析接口

接口：`POST /api/requirements/parse`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "requirementData": {
      "purchaseProjectName": "办公设备采购项目",
      "purchaseOrgName": "武汉XX科技有限公司",
      "purchaseContactPerson": "李经理",
      "purchaseContactPhone": "138XXXX1234",
      "purchaseMethod": "openTender",
      "purchaseCategory": "goods",
      "totalBudgetAmount": 800000,
      "fundSource": null,
      "purchaseItemList": [
        {
          "itemName": "台式电脑",
          "itemModel": null,
          "techRequirement": "i5处理器、16G内存、512G固态硬盘",
          "quantity": 30,
          "unit": "台",
          "allowImportGoods": false
        }
      ],
      "setMaxPriceLimit": null,
      "maxPriceAmount": null,
      "quoteScope": null,
      "taxRateRequire": null,
      "deliveryAddress": "武汉市洪山区光谷大道XX号公司总部办公楼",
      "deliveryDeadline": "合同签订后15个工作日内完成送货安装",
      "acceptanceStandard": null,
      "paymentMode": "other",
      "advancePaymentRatio": null,
      "finalPaymentTerm": "质保期满无质量问题一次性付清",
      "warrantyPeriod": "整机3年免费上门质保",
      "afterServiceResponse": "7*24小时技术响应",
      "docObtainStartTime": null,
      "docObtainEndTime": null,
      "bidDeadline": null,
      "bidOpenAddress": null,
      "needBidBond": null,
      "bidBondAmount": null,
      "isGovernmentProcurement": false,
      "allowSubcontract": null,
      "ipOwnershipRequire": null,
      "otherSpecialRequirement": null
    }
  }
}
```

## 文档生成接口

接口：`POST /api/documents/generate`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "projectId": "PRJ202607230001",
    "documentTitle": "办公设备采购项目招标文件",
    "documentType": "tender",
    "purchaseCategory": "goods",
    "previewContent": "# 办公设备采购项目招标文件\n\n## 第一章 招标公告\n\n武汉XX科技有限公司拟采购办公设备一批...",
    "templateName": "goods.md",
    "downloadUrl": "/api/documents/PRJ202607230001/download"
  }
}
```

## 风险检测接口

接口：`POST /api/documents/risk-check`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "riskTotal": 2,
    "riskLevelCount": {
      "high": 1,
      "medium": 1,
      "low": 0
    },
    "riskList": [
      {
        "riskId": "R001",
        "level": "high",
        "category": "付款风险",
        "location": "付款方式",
        "description": "合同签订后一次性支付100%货款，缺少交付和验收约束",
        "currentContent": "合同签订后3个工作日内，甲方一次性支付全部货款",
        "suggestion": "建议设置分阶段付款，如预付30%、验收合格后支付65%、质保期满支付5%",
        "regulationBasis": null
      },
      {
        "riskId": "R002",
        "level": "medium",
        "category": "验收风险",
        "location": "交付要求",
        "description": "未明确验收标准和验收流程",
        "currentContent": "乙方收到货款后安排发货",
        "suggestion": "补充验收标准、验收流程及不合格处理方式",
        "regulationBasis": null
      }
    ]
  }
}
```

## 文件导出接口

接口：`POST /api/documents/export`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "projectId": "PRJ202607230001",
    "fileName": "办公设备采购项目招标文件.pdf",
    "fileFormat": "pdf",
    "fileSize": 524288,
    "downloadUrl": "/api/documents/PRJ202607230001/export/pdf"
  }
}
```

## 异常 Mock

```json
{
  "code": 10003,
  "message": "AI 返回格式解析失败，字段校验不通过",
  "data": null
}
```

## Apifox 配置建议

Apifox 中每个接口至少配置一个成功 Mock 和一个异常 Mock。成功 Mock 使用本文件样例，异常 Mock 可按错误码 `10001`、`10002`、`10003`、`10004`、`10005`、`10006` 分别配置。
