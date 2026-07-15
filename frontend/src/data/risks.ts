// EXPORTS: IRisk, MOCK_RISKS
export interface IRisk {
  id: string
  level: 'high' | 'medium' | 'low'
  location: string
  description: string
  suggestion: string
}

export const MOCK_RISKS: IRisk[] = [
  {
    id: '1',
    level: 'high',
    location: '第三章 技术规格书 - 3.2 性能指标',
    description: '技术参数存在倾向性表述，指定品牌型号，涉嫌排斥潜在投标人',
    suggestion: '建议删除品牌型号限定，改用功能性参数描述，确保竞争充分性'
  },
  {
    id: '2',
    level: 'high',
    location: '第五章 合同条款 - 5.4 违约责任',
    description: '违约责任条款不对等，仅约束供应商违约，未约定采购方违约责任',
    suggestion: '建议补充采购方逾期付款等违约责任条款，保持合同双方权利义务对等'
  },
  {
    id: '3',
    level: 'medium',
    location: '第二章 投标人须知 - 2.3 资格要求',
    description: '投标人资格要求中注册资本金额过高，可能超出项目实际需要',
    suggestion: '建议根据项目预算合理设定注册资本要求，避免设置不合理门槛'
  },
  {
    id: '4',
    level: 'medium',
    location: '第四章 评标办法 - 4.2 评分标准',
    description: '价格分权重占比低于法定最低要求30%',
    suggestion: '建议将价格分权重调整至不低于30%，符合政府采购相关规定'
  },
  {
    id: '5',
    level: 'low',
    location: '第一章 招标公告 - 1.5 投标截止时间',
    description: '公告发布至投标截止时间不足20日，可能不符合公开招标法定期限',
    suggestion: '建议核实项目审批情况，如属公开招标应确保公告期限不少于20日'
  },
  {
    id: '6',
    level: 'low',
    location: '第六章 附件 - 6.1 投标函格式',
    description: '投标函模板缺少法定代表人签字栏位',
    suggestion: '建议在投标函模板中增加法定代表人（或授权代表）签字栏'
  }
]