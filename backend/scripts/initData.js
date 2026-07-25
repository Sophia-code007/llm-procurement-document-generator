require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('../models/Template');
const Supplier = require('../models/Supplier');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');

  await Template.deleteMany({});
  await Supplier.deleteMany({});

  const templates = [
    {
      name: '货物采购招标文件模板',
      category: 'goods',
      categoryName: '货物类',
      description: '适用于各类货物采购项目的标准招标文件模板',
      templateId: 'GD-ZB-001',
      isRecommended: true,
      chapters: [
        {
          name: '基础信息',
          fields: [
            { name: 'purchaseProjectName', label: '采购项目名称', type: 'text', required: true, placeholder: '请输入采购项目名称' },
            { name: 'purchaseOrgName', label: '采购组织单位', type: 'text', required: true, placeholder: '请输入采购组织单位' },
            { name: 'purchaseContactPerson', label: '采购联系人', type: 'text', required: true, placeholder: '请输入联系人姓名' },
            { name: 'purchaseContactPhone', label: '联系电话', type: 'text', required: true, placeholder: '请输入联系电话' },
            { name: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '竞争性磋商', '询价采购', '单一来源', '框架协议'] },
            { name: 'totalBudgetAmount', label: '预算总金额（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
            { name: 'fundSource', label: '资金来源', type: 'text', required: true, placeholder: '请输入资金来源' }
          ]
        },
        {
          name: '采购需求',
          fields: [
            { name: 'techRequirement', label: '技术参数要求', type: 'textarea', required: true, placeholder: '请描述详细技术参数要求' },
            { name: 'allowImportGoods', label: '是否允许进口', type: 'select', required: false, options: ['是', '否'] },
            { name: 'setMaxPriceLimit', label: '是否设定最高限价', type: 'select', required: false, options: ['是', '否'] },
            { name: 'maxPriceAmount', label: '最高限价金额（元）', type: 'number', required: false, placeholder: '设定最高限价时填写' },
            { name: 'quoteScope', label: '报价范围', type: 'text', required: false, placeholder: '如：10万-50万' }
          ]
        }
      ]
    },
    {
      name: '工程建设项目招标文件模板',
      category: 'engineering',
      categoryName: '工程类',
      description: '适用于各类工程建设项目的标准招标文件模板',
      templateId: 'GC-ZB-001',
      isRecommended: true,
      chapters: [
        {
          name: '基础信息',
          fields: [
            { name: 'purchaseProjectName', label: '采购项目名称', type: 'text', required: true, placeholder: '请输入采购项目名称' },
            { name: 'purchaseOrgName', label: '采购组织单位', type: 'text', required: true, placeholder: '请输入采购组织单位' },
            { name: 'purchaseContactPerson', label: '采购联系人', type: 'text', required: true, placeholder: '请输入联系人姓名' },
            { name: 'purchaseContactPhone', label: '联系电话', type: 'text', required: true, placeholder: '请输入联系电话' },
            { name: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '竞争性磋商', '询价采购', '单一来源', '框架协议'] },
            { name: 'totalBudgetAmount', label: '预算总金额（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
            { name: 'fundSource', label: '资金来源', type: 'text', required: true, placeholder: '请输入资金来源' }
          ]
        },
        {
          name: '项目概况',
          fields: [
            { name: 'projectCode', label: '项目编号', type: 'text', required: true, placeholder: '请输入项目编号' },
            { name: 'tendererName', label: '招标人名称', type: 'text', required: true, placeholder: '请输入招标人名称' },
            { name: 'legalRepresentative', label: '法定代表人', type: 'text', required: false, placeholder: '请输入法定代表人' },
            { name: 'constructionLocation', label: '建设地点', type: 'text', required: true, placeholder: '请输入建设地点' },
            { name: 'constructionScale', label: '工程规模（平方米）', type: 'number', required: true, placeholder: '请输入工程规模' },
            { name: 'structureType', label: '结构形式', type: 'select', required: true, options: ['框架结构', '剪力墙结构', '钢结构', '砖混结构', '其他'] }
          ]
        }
      ]
    },
    {
      name: '服务采购招标文件模板',
      category: 'services',
      categoryName: '服务类',
      description: '适用于各类服务采购项目的标准招标文件模板',
      templateId: 'FW-ZB-001',
      isRecommended: true,
      chapters: [
        {
          name: '基础信息',
          fields: [
            { name: 'purchaseProjectName', label: '采购项目名称', type: 'text', required: true, placeholder: '请输入采购项目名称' },
            { name: 'purchaseOrgName', label: '采购组织单位', type: 'text', required: true, placeholder: '请输入采购组织单位' },
            { name: 'purchaseContactPerson', label: '采购联系人', type: 'text', required: true, placeholder: '请输入联系人姓名' },
            { name: 'purchaseContactPhone', label: '联系电话', type: 'text', required: true, placeholder: '请输入联系电话' },
            { name: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '竞争性磋商', '询价采购', '单一来源', '框架协议'] },
            { name: 'totalBudgetAmount', label: '预算总金额（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
            { name: 'fundSource', label: '资金来源', type: 'text', required: true, placeholder: '请输入资金来源' }
          ]
        },
        {
          name: '服务要求',
          fields: [
            { name: 'serviceContent', label: '服务内容', type: 'textarea', required: true, placeholder: '请描述详细服务内容' },
            { name: 'serviceLocation', label: '服务地点', type: 'text', required: true, placeholder: '请输入服务地点' },
            { name: 'servicePeriod', label: '服务期限', type: 'text', required: true, placeholder: '请输入服务期限' },
            { name: 'serviceStandards', label: '服务标准', type: 'textarea', required: false, placeholder: '请描述服务质量标准' }
          ]
        }
      ]
    },
    {
      name: '货物采购合同模板',
      category: 'goods',
      categoryName: '货物类',
      description: '适用于各类货物采购项目的标准合同模板',
      templateId: 'GD-HT-001',
      chapters: [
        {
          name: '基础信息',
          fields: [
            { name: 'purchaseProjectName', label: '采购项目名称', type: 'text', required: true, placeholder: '请输入采购项目名称' },
            { name: 'purchaseOrgName', label: '采购组织单位', type: 'text', required: true, placeholder: '请输入采购组织单位' },
            { name: 'purchaseContactPerson', label: '采购联系人', type: 'text', required: true, placeholder: '请输入联系人姓名' },
            { name: 'purchaseContactPhone', label: '联系电话', type: 'text', required: true, placeholder: '请输入联系电话' },
            { name: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '竞争性磋商', '询价采购', '单一来源', '框架协议'] },
            { name: 'totalBudgetAmount', label: '预算总金额（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
            { name: 'fundSource', label: '资金来源', type: 'text', required: true, placeholder: '请输入资金来源' }
          ]
        },
        {
          name: '采购需求',
          fields: [
            { name: 'techRequirement', label: '技术参数要求', type: 'textarea', required: true, placeholder: '请描述详细技术参数要求' }
          ]
        }
      ]
    },
    {
      name: '工程建设项目合同模板',
      category: 'engineering',
      categoryName: '工程类',
      description: '适用于各类工程建设项目的标准合同模板',
      templateId: 'GC-HT-001',
      chapters: [
        {
          name: '基础信息',
          fields: [
            { name: 'purchaseProjectName', label: '采购项目名称', type: 'text', required: true, placeholder: '请输入采购项目名称' },
            { name: 'purchaseOrgName', label: '采购组织单位', type: 'text', required: true, placeholder: '请输入采购组织单位' },
            { name: 'purchaseContactPerson', label: '采购联系人', type: 'text', required: true, placeholder: '请输入联系人姓名' },
            { name: 'purchaseContactPhone', label: '联系电话', type: 'text', required: true, placeholder: '请输入联系电话' },
            { name: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '竞争性磋商', '询价采购', '单一来源', '框架协议'] },
            { name: 'totalBudgetAmount', label: '预算总金额（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
            { name: 'fundSource', label: '资金来源', type: 'text', required: true, placeholder: '请输入资金来源' }
          ]
        },
        {
          name: '项目概况',
          fields: [
            { name: 'projectCode', label: '项目编号', type: 'text', required: true, placeholder: '请输入项目编号' },
            { name: 'constructionLocation', label: '建设地点', type: 'text', required: true, placeholder: '请输入建设地点' },
            { name: 'constructionScale', label: '工程规模（平方米）', type: 'number', required: true, placeholder: '请输入工程规模' }
          ]
        }
      ]
    },
    {
      name: '服务采购合同模板',
      category: 'services',
      categoryName: '服务类',
      description: '适用于各类服务采购项目的标准合同模板',
      templateId: 'FW-HT-001',
      chapters: [
        {
          name: '基础信息',
          fields: [
            { name: 'purchaseProjectName', label: '采购项目名称', type: 'text', required: true, placeholder: '请输入采购项目名称' },
            { name: 'purchaseOrgName', label: '采购组织单位', type: 'text', required: true, placeholder: '请输入采购组织单位' },
            { name: 'purchaseContactPerson', label: '采购联系人', type: 'text', required: true, placeholder: '请输入联系人姓名' },
            { name: 'purchaseContactPhone', label: '联系电话', type: 'text', required: true, placeholder: '请输入联系电话' },
            { name: 'purchaseMethod', label: '采购方式', type: 'select', required: true, options: ['公开招标', '竞争性磋商', '询价采购', '单一来源', '框架协议'] },
            { name: 'totalBudgetAmount', label: '预算总金额（元）', type: 'number', required: true, placeholder: '请输入预算金额' },
            { name: 'fundSource', label: '资金来源', type: 'text', required: true, placeholder: '请输入资金来源' }
          ]
        },
        {
          name: '服务要求',
          fields: [
            { name: 'serviceContent', label: '服务内容', type: 'textarea', required: true, placeholder: '请描述详细服务内容' },
            { name: 'serviceLocation', label: '服务地点', type: 'text', required: true, placeholder: '请输入服务地点' },
            { name: 'servicePeriod', label: '服务期限', type: 'text', required: true, placeholder: '请输入服务期限' }
          ]
        }
      ]
    }
  ];

  await Template.insertMany(templates);
  console.log('Templates inserted');

  const suppliers = [
    { name: '华为技术有限公司', category: 'goods', score: 95, tags: ['IT设备', '服务器', '网络设备'], contactPerson: '王先生', contactPhone: '13800138001' },
    { name: '联想集团有限公司', category: 'goods', score: 92, tags: ['电脑', '办公设备', 'IT解决方案'], contactPerson: '李先生', contactPhone: '13900139002' },
    { name: '中国建筑集团', category: 'engineering', score: 98, tags: ['建筑施工', '工程总承包', '基础设施'], contactPerson: '张经理', contactPhone: '13700137003' },
    { name: '中铁建设集团', category: 'engineering', score: 96, tags: ['铁路工程', '桥梁隧道', '市政工程'], contactPerson: '刘总监', contactPhone: '13600136004' },
    { name: '万达物业有限公司', category: 'services', score: 88, tags: ['物业管理', '设施维护', '安保服务'], contactPerson: '赵主管', contactPhone: '13500135005' },
    { name: '顺丰速运有限公司', category: 'services', score: 93, tags: ['物流配送', '仓储管理', '快递服务'], contactPerson: '陈经理', contactPhone: '13400134006' },
    { name: '戴尔科技集团', category: 'goods', score: 90, tags: ['服务器', '存储设备', '云计算'], contactPerson: '周先生', contactPhone: '13300133007' },
    { name: '中国中铁', category: 'engineering', score: 97, tags: ['轨道交通', '公路工程', '水利水电'], contactPerson: '孙总监', contactPhone: '13200132008' },
    { name: '万科物业', category: 'services', score: 91, tags: ['高端物业', '智能化管理', '绿化养护'], contactPerson: '马主管', contactPhone: '13100131009' }
  ];

  await Supplier.insertMany(suppliers);
  console.log('Suppliers inserted');

  console.log('Initial data inserted successfully');
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});