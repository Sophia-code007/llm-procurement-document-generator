// 三类模板字段配置
export const templateFields = {
  engineering: {
    name: '工程类模板',
    icon: 'Building',
    color: 'warning',
    groups: [
      {
        name: '封面基础信息',
        icon: 'Document',
        fields: [
          { key: 'projectName', label: '项目名称', type: 'input', required: true, placeholder: '请输入项目全称' },
          { key: 'projectCode', label: '项目编号', type: 'input', required: false, placeholder: '如：ZB-2026-001' },
          { key: 'tenderer', label: '招标人名称', type: 'input', required: true, placeholder: '请输入招标人全称' },
          { key: 'agentName', label: '招标代理机构', type: 'input', required: false, placeholder: '如有请填写' },
        ]
      },
      {
        name: '项目概况',
        icon: 'OfficeBuilding',
        fields: [
          { key: 'location', label: '建设地点', type: 'input', required: true, placeholder: '请输入详细地址' },
          { key: 'buildingArea', label: '建筑面积', type: 'input', required: false, placeholder: '单位：平方米' },
          { key: 'structureType', label: '结构形式', type: 'select', required: false, options: ['框架结构', '剪力墙结构', '钢结构', '砖混结构', '其他'] },
          { key: 'floorCount', label: '地上层数', type: 'number', required: false, placeholder: '如：12' },
          { key: 'undergroundFloors', label: '地下层数', type: 'number', required: false, placeholder: '如：2' },
          { key: 'budget', label: '项目预算（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
        ]
      },
      {
        name: '招标范围与工期',
        icon: 'List',
        fields: [
          { key: 'scope', label: '招标范围', type: 'textarea', required: true, placeholder: '请详细描述招标范围，如：施工图范围内的土建、安装、装饰等全部工程' },
          { key: 'duration', label: '工期（日历天）', type: 'number', required: true, placeholder: '如：365' },
          { key: 'startDate', label: '计划开工日期', type: 'date', required: false },
          { key: 'endDate', label: '计划竣工日期', type: 'date', required: false },
          { key: 'qualityStandard', label: '质量标准', type: 'select', required: true, options: ['合格', '优良', '市级优质工程', '省级优质工程', '鲁班奖'] },
        ]
      },
      {
        name: '踏勘现场与答疑',
        icon: 'Location',
        fields: [
          { key: 'siteVisit', label: '是否组织踏勘', type: 'select', required: false, options: ['组织', '不组织'] },
          { key: 'siteVisitTime', label: '踏勘时间', type: 'date', required: false },
          { key: 'siteVisitAddress', label: '踏勘集合地点', type: 'input', required: false, placeholder: '请输入集合地址' },
          { key: 'qaDeadline', label: '提问截止时间', type: 'date', required: false },
        ]
      },
      {
        name: '投标人资格要求',
        icon: 'User',
        fields: [
          { key: 'qualification', label: '资质要求', type: 'select', required: true, options: ['建筑工程施工总承包特级', '建筑工程施工总承包一级', '建筑工程施工总承包二级', '建筑工程施工总承包三级', '市政公用工程施工总承包一级', '其他'] },
          { key: 'pmRequirement', label: '项目经理要求', type: 'input', required: false, placeholder: '如：一级注册建造师，建筑工程专业' },
          { key: 'performance', label: '业绩要求', type: 'textarea', required: false, placeholder: '近3年类似项目业绩要求' },
          { key: 'acceptUnion', label: '是否接受联合体', type: 'select', required: true, options: ['不接受', '接受'] },
        ]
      },
      {
        name: '投标参数',
        icon: 'Money',
        fields: [
          { key: 'bidDeposit', label: '投标保证金（元）', type: 'number', required: false, placeholder: '如：50000' },
          { key: 'bidValidity', label: '投标有效期（天）', type: 'number', required: false, placeholder: '如：90' },
          { key: 'performanceBond', label: '履约保证金比例', type: 'input', required: false, placeholder: '如：合同价的5%' },
        ]
      },
      {
        name: '投标文件递交',
        icon: 'Message',
        fields: [
          { key: 'submitDeadline', label: '投标截止时间', type: 'date', required: false },
          { key: 'submitAddress', label: '递交地点', type: 'input', required: false, placeholder: '请输入详细地址' },
          { key: 'openBidTime', label: '开标时间', type: 'date', required: false },
          { key: 'openBidAddress', label: '开标地点', type: 'input', required: false, placeholder: '请输入详细地址' },
        ]
      },
      {
        name: '评标与合同',
        icon: 'Scale',
        fields: [
          { key: 'evalMethod', label: '评标办法', type: 'select', required: true, options: ['综合评估法', '经评审的最低投标价法', '合理低价法'] },
          { key: 'paymentMethod', label: '付款方式', type: 'textarea', required: false, placeholder: '如：按月进度支付80%，竣工验收后付至97%，质保期满付清' },
          { key: 'warrantyPeriod', label: '质保期限', type: 'input', required: false, placeholder: '如：整体工程2年，防水5年' },
          { key: 'contractType', label: '合同类型', type: 'select', required: false, options: ['固定总价合同', '固定单价合同', '可调价格合同', '成本加酬金合同'] },
        ]
      },
      {
        name: '联系方式',
        icon: 'Phone',
        fields: [
          { key: 'contactPerson', label: '联系人', type: 'input', required: true, placeholder: '请输入联系人姓名' },
          { key: 'contactPhone', label: '联系电话', type: 'input', required: true, placeholder: '请输入联系电话' },
          { key: 'contactEmail', label: '电子邮箱', type: 'input', required: false, placeholder: '请输入邮箱地址' },
          { key: 'contactAddress', label: '联系地址', type: 'input', required: false, placeholder: '请输入详细地址' },
        ]
      },
    ]
  },
  goods: {
    name: '货物类模板',
    icon: 'Box',
    color: 'primary',
    groups: [
      {
        name: '基础信息',
        icon: 'Document',
        fields: [
          { key: 'projectName', label: '采购项目名称', type: 'input', required: true, placeholder: '请输入项目全称' },
          { key: 'projectCode', label: '项目编号', type: 'input', required: false, placeholder: '如：CG-2026-001' },
          { key: 'purchaser', label: '采购人名称', type: 'input', required: true, placeholder: '请输入采购人全称' },
          { key: 'budget', label: '预算总金额（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
          { key: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '邀请招标', '竞争性谈判', '竞争性磋商', '询价', '单一来源'] },
        ]
      },
      {
        name: '采购清单',
        icon: 'Goods',
        isTable: true,
        tableColumns: [
          { key: 'itemName', label: '货物名称', type: 'input' },
          { key: 'spec', label: '规格型号', type: 'input' },
          { key: 'unit', label: '单位', type: 'input' },
          { key: 'quantity', label: '数量', type: 'number' },
          { key: 'remark', label: '备注', type: 'input' },
        ]
      },
      {
        name: '技术参数要求',
        icon: 'Cpu',
        fields: [
          { key: 'techRequirement', label: '主要技术参数要求', type: 'textarea', required: true, placeholder: '请详细描述技术参数、性能指标等要求' },
          { key: 'brandRequirement', label: '品牌要求', type: 'input', required: false, placeholder: '如：不指定品牌，或参考品牌：XX、YY、ZZ' },
          { key: 'originRequirement', label: '产地要求', type: 'select', required: false, options: ['国产', '不限制', '进口', '优先国产'] },
          { key: 'importAllowed', label: '是否允许进口产品', type: 'select', required: false, options: ['允许', '不允许', '部分允许'] },
          { key: 'certification', label: '认证要求', type: 'input', required: false, placeholder: '如：CCC认证、ISO9001等' },
        ]
      },
      {
        name: '商务报价要求',
        icon: 'Money',
        fields: [
          { key: 'priceInclude', label: '报价包含内容', type: 'textarea', required: false, placeholder: '如：货物费、运输费、安装费、税费、培训费等全部费用' },
          { key: 'bidDeposit', label: '投标保证金（元）', type: 'number', required: false, placeholder: '如：20000' },
          { key: 'bidValidity', label: '投标有效期（天）', type: 'number', required: false, placeholder: '如：90' },
        ]
      },
      {
        name: '交付与履约',
        icon: 'Van',
        fields: [
          { key: 'deliveryTime', label: '交货期', type: 'input', required: true, placeholder: '如：合同签订后30天内' },
          { key: 'deliveryAddress', label: '交货地点', type: 'input', required: true, placeholder: '请输入详细交货地址' },
          { key: 'installRequirement', label: '安装调试要求', type: 'textarea', required: false, placeholder: '是否需要安装调试及相关要求' },
          { key: 'trainingRequirement', label: '培训要求', type: 'textarea', required: false, placeholder: '操作培训、维护培训等要求' },
        ]
      },
      {
        name: '验收标准',
        icon: 'CircleCheck',
        fields: [
          { key: 'acceptStandard', label: '验收标准', type: 'textarea', required: false, placeholder: '国家相关标准、行业标准、技术参数要求等' },
          { key: 'acceptMethod', label: '验收方式', type: 'select', required: false, options: ['出厂验收', '到货验收', '安装调试验收', '最终验收'] },
        ]
      },
      {
        name: '付款条款',
        icon: 'CreditCard',
        fields: [
          { key: 'paymentMethod', label: '付款方式', type: 'select', required: true, options: ['货到验收合格后一次性支付', '分期付款：预付款+到货款+质保金', '按月结算', '其他'] },
          { key: 'paymentDetail', label: '付款详细说明', type: 'textarea', required: false, placeholder: '详细描述各阶段付款比例和条件' },
        ]
      },
      {
        name: '质保与售后',
        icon: 'Shield',
        fields: [
          { key: 'warrantyPeriod', label: '质保期限', type: 'input', required: true, placeholder: '如：3年原厂质保' },
          { key: 'warrantyContent', label: '质保范围', type: 'textarea', required: false, placeholder: '免费维修、更换配件等' },
          { key: 'responseTime', label: '故障响应时间', type: 'input', required: false, placeholder: '如：7×24小时响应，4小时到场' },
          { key: 'afterSaleService', label: '售后服务要求', type: 'textarea', required: false, placeholder: '其他售后服务要求' },
        ]
      },
      {
        name: '投标人资格',
        icon: 'User',
        fields: [
          { key: 'qualification', label: '投标人资质要求', type: 'textarea', required: false, placeholder: '营业执照、相关经营资质等' },
          { key: 'performance', label: '业绩要求', type: 'textarea', required: false, placeholder: '近3年类似项目业绩' },
          { key: 'manufacturerAuth', label: '是否需要厂家授权', type: 'select', required: false, options: ['需要', '不需要'] },
          { key: 'acceptUnion', label: '是否接受联合体', type: 'select', required: true, options: ['不接受', '接受'] },
        ]
      },
      {
        name: '补充要求',
        icon: 'Plus',
        fields: [
          { key: 'otherRequirement', label: '其他要求', type: 'textarea', required: false, placeholder: '其他未尽事宜或特殊要求' },
        ]
      },
    ]
  },
  service: {
    name: '服务类模板',
    icon: 'Service',
    color: 'success',
    groups: [
      {
        name: '基础信息',
        icon: 'Document',
        fields: [
          { key: 'projectName', label: '项目名称', type: 'input', required: true, placeholder: '请输入项目全称' },
          { key: 'projectCode', label: '项目编号', type: 'input', required: false, placeholder: '如：FW-2026-001' },
          { key: 'purchaser', label: '采购人名称', type: 'input', required: true, placeholder: '请输入采购人全称' },
          { key: 'budget', label: '预算金额（元）', type: 'number', required: true, placeholder: '请输入年度/项目总预算' },
          { key: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '邀请招标', '竞争性谈判', '竞争性磋商', '询价', '单一来源'] },
        ]
      },
      {
        name: '服务范围',
        icon: 'Aim',
        fields: [
          { key: 'serviceScope', label: '服务内容范围', type: 'textarea', required: true, placeholder: '请详细描述服务内容和范围' },
          { key: 'serviceObjective', label: '服务目标', type: 'textarea', required: false, placeholder: '项目需要达成的目标和效果' },
          { key: 'serviceLocation', label: '服务地点', type: 'input', required: true, placeholder: '请输入服务提供地点' },
        ]
      },
      {
        name: '服务期限与标准',
        icon: 'Clock',
        fields: [
          { key: 'servicePeriod', label: '服务期限', type: 'input', required: true, placeholder: '如：1年，或自合同签订之日起12个月' },
          { key: 'serviceStandard', label: '服务标准', type: 'textarea', required: false, placeholder: '服务质量标准、行业规范等' },
          { key: 'serviceHour', label: '服务时间', type: 'input', required: false, placeholder: '如：工作日8小时，或7×24小时' },
        ]
      },
      {
        name: '人员配置要求',
        icon: 'UserFilled',
        fields: [
          { key: 'teamSize', label: '团队人数要求', type: 'number', required: false, placeholder: '最少配备人数' },
          { key: 'pmRequirement', label: '项目负责人要求', type: 'textarea', required: false, placeholder: '职称、工作经验、相关证书等' },
          { key: 'personnelQualification', label: '人员资质要求', type: 'textarea', required: false, placeholder: '团队成员整体资质要求' },
          { key: 'keyPersonnel', label: '关键岗位要求', type: 'textarea', required: false, placeholder: '关键岗位人员的具体要求' },
        ]
      },
      {
        name: '考核与验收',
        icon: 'ListCheck',
        fields: [
          { key: 'assessmentMethod', label: '考核方式', type: 'select', required: false, options: ['月度考核', '季度考核', '年度考核', '里程碑考核', '按项目验收'] },
          { key: 'assessmentStandard', label: '考核标准', type: 'textarea', required: false, placeholder: '详细的考核指标和评分标准' },
          { key: 'acceptStandard', label: '验收标准', type: 'textarea', required: false, placeholder: '服务成果验收标准' },
          { key: 'penaltyClause', label: '违约处罚条款', type: 'textarea', required: false, placeholder: '未达标时的处罚措施' },
        ]
      },
      {
        name: '商务报价',
        icon: 'Money',
        fields: [
          { key: 'priceInclude', label: '报价包含内容', type: 'textarea', required: false, placeholder: '人工费、管理费、税费、差旅费等' },
          { key: 'bidDeposit', label: '投标保证金（元）', type: 'number', required: false, placeholder: '如：10000' },
          { key: 'bidValidity', label: '投标有效期（天）', type: 'number', required: false, placeholder: '如：90' },
          { key: 'performanceBond', label: '履约保证金', type: 'input', required: false, placeholder: '如：合同金额的5%' },
        ]
      },
      {
        name: '付款方式',
        icon: 'CreditCard',
        fields: [
          { key: 'paymentMethod', label: '付款方式', type: 'select', required: true, options: ['按月支付', '按季度支付', '按半年支付', '按里程碑支付', '验收合格后一次性支付'] },
          { key: 'paymentDetail', label: '付款详细说明', type: 'textarea', required: false, placeholder: '详细描述付款条件和比例' },
        ]
      },
      {
        name: '投标人资格',
        icon: 'User',
        fields: [
          { key: 'qualification', label: '企业资质要求', type: 'textarea', required: false, placeholder: '营业执照、相关行业资质等' },
          { key: 'performance', label: '同类业绩要求', type: 'textarea', required: false, placeholder: '近3年类似服务项目业绩' },
          { key: 'creditRequirement', label: '信用要求', type: 'input', required: false, placeholder: '如：未列入失信被执行人名单' },
          { key: 'acceptUnion', label: '是否接受联合体', type: 'select', required: true, options: ['不接受', '接受'] },
        ]
      },
      {
        name: '保密与知识产权',
        icon: 'Lock',
        fields: [
          { key: 'confidentiality', label: '保密要求', type: 'textarea', required: false, placeholder: '服务过程中涉及的保密事项' },
          { key: 'ipOwnership', label: '知识产权归属', type: 'select', required: false, options: ['归采购人所有', '归服务商所有', '双方共有', '另行约定'] },
        ]
      },
      {
        name: '其他要求',
        icon: 'Plus',
        fields: [
          { key: 'otherRequirement', label: '其他要求', type: 'textarea', required: false, placeholder: '其他未尽事宜' },
          { key: 'contactPerson', label: '联系人', type: 'input', required: true, placeholder: '请输入联系人姓名' },
          { key: 'contactPhone', label: '联系电话', type: 'input', required: true, placeholder: '请输入联系电话' },
        ]
      },
    ]
  }
}

