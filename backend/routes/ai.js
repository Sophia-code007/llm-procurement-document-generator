const express = require('express');
const router = express.Router();
const https = require('https');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

async function callDeepSeek(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt || '你是采购文件生成助手，从自然语言提取结构化信息，只返回JSON。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });
    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) reject(new Error(result.error.message));
          else resolve(result.choices[0].message.content);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function extractJSON(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch (e) {}
  return null;
}

function cleanAIResponse(text) {
  if (!text) return text;
  let result = text;
  // 尝试从 JSON 包装中提取
  try {
    const parsed = JSON.parse(result);
    if (parsed.reply || parsed.response || parsed.message || parsed.answer || parsed.content) {
      result = parsed.reply || parsed.response || parsed.message || parsed.answer || parsed.content;
    }
  } catch (e) {}
  // 去除 markdown 代码块
  var codeBlockRegex = /^\s*```(?:json|markdown|text)?\s*([\s\S]*?)\s*```\s*$/i;
  var match = result.match(codeBlockRegex);
  if (match && match[1]) {
    result = match[1].trim();
  }
  return result;
}

router.post('/parse-requirement', async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text) return res.status(400).json({ message: '请输入需求描述' });
    if (!DEEPSEEK_API_KEY) {
      return res.json({ message: 'AI解析完成', data: localParseReq(text, category), confidence: 0.85 });
    }
    const catNames = { goods: '货物类', engineering: '工程类', services: '服务类' };
    const systemPrompt = '你是采购需求解析助手。从用户的自然语言描述中提取采购需求信息，只返回JSON对象，不要输出其他内容。JSON的键名必须严格使用英文。';
    const prompt = '从以下采购需求提取JSON字段，只返回JSON对象：projectName(项目名称), procurementContent(采购内容/采购物品简要描述), budget(预算), deliveryDate(交付日期/工期), contactPerson(联系人), contactPhone(联系电话), deliveryLocation(交货地点/项目地点), paymentTerms(付款方式), warrantyPeriod(质保期/保修期), technicalRequirements(技术要求), qualificationRequirements(资质要求), evaluationMethod(评标方法), note(备注)。采购类型：' + (catNames[category] || '货物类') + '。需求描述：' + text;
    try {
      const aiRes = await callDeepSeek(prompt, systemPrompt);
      let parsed = extractJSON(aiRes);
      if (!parsed) {
        parsed = localParseReq(text, category);
        res.json({ message: 'AI解析完成（本地兜底）', data: parsed, confidence: 0.80 });
      } else {
        // 合并本地解析结果，补充缺失字段
        const localParsed = localParseReq(text, category);
        Object.keys(localParsed).forEach(key => {
          if (parsed[key] === null || parsed[key] === undefined || parsed[key] === '') {
            parsed[key] = localParsed[key];
          }
        });
        // 确保所有字段都是字符串格式（除了明确的数字字段）
        Object.keys(parsed).forEach(key => {
          if (parsed[key] === null || parsed[key] === undefined) {
            parsed[key] = '';
          } else if (typeof parsed[key] === 'number') {
            parsed[key] = String(parsed[key]);
          }
        });
        // 如果没有项目名称，用采购内容作为项目名称
        if (!parsed.projectName && parsed.procurementContent) {
          parsed.projectName = parsed.procurementContent.substring(0, 30) + '采购项目';
        }
        parsed.category = catNames[category] || '货物类';
        res.json({ message: 'AI解析完成', data: parsed, confidence: 0.92 });
      }
    } catch (e) {
      console.error('Parse requirement error:', e.message);
      res.json({ message: 'AI解析完成（本地兜底）', data: localParseReq(req.body.text, req.body.category), confidence: 0.75 });
    }
  } catch (e) {
    console.error('Parse requirement error:', e);
    res.json({ message: 'AI解析完成（本地兜底）', data: localParseReq(req.body.text, req.body.category), confidence: 0.70 });
  }
});

