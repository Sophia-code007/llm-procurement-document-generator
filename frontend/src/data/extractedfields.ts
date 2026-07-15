// EXPORTS: IPurchaseFields, IPurchaseItem, MOCK_EXTRACTED_FIELDS
export interface IPurchaseItem {
  id: string
  name: string
  specification: string
  quantity: number
  unit: string
  estimatedPrice: number
}

export interface IPurchaseFields {
  // 基础采购信息
  purchaseProjectName: string
  purchaseOrgName: string
  purchaseMethod: string
  purchaseCategory: string

  // 采购标的物信息
  purchaseItemList: IPurchaseItem[]

  // 商务报价
  totalBudgetAmount: number

  // 交付履约
  deliveryAddress: string
  deliveryDeadline: string

  // 付款条款
  paymentMode: string

  // 质保售后
  warrantyPeriod: string

  // 招标专属字段
  bidDeadline: string

  // 合规风控
  isGovernmentProcurement: boolean
}

export const MOCK_EXTRACTED_FIELDS: IPurchaseFields = {
  purchaseProjectName: '机架式服务器采购项目',
  purchaseOrgName: '宜昌产业园运营有限公司',
  purchaseMethod: '公开招标',
  purchaseCategory: '货物类',

  purchaseItemList: [
    {
      id: '1',
      name: '机架式服务器',
      specification: '2U双路/金牌6338/128GB/2TB SSD',
      quantity: 10,
      unit: '台',
      estimatedPrice: 48000,
    },
  ],

  totalBudgetAmount: 500000,

  deliveryAddress: '湖北省宜昌市高新区宜昌产业园',
  deliveryDeadline: '合同签订后30天内',

  paymentMode: '货到验收合格后付95%，质保期满付5%',

  warrantyPeriod: '3年原厂质保',

  bidDeadline: '2025-03-15 09:30',

  isGovernmentProcurement: false,
}