// 示例文本
export const exampleTexts = {
  engineering: 'XX产业园办公楼建设项目，总建筑面积约15000平方米，框架结构，地上12层地下2层，项目预算3000万元。建设地点在宜昌市XX区XX路88号，工期要求365日历天，质量标准达到合格标准。投标人需具备建筑工程施工总承包一级资质，项目经理需一级注册建造师。采用综合评估法评标，不接受联合体投标。投标保证金50万元，履约保证金为合同价的5%。付款方式：按月进度支付80%，竣工验收后付至97%，质保期满后付清。质保期整体工程2年，防水5年。联系人：张三，电话：13800138000',
  goods: '采购10台机架式服务器和5台网络交换机，总预算50万元，公开招标方式。服务器要求2颗CPU、64G内存、2T硬盘，交换机要求24口千兆。要求2026年8月31日前交付到宜昌市XX产业园1号楼机房，提供3年原厂质保，7×24小时技术支持，4小时响应。货到验收合格后一次性付款。需要投标保证金2万元，不允许进口产品，不接受联合体投标。需要厂家授权书。',
  service: '信息系统运维服务项目，年度预算80万元，服务期限1年。服务地点在宜昌市XX单位办公楼，要求7×24小时运维响应。配备不少于5人的运维团队，项目经理需有5年以上相关经验。按季度进行考核，考核结果与付款挂钩。付款方式按季度支付。投标人需具备同类项目业绩，近3年至少3个类似运维项目。不接受联合体投标。服务内容包括系统监控、故障处理、安全巡检、升级维护等。联系人：李四，电话：13900139000'
}