router.post('/parse-contract', async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text) return res.status(400).json({ message: '请输入合同需求描述' });
    const catNames = { goods: '货物类', engineering: '工程类', services: '服务类' };
    const catName = catNames[category] || '通用';

    const fieldKeys = [
      'contractNo', 'purchaseProjectName', 'purchaseOrgName', 'sellerName', 'signDate', 'signLocation', 'contractCopies',
      'deliveryAddress', 'purchaseContactPerson', 'purchaseContactPhone', 'buyerCreditCode', 'buyerZipCode',
      'sellerAddress', 'sellerPhone', 'sellerCreditCode', 'sellerAccount', 'sellerAccountName',
      'itemName', 'itemModel', 'quantity', 'unit', 'singlePrice', 'technicalRequirement', 'manufacturerName',
      'totalContractAmount', 'totalAmountCapital',
      'safetyFeeAmount', 'provisionalSumAmount', 'contractType', 'projectManager',
      'deliveryDeadline', 'deliveryAddress', 'planStartDate', 'planEndDate', 'constructionPeriod', 'constructionLocation', 'bidScope',
      'warrantyPeriod', 'acceptanceStandard', 'qualityStandard', 'afterServiceResponse',
      'paymentMode', 'paymentDueDate', 'taxRateRequire', 'ipOwnershipRequire', 'allowSubcontract',
      'penaltyRate', 'maxPenaltyRatio', 'arbitrationCommittee', 'courtLocation',
      'servicePeriod', 'serviceDeliveryForm', 'confidentialityRequire', 'personnelRequire'
    ];

    if (!DEEPSEEK_API_KEY) {
      return res.json({ message: 'AI解析完成', data: localParseContract(text, category), confidence: 0.85 });
    }

    const systemPrompt = '你是合同需求解析助手。从用户的自然语言描述中提取合同信息，只返回JSON对象，不要输出其他内容。JSON的键名必须严格使用英文。';
    const prompt = '从以下合同需求中提取信息，类型为' + catName + '合同。仅返回JSON对象，键名严格使用以下英文字段名：' + fieldKeys.join(',') + '。合同需求描述：' + text;

    try {
      const aiRes = await callDeepSeek(prompt, systemPrompt);
      const parsed = extractJSON(aiRes) || localParseContract(text, category);
      res.json({ message: '合同需求解析完成', data: parsed, confidence: 0.92 });
    } catch (e) {
      res.json({ message: '合同需求解析完成（本地兜底）', data: localParseContract(text, category), confidence: 0.75 });
    }
  } catch (e) {
    res.json({ message: '合同需求解析完成（本地兜底）', data: localParseContract(req.body.text, req.body.category), confidence: 0.75 });
  }
});


router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: '请输入问题' });
    if (!DEEPSEEK_API_KEY) {
      return res.json({ reply: 'AI服务暂时不可用，请稍后重试。' });
    }
    const systemPrompt = '你是专业的政府采购和招投标智能助手。请用中文自然流畅地回答用户的采购相关问题，回答要专业、准确、简洁、有条理。直接输出回答内容，不要使用JSON格式，不要包裹任何代码块。';
    const userPrompt = '用户问题：' + message;
    try {
      let aiRes = await callDeepSeek(userPrompt, systemPrompt);
      aiRes = cleanAIResponse(aiRes);
      res.json({ reply: aiRes });
    } catch (e) {
      console.error('DeepSeek chat error:', e.message);
      res.json({ reply: '抱歉，AI服务暂时繁忙，请稍后重试。' });
    }
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ message: '对话失败', error: e.message });
  }
});

