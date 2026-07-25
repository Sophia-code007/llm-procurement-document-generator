export const contractFields = [
  { group: "一、合同基础信息", items: [
    { key: "contractNo", label: "合同编号", type: "String", required: true, shared: false, sample: "IHT-BW-2026-001" },
    { key: "purchaseProjectName", label: "项目名称", type: "String", required: true, shared: true, sample: "办公楼服务器采购" },
    { key: "purchaseOrgName", label: "采购人(甲方)", type: "String", required: true, shared: true, sample: "采购单位全称" },
    { key: "sellerName", label: "供应商(乙方)", type: "String", required: true, shared: false, sample: "中标供应商全称" },
    { key: "signDate", label: "签订日期", type: "Date", required: true, shared: false, sample: "2026年8月15日" },
    { key: "signLocation", label: "签订地点", type: "String", required: true, shared: false, sample: "成都市武侯区" },
    { key: "contractCopies", label: "合同份数", type: "Integer", required: true, shared: false, sample: "6" }
  ]},
  { group: "二、甲方信息", items: [
    { key: "deliveryAddress", label: "甲方地址", type: "String", required: true, shared: true, sample: "与招标书交付地址共用" },
    { key: "purchaseContactPerson", label: "甲方联系人", type: "String", required: true, shared: true, sample: "采购项目联系人" },
    { key: "purchaseContactPhone", label: "甲方联系电话", type: "String", required: true, shared: true, sample: "联系电话" },
    { key: "buyerCreditCode", label: "甲方统一社会信用代码", type: "String", required: false, shared: false, sample: "甲方信用代码" },
    { key: "buyerZipCode", label: "甲方邮编", type: "String", required: false, shared: false, sample: "610000" }
  ]},
  { group: "三、乙方信息", items: [
    { key: "sellerAddress", label: "乙方地址", type: "String", required: true, shared: false, sample: "供应商注册地址" },
    { key: "sellerPhone", label: "乙方联系电话", type: "String", required: true, shared: false, sample: "供应商联系电话" },
    { key: "sellerCreditCode", label: "乙方统一社会信用代码", type: "String", required: false, shared: false, sample: "乙方信用代码" },
    { key: "sellerAccount", label: "乙方开户账号", type: "String", required: false, shared: false, sample: "收款账号" },
    { key: "sellerAccountName", label: "乙方开户名", type: "String", required: false, shared: false, sample: "账户名称" }
  ]},
  { group: "四、标的物信息", items: [
    { key: "itemName", label: "货物/服务名称", type: "String", required: true, shared: true, sample: "采购标的物名称" },
    { key: "itemModel", label: "规格型号", type: "String", required: true, shared: true, sample: "规格/型号/服务标准" },
    { key: "quantity", label: "数量", type: "Number", required: true, shared: true, sample: "采购数量" },
    { key: "unit", label: "单位", type: "String", required: true, shared: true, sample: "台/套/项/年" },
    { key: "singlePrice", label: "单价", type: "Number", required: true, shared: true, sample: "单价(元)" },
    { key: "technicalRequirement", label: "技术要求", type: "Text", required: false, shared: true, sample: "技术参数/服务要求" },
    { key: "manufacturerName", label: "生产厂家", type: "String", required: false, shared: false, sample: "品牌生产厂家" }
  ]},
  { group: "五、合同金额", items: [
    { key: "totalContractAmount", label: "合同总价", type: "Number", required: true, shared: false, sample: "500000" },
    { key: "totalAmountCapital", label: "合同总价(大写)", type: "String", required: true, shared: false, sample: "人民币伍拾万元整" }
  ]},
  { group: "六、工程类专属", items: [
    { key: "safetyFeeAmount", label: "安全文明施工费", type: "Number", required: false, shared: false, sample: "工程专属费用" },
    { key: "provisionalSumAmount", label: "暂列金额", type: "Number", required: false, shared: false, sample: "工程暂列金" },
    { key: "contractType", label: "合同价格形式", type: "String", required: true, shared: false, sample: "固定总价/单价合同" },
    { key: "projectManager", label: "项目经理", type: "String", required: true, shared: false, sample: "乙方项目经理" }
  ]},
  { group: "七、交付与工期", items: [
    { key: "deliveryDeadline", label: "交付/完工期限", type: "String", required: true, shared: true, sample: "合同签订后30日内" },
    { key: "deliveryAddress", label: "交付地点", type: "String", required: true, shared: true, sample: "与甲方地址共用" },
    { key: "planStartDate", label: "计划开工日期", type: "Date", required: true, shared: true, sample: "工程开工日期" },
    { key: "planEndDate", label: "计划竣工日期", type: "Date", required: true, shared: true, sample: "工程竣工日期" },
    { key: "constructionPeriod", label: "总工期天数", type: "Integer", required: true, shared: true, sample: "总日历天数" },
    { key: "constructionLocation", label: "工程地点", type: "String", required: true, shared: true, sample: "施工地点" },
    { key: "bidScope", label: "工程内容/招标范围", type: "Text", required: true, shared: true, sample: "工程承包范围" }
  ]},
  { group: "八、质量与验收", items: [
    { key: "warrantyPeriod", label: "质保期", type: "String", required: true, shared: true, sample: "1年或3公里" },
    { key: "acceptanceStandard", label: "验收标准", type: "String", required: true, shared: true, sample: "验收合格标准" },
    { key: "qualityStandard", label: "质量标准", type: "String", required: true, shared: true, sample: "工程质量合格标准" },
    { key: "afterServiceResponse", label: "售后响应要求", type: "String", required: true, shared: true, sample: "2小时响应" }
  ]},
  { group: "九、付款与商务", items: [
    { key: "paymentMode", label: "付款方式", type: "String", required: true, shared: true, sample: "预付款30%+验收尾款70%" },
    { key: "paymentDueDate", label: "付款截止日期", type: "Date", required: false, shared: false, sample: "一次性付款截止日" },
    { key: "taxRateRequire", label: "税率要求", type: "String", required: false, shared: false, sample: "13%增值税专用发票" },
    { key: "ipOwnershipRequire", label: "知识产权归属", type: "String", required: false, shared: true, sample: "归采购方所有" },
    { key: "allowSubcontract", label: "是否允许分包", type: "Boolean", required: true, shared: true, sample: "否" }
  ]},
  { group: "十、违约与争议", items: [
    { key: "penaltyRate", label: "违约金比例", type: "Number", required: false, shared: false, sample: "每日千分之几" },
    { key: "maxPenaltyRatio", label: "最高违约金比例", type: "Number", required: false, shared: false, sample: "合同总价百分比" },
    { key: "arbitrationCommittee", label: "仲裁委员会", type: "String", required: false, shared: false, sample: "仲裁机构名称" },
    { key: "courtLocation", label: "诉讼管辖地", type: "String", required: false, shared: false, sample: "法院所在地" }
  ]},
  { group: "十一、服务类专属", items: [
    { key: "servicePeriod", label: "服务周期", type: "String", required: true, shared: true, sample: "服务期限" },
    { key: "serviceDeliveryForm", label: "服务交付形式", type: "String", required: true, shared: false, sample: "报告/驻场/系统交付" },
    { key: "confidentialityRequire", label: "保密要求", type: "Text", required: true, shared: false, sample: "保密条款内容" },
    { key: "personnelRequire", label: "人员要求", type: "Text", required: true, shared: false, sample: "服务团队要求" }
  ]}
]
export const flatContractFields = contractFields.flatMap(g => g.items)