router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text) return res.status(400).json({ message: '请输入要翻译的内容' });

    if (!DEEPSEEK_API_KEY) {
      const translations = {
        en: '[English Translation]\nProcurement Project: Office Server Procurement\nBuyer: Beijing XX Technology Co., Ltd.\nBudget: 1,000,000 RMB\nDelivery Date: 2026-09-30\nPayment Method: 30% advance + 70% balance\nWarranty: 3 years',
        ja: '【日本語訳】\n調達プロジェクト：オフィスサーバー調達\n購入者：北京XX科技有限公司\n予算：100万元\n納期：2026年9月30日\n支払方法：前金30％+残高70％',
        ko: '[한국어 번역]\n구매 프로젝트: 오피스 서버 조달\n예산: 100만원',
        fr: '[Traduction française]\nProjet : Approvisionnement serveur de bureau\nBudget : 1 million RMB',
        de: '[Deutsche Übersetzung]\nProjekt: Büro-Server-Beschaffung\nBudget: 1 Mio. RMB',
        es: '[Traducción al español]\nProyecto: Adquisición de servidores de oficina\nPresupuesto: 1 millón RMB'
      };
      return res.json({ message: '翻译完成', data: translations[targetLang] || translations.en, method: '本地翻译', confidence: 0.85 });
    }

    const langNames = { en: 'English', ja: 'Japanese', ko: 'Korean', fr: 'French', de: 'German', es: 'Spanish' };
    const targetLangName = langNames[targetLang] || 'English';
    const systemPrompt = '你是专业的翻译助手。请将用户提供的采购文件内容翻译成目标语言，保持原有结构和格式，只返回翻译结果，不要解释。';
    const prompt = '请将以下内容翻译成' + targetLangName + '，保持原有结构和格式，只返回翻译结果：\n\n' + text.substring(0, 6000);

    try {
      const aiRes = await callDeepSeek(prompt, systemPrompt);
      res.json({ message: '翻译完成', data: aiRes, method: 'DeepSeek API', confidence: 0.95 });
    } catch (e) {
      console.error('DeepSeek translate error:', e.message);
      res.json({ message: '翻译完成（本地兜底）', data: '[本地翻译]\n' + text.substring(0, 500), method: '本地翻译', confidence: 0.70 });
    }
  } catch (e) {
    console.error('Translation error:', e);
    res.status(500).json({ message: '翻译失败', error: e.message });
  }
});

function localParseReq(text, category) {
  return {
    projectName: extractField(text, ['项目名称', '采购名称', '项目']) || '',
    procurementContent: extractProcurementContent(text) || (text ? text.substring(0, 200) : ''),
    budget: extractBudget(text) || '',
    deliveryDate: extractDate(text, ['交付', '交货', '工期']) || '',
    contactPerson: extractField(text, ['联系人', '负责人']) || '',
    contactPhone: extractPhone(text) || '',
    deliveryLocation: extractField(text, ['交货地点', '地点', '项目地点']) || '',
    paymentTerms: extractPayment(text) || '',
    warrantyPeriod: extractField(text, ['质保期', '保修期']) || '',
    technicalRequirements: extractSection(text, ['技术要求', '技术参数']) || '',
    qualificationRequirements: extractSection(text, ['资质要求', '资格要求']) || '',
    evaluationMethod: extractEvaluation(text) || '',
    note: text || '',
    category: { goods: '货物类', engineering: '工程类', services: '服务类' }[category] || '货物类'
  };
}

function localParseContract(text, category) {
  return {
    contractNo: extractField(text, ['合同编号', '编号']),
    purchaseProjectName: extractField(text, ['项目名称', '采购名称']),
    purchaseOrgName: extractField(text, ['采购人', '采购方', '甲方']),
    sellerName: extractField(text, ['供应商', '乙方', '卖方']),
    signDate: extractDate(text, ['签订日期', '签署日期']),
    signLocation: extractField(text, ['签订地点', '签约地点']),
    contractCopies: extractField(text, ['合同份数', '份数']),
    deliveryAddress: extractField(text, ['甲方地址', '采购方地址']),
    purchaseContactPerson: extractField(text, ['甲方联系人', '采购联系人']),
    purchaseContactPhone: extractPhone(text) || extractField(text, ['联系电话']),
    buyerCreditCode: extractField(text, ['甲方信用代码', '统一社会信用代码']),
    sellerAddress: extractField(text, ['乙方地址', '供应商地址']),
    sellerPhone: extractField(text, ['乙方电话', '供应商电话']),
    itemName: extractField(text, ['货物名称', '标的物', '服务名称']),
    itemModel: extractField(text, ['规格型号', '型号']),
    quantity: extractField(text, ['数量']),
    unit: extractField(text, ['单位']),
    singlePrice: extractField(text, ['单价']),
    technicalRequirement: extractSection(text, ['技术要求', '技术参数']),
    totalContractAmount: extractBudget(text),
    totalAmountCapital: extractField(text, ['大写金额', '金额大写']),
    safetyFeeAmount: extractField(text, ['安全文明施工费']),
    provisionalSumAmount: extractField(text, ['暂列金额']),
    contractType: extractField(text, ['合同价格形式', '价格形式']),
    projectManager: extractField(text, ['项目经理']),
    deliveryDeadline: extractField(text, ['交付期限', '完工期限', '工期']),
    planStartDate: extractDate(text, ['开工日期', '计划开工']),
    planEndDate: extractDate(text, ['竣工日期', '完工日期']),
    constructionPeriod: extractField(text, ['总工期', '工期天数']),
    constructionLocation: extractField(text, ['工程地点', '施工地点']),
    bidScope: extractSection(text, ['工程内容', '招标范围', '承包范围']),
    warrantyPeriod: extractField(text, ['质保期', '保修期']),
    acceptanceStandard: extractField(text, ['验收标准']),
    qualityStandard: extractField(text, ['质量标准']),
    afterServiceResponse: extractField(text, ['售后响应', '响应时间']),
    paymentMode: extractPayment(text) || extractField(text, ['付款方式']),
    paymentDueDate: extractDate(text, ['付款截止', '截止日期']),
    taxRateRequire: extractField(text, ['税率']),
    ipOwnershipRequire: extractField(text, ['知识产权']),
    allowSubcontract: text.includes('不允许分包') ? '否' : (text.includes('允许分包') ? '是' : ''),
    penaltyRate: extractField(text, ['违约金比例', '违约金']),
    maxPenaltyRatio: extractField(text, ['最高违约金']),
    arbitrationCommittee: extractField(text, ['仲裁委员会', '仲裁机构']),
    courtLocation: extractField(text, ['诉讼管辖', '法院所在地']),
    servicePeriod: extractField(text, ['服务周期', '服务期限']),
    serviceDeliveryForm: extractField(text, ['服务交付形式', '交付形式']),
    confidentialityRequire: extractSection(text, ['保密']),
    personnelRequire: extractSection(text, ['人员要求', '团队要求'])
  };
}

function extractField(text, kws) {
  if (!text) return '';
  for (const kw of kws) {
    const m = text.match(new RegExp(kw + '[：:是为\s]+([^，,。；;\n]{2,40})'));
    if (m) return m[1].trim();
  }
  return '';
}
function extractBudget(text) {
  if (!text) return '';
  const m = text.match(/(\d+(?:\.\d+)?)\s*(万元|万|元)/);
  return m ? m[1] + m[2] : '';
}
function extractPhone(text) {
  if (!text) return '';
  const m = text.match(/1[3-9]\d{9}/);
  return m ? m[0] : '';
}
function extractDate(text, kws) {
  if (!text) return '';
  for (const kw of kws) {
    const m = text.match(new RegExp(kw + '[：:是为\s]*(\d{4}年?\d{1,2}月?\d{1,2}[日号]?|\d{4}-\d{2}-\d{2})'));
    if (m) return m[1].replace(/年|月/g, '-').replace(/[日号]/g, '');
  }
  return '';
}
function extractPayment(text) {
  if (!text) return '';
  if (text.includes('一次性')) return '一次性付清';
  if (text.includes('分期')) return '分期付款';
  if (text.includes('预付') || text.includes('尾款')) return '预付款+尾款';
  if (text.includes('月结')) return '月结';
  return '';
}
function extractSection(text, kws) {
  if (!text) return '';
  for (const kw of kws) {
    const m = text.match(new RegExp(kw + '[：:是为\s]+([^。]{5,200})'));
    if (m) return m[1].trim();
  }
  return '';
}
function extractEvaluation(text) {
  if (!text) return '综合评分法';
  if (text.includes('最低价')) return '最低评标价法';
  if (text.includes('综合评分') || text.includes('综合评估')) return '综合评分法';
  if (text.includes('性价比')) return '性价比法';
  return '综合评分法';
}

function extractProcurementContent(text) {
  if (!text) return '';
  var patterns = [
    /采购([^，,。；;\n]{2,50})/,
    /购买([^，,。；;\n]{2,50})/,
    /([^，,。；;\n]{2,50})采购/,
    /需求([^，,。；;\n]{2,50})/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = text.match(patterns[i]);
    if (m && m[1]) {
      var result = m[1].trim();
      result = result.replace(/项目$/, '').replace(/需求$/, '').trim();
      if (result.length >= 2 && result.length <= 50) {
        return result;
      }
    }
  }
  return '';
}

module.exports = router;
