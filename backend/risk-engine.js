/**
 * 采购文件智能风险检测引擎
 * 检测维度：霸王条款、漏项、过期法规引用、合规红线
 *
 * 法规库说明：
 * - 系统优先从外部目录 data/regulations/ 加载法规文件
 * - 每个法规为一个独立的 .json 文件
 * - 如果外部目录不存在或为空，则使用内置法规库
 * - 法规文件格式示例见 data/regulations/ 目录
 */

const fs = require('fs')
const path = require('path')

// 法规文件存放目录（相对于本文件所在目录）
const REGULATIONS_DIR = path.join(__dirname, 'data', 'regulations')

// ==================== 内置法规库（作为 fallback）====================

// 霸王条款关键词库
const BUILTIN_UNFAIR_CLAUSE_PATTERNS = [
  {
    pattern: /单方(变更|修改|调整)|有权.*?(变更|修改|调整).*?无需|可随时(变更|修改)/i,
    title: '单方变更权条款',
    level: 'high',
    desc: '合同赋予一方单方面变更合同内容的权利，违反《民法典》合同平等原则。',
    suggestion: '删除单方变更权条款，或约定"任何变更须经双方协商一致并以书面形式确认"。'
  },
  {
    pattern: /单方(解除|终止)|有权.*?(解除|终止).*?无需|随时(解除|终止)/i,
    title: '单方解除权条款',
    level: 'high',
    desc: '合同赋予一方单方面解除权，而对另一方设置严苛的解除条件，权利义务严重不对等。',
    suggestion: '对等约定双方的解除条件，或约定"任何一方解除均需提前30日书面通知并说明理由"。'
  },
  {
    pattern: /违约金(超过|高于).*?(30%|百分之三十)|违约金为合同总金额的(30%|50%|100%)/i,
    title: '违约金过高条款',
    level: 'medium',
    desc: '约定的违约金比例过高，可能被法院认定为显失公平而调低。',
    suggestion: '违约金一般不超过实际损失的30%，建议约定为合同金额的5%-10%。'
  },
  {
    pattern: /不得(转让|分包|转包)|未经(书面|事先)(同意|许可).*?(不得|禁止)/i,
    title: '限制正当权利条款',
    level: 'medium',
    desc: '过度限制承包方的合法权利，如完全禁止分包可能影响项目正常实施。',
    suggestion: '约定"经甲方书面同意后可分包"而非绝对禁止，并明确分包方资质要求。'
  },
  {
    pattern: /放弃.*?(追偿|索赔|诉讼|仲裁)|不得.*?(追究|主张).*(责任|赔偿)/i,
    title: '免责/弃权条款',
    level: 'high',
    desc: '要求一方放弃法定追偿权，违反《民法典》关于格式条款的强制性规定。',
    suggestion: '删除该条款，或改为"双方应依法承担各自的责任"。'
  },
  {
    pattern: /最终解释权归|保留最终解释权|以.*?解释为准/i,
    title: '最终解释权条款',
    level: 'medium',
    desc: '"最终解释权归甲方所有"属于典型的霸王条款，已被《合同违法行为监督处理办法》明令禁止。',
    suggestion: '删除最终解释权条款，约定"合同条款有争议时，按通常理解解释；有两种以上解释的，按不利于提供格式条款一方的解释"。'
  },
  {
    pattern: /所有(损失|费用|责任).*(由|归).*(乙方|承包方|供应商)|一切(损失|责任).*(由|归)/i,
    title: '无限责任条款',
    level: 'high',
    desc: '要求一方承担"所有""一切"损失和责任，未设置合理的责任上限和免责情形。',
    suggestion: '明确责任范围和赔偿上限，设置不可抗力等免责条款，约定"因一方过错造成的损失由过错方承担"。'
  }
]

// 过期法规库
const BUILTIN_EXPIRED_REGULATIONS = [
  {
    name: '《招标投标法实施条例》2011年',
    pattern: /招标投标法实施条例.*2011|2011.*招标投标法实施条例/i,
    status: '已修订',
    current: '《招标投标法实施条例》（2019年修订）',
    suggestion: '引用2019年修订版《招标投标法实施条例》'
  },
  {
    name: '《政府采购法》2002年',
    pattern: /政府采购法.*2002|2002.*政府采购法/i,
    status: '已修订',
    current: '《政府采购法》（2014年修正）',
    suggestion: '引用2014年修正版《政府采购法》'
  },
  {
    name: '《合同法》',
    pattern: /依据《?合同法》?|根据《?合同法》?|《合同法》第/i,
    status: '已废止',
    current: '《民法典》合同编',
    suggestion: '2021年1月1日起《合同法》已废止，应引用《民法典》合同编相关条款'
  },
  {
    name: '《物权法》',
    pattern: /依据《?物权法》?|根据《?物权法》?|《物权法》第/i,
    status: '已废止',
    current: '《民法典》物权编',
    suggestion: '2021年1月1日起《物权法》已废止，应引用《民法典》物权编相关条款'
  },
  {
    name: '《担保法》',
    pattern: /依据《?担保法》?|根据《?担保法》?|《担保法》第/i,
    status: '已废止',
    current: '《民法典》担保物权编、保证合同',
    suggestion: '2021年1月1日起《担保法》已废止，应引用《民法典》相关条款'
  },
  {
    name: '《侵权责任法》',
    pattern: /依据《?侵权责任法》?|根据《?侵权责任法》?|《侵权责任法》第/i,
    status: '已废止',
    current: '《民法典》侵权责任编',
    suggestion: '2021年1月1日起《侵权责任法》已废止，应引用《民法典》侵权责任编'
  }
]

// 合规红线检测
const BUILTIN_COMPLIANCE_REDLINES = [
  {
    pattern: /指定品牌|限定品牌|指定(专利|商标)|必须使用.*品牌|限定.*供应商/i,
    title: '限定特定品牌或供应商',
    level: 'high',
    desc: '《政府采购法实施条例》第二十条明确禁止限定或指定特定品牌、专利、商标或供应商。',
    suggestion: '删除品牌限定，改为"同等档次及以上品牌"或明确技术参数要求。'
  },
  {
    pattern: /拆分项目|化整为零|拆分为.*(个|项).*(采购|招标)/i,
    title: '拆分项目规避招标',
    level: 'high',
    desc: '《招标投标法》第四条禁止将必须进行招标的项目化整为零规避招标。',
    suggestion: '按项目实际规模合并采购，确保达到招标限额的必须公开招标。'
  },
  {
    pattern: /排斥潜在投标人|设置过高门槛|特定区域业绩|限定行政区域/i,
    title: '排斥潜在投标人',
    level: 'high',
    desc: '《招标投标法》第十八条禁止以不合理条件限制或排斥潜在投标人。',
    suggestion: '取消地域、所有制等歧视性条件，业绩要求应与项目规模相匹配。'
  },
  {
    pattern: /不合理资质|过高资质|超出.*资质|资质要求过高/i,
    title: '设定不合理的资质条件',
    level: 'high',
    desc: '《政府采购法》第二十二条要求供应商资格条件应与项目特点相适应，不得设置不合理条件。',
    suggestion: '资质等级要求应与项目规模匹配，不得设置超出项目需要的资质条件。'
  }
]

// ==================== 动态加载外部法规库 ====================

let cachedUnfairClauses = null
let cachedExpiredRegs = null
let cachedRedlines = null
let lastLoadTime = 0
const CACHE_TTL = 60000 // 缓存60秒，避免频繁读盘

function loadExternalRegulations() {
  const now = Date.now()
  if (now - lastLoadTime < CACHE_TTL && cachedUnfairClauses) {
    return {
      unfairClauses: cachedUnfairClauses,
      expiredRegs: cachedExpiredRegs,
      redlines: cachedRedlines
    }
  }

  let unfairClauses = []
  let expiredRegs = []
  let redlines = []

  try {
    if (fs.existsSync(REGULATIONS_DIR)) {
      const files = fs.readdirSync(REGULATIONS_DIR).filter(f => f.endsWith('.json'))
      files.forEach(file => {
        try {
          const raw = fs.readFileSync(path.join(REGULATIONS_DIR, file), 'utf8')
          const reg = JSON.parse(raw)
          if (!reg.type || !reg.pattern) {
            console.warn(`[风险引擎] 法规文件格式错误，跳过: ${file}`)
            return
          }
          // 将 pattern 字符串转为正则
          const regex = new RegExp(reg.pattern, 'i')
          if (reg.type === 'unfair_clause') {
            unfairClauses.push({
              pattern: regex,
              title: reg.title || reg.name,
              level: reg.level || 'medium',
              desc: reg.description || reg.desc || '',
              suggestion: reg.suggestion || ''
            })
          } else if (reg.type === 'expired_regulation') {
            expiredRegs.push({
              name: reg.name,
              pattern: regex,
              status: reg.status || '已废止',
              current: reg.current || '',
              suggestion: reg.suggestion || ''
            })
          } else if (reg.type === 'compliance_redline') {
            redlines.push({
              pattern: regex,
              title: reg.title || reg.name,
              level: reg.level || 'high',
              desc: reg.description || reg.desc || '',
              suggestion: reg.suggestion || ''
            })
          }
        } catch (e) {
          console.warn(`[风险引擎] 加载法规文件失败: ${file}`, e.message)
        }
      })
      console.log(`[风险引擎] 已从外部加载 ${files.length} 个法规文件`)
    }
  } catch (e) {
    console.warn('[风险引擎] 读取法规目录失败:', e.message)
  }

  // 合并不置空的分类：外部优先，外部为空则回退到内置
  const finalUnfairClauses = [...BUILTIN_UNFAIR_CLAUSE_PATTERNS, ...unfairClauses]
  const finalExpiredRegs = [...BUILTIN_EXPIRED_REGULATIONS, ...expiredRegs]
  const finalRedlines = [...BUILTIN_COMPLIANCE_REDLINES, ...redlines]

  cachedUnfairClauses = finalUnfairClauses
  cachedExpiredRegs = finalExpiredRegs
  cachedRedlines = finalRedlines
  lastLoadTime = now

  return { unfairClauses: finalUnfairClauses, expiredRegs: finalExpiredRegs, redlines: finalRedlines }
}

// ==================== 必备条款检查 ====================

// 必备条款检查（招标书）
const BID_REQUIRED_CLAUSES = [
  { key: 'bidBondAmount', label: '投标保证金', desc: '投标保证金金额及缴纳方式' },
  { key: 'performanceBondRatio', label: '履约保证金', desc: '履约保证金比例或金额' },
  { key: 'bidValidPeriod', label: '投标有效期', desc: '投标文件的_valid_期限' },
  { key: 'fundSource', label: '资金来源', desc: '项目资金来源说明' },
  { key: 'ceilingPrice', label: '最高限价', desc: '项目最高限价或预算金额' },
  { key: 'paymentTerms', label: '付款方式', desc: '合同付款节点和比例' },
  { key: 'warrantyPeriod', label: '质保期限', desc: '质量保证期限' }
]

// 必备条款检查（合同）
const CONTRACT_REQUIRED_CLAUSES = [
  { key: 'contractAmount', label: '合同金额', desc: '合同总金额' },
  { key: 'paymentTerms', label: '付款条款', desc: '付款节点、比例和方式' },
  { key: 'deliveryDate', label: '交付期限', desc: '货物交付或服务完成期限' },
  { key: 'warrantyPeriod', label: '质保期限', desc: '质量保证期限' },
  { key: 'breachClause', label: '违约责任', desc: '违约责任和赔偿约定' },
  { key: 'disputeResolution', label: '争议解决', desc: '争议解决方式和管辖' },
  { key: 'signDate', label: '签署日期', desc: '合同签署日期' },
  { key: 'partyAName', label: '甲方名称', desc: '合同甲方（采购人）名称' },
  { key: 'partyBName', label: '乙方名称', desc: '合同乙方（供应商）名称' }
]

// ==================== 主检测函数 ====================

/**
 * 主检测函数
 * @param {Object} params - 检测参数
 * @param {string} params.docType - 文档类型: 'bid' | 'contract'
 * @param {Object} params.data - 用户填写的数据
 * @param {string} params.content - 文档HTML/文本内容（可选）
 * @param {string} params.docId - 文档ID
 */
function analyzeRisks(params) {
  const { docType, data, content = '', docId } = params
  const risks = []
  let riskId = 1

  const text = content || Object.values(data).filter(v => typeof v === 'string').join(' ')

  const getMatchDetails = (pattern, text) => {
    const matches = []
    let match
    const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        text: match[0],
        index: match.index,
        groups: match.slice(1)
      })
    }
    return matches
  }

  // 加载法规库（外部 + 内置 fallback）
  const { unfairClauses, expiredRegs, redlines } = loadExternalRegulations()

  // 1. 霸王条款检测
  unfairClauses.forEach(rule => {
    const matches = getMatchDetails(rule.pattern, text)
    if (matches.length > 0) {
      risks.push({
        id: riskId++,
        type: 'unfair_clause',
        level: rule.level,
        title: rule.title,
        description: rule.desc,
        suggestion: rule.suggestion,
        category: '霸王条款',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString(),
        matchedText: matches.map(m => m.text).slice(0, 5)
      })
    }
  })

  // 2. 过期法规引用检测
  expiredRegs.forEach(reg => {
    const matches = getMatchDetails(reg.pattern, text)
    if (matches.length > 0) {
      risks.push({
        id: riskId++,
        type: 'expired_regulation',
        level: 'high',
        title: `引用${reg.status}法规：${reg.name}`,
        description: `文档中引用了${reg.status}的法规${reg.name}，当前有效版本为${reg.current}。`,
        suggestion: reg.suggestion,
        category: '过期法规',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString(),
        matchedText: matches.map(m => m.text).slice(0, 5)
      })
    }
  })

  // 3. 合规红线检测
  redlines.forEach(rule => {
    const matches = getMatchDetails(rule.pattern, text)
    if (matches.length > 0) {
      risks.push({
        id: riskId++,
        type: 'compliance_redline',
        level: rule.level,
        title: rule.title,
        description: rule.desc,
        suggestion: rule.suggestion,
        category: '合规红线',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString(),
        matchedText: matches.map(m => m.text).slice(0, 5)
      })
    }
  })

  // 4. 漏项检测 - 根据文档类型检查必备字段（改为中风险）
  const requiredClauses = docType === 'bid' ? BID_REQUIRED_CLAUSES : CONTRACT_REQUIRED_CLAUSES
  requiredClauses.forEach(clause => {
    const value = data[clause.key]
    if (!value || value === '' || value === '(未填写)') {
      risks.push({
        id: riskId++,
        type: 'missing_clause',
        level: 'medium',
        title: `${clause.label}未填写`,
        description: `${clause.desc}是${docType === 'bid' ? '招标书' : '合同'}的必备条款，缺失将导致文件不完整。`,
        suggestion: `请在字段确认页面补充${clause.label}信息。`,
        category: '条款漏项',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString(),
        matchedText: []
      })
    }
  })

  // 5. 智能语义检测（基于关键词）
  // 5.1 质保金比例异常
  const warrantyMatch = text.match(/质保金[^\d]*(\d+)[^\d]*%/)
  if (warrantyMatch) {
    const ratio = parseInt(warrantyMatch[1])
    if (ratio > 10) {
      risks.push({
        id: riskId++,
        type: 'unfair_clause',
        level: 'medium',
        title: '质保金比例过高',
        description: `质保金比例为${ratio}%，超过行业通常的5%-10%标准，可能加重供应商负担。`,
        suggestion: '建议将质保金比例调整为合同金额的5%-10%，或约定质量保函替代质保金。',
        category: '霸王条款',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString()
      })
    }
  }

  // 5.2 付款比例异常（预付款过低）
  const advanceMatch = text.match(/预付[^\d]*(\d+)[^\d]*%/)
  if (advanceMatch) {
    const ratio = parseInt(advanceMatch[1])
    if (ratio < 10 && ratio > 0) {
      risks.push({
        id: riskId++,
        type: 'unfair_clause',
        level: 'low',
        title: '预付款比例偏低',
        description: `预付款比例为${ratio}%，低于行业通常的30%标准，可能影响供应商资金周转。`,
        suggestion: '建议将预付款比例提高至合同金额的20%-30%，或分阶段支付。',
        category: '霸王条款',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString()
      })
    }
  }

  // 5.3 投标有效期异常
  const validMatch = text.match(/有效期[^\d]*(\d+)[^\d]*天/)
  if (validMatch) {
    const days = parseInt(validMatch[1])
    if (days < 60) {
      risks.push({
        id: riskId++,
        type: 'missing_clause',
        level: 'medium',
        title: '投标有效期过短',
        description: `投标有效期为${days}天，低于《招标投标法》建议的60-90天标准，可能导致投标人在有效期内无法完成合同签订。`,
        suggestion: '建议将投标有效期设定为60-90天，确保有充足的评标和合同签订时间。',
        category: '条款漏项',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString()
      })
    }
  }

  // 5.4 无验收条款（改为中风险）
  if (!/验收|交付|成果确认/i.test(text)) {
    risks.push({
      id: riskId++,
      type: 'missing_clause',
      level: 'medium',
      title: '验收条款缺失',
      description: '文档中未明确约定验收标准、验收程序和验收期限，可能导致交付后产生争议。',
      suggestion: '补充验收条款，明确验收标准（如技术参数、性能指标）、验收程序和验收期限。',
      category: '条款漏项',
      resolved: false,
      documentId: docId,
      createdAt: new Date().toISOString(),
      matchedText: []
    })
  }

  // 5.5 无知识产权条款（合同）
  if (docType === 'contract' && !/知识产权|知识产权|版权|专利权/i.test(text)) {
    risks.push({
      id: riskId++,
      type: 'missing_clause',
      level: 'medium',
      title: '知识产权条款缺失',
      description: '合同未约定知识产权归属和使用许可，可能导致交付成果的知识产权纠纷。',
      suggestion: '补充知识产权条款，明确交付成果的知识产权归属、使用许可范围和侵权责任。',
      category: '条款漏项',
      resolved: false,
      documentId: docId,
      createdAt: new Date().toISOString()
    })
  }

  // 5.6 无保密条款（合同）
  if (docType === 'contract' && !/保密|商业秘密|机密/i.test(text)) {
    risks.push({
      id: riskId++,
      type: 'missing_clause',
      level: 'low',
      title: '保密条款缺失',
      description: '合同未约定保密义务和保密期限，可能导致商业信息泄露。',
      suggestion: '补充保密条款，约定保密信息范围、保密期限（通常为合同期满后2-3年）和违约责任。',
      category: '条款漏项',
      resolved: false,
      documentId: docId,
      createdAt: new Date().toISOString()
    })
  }

  // 6. 排他性/歧视性条款检测
  if (/仅限|仅限|仅接受|只接受|排斥|排除/i.test(text)) {
    risks.push({
      id: riskId++,
      type: 'compliance_redline',
      level: 'high',
      title: '可能存在歧视性条款',
      description: '文档中使用了"仅限""仅接受""排斥"等排他性表述，可能构成对潜在投标人的歧视。',
      suggestion: '删除排他性表述，确保所有符合条件的供应商均可参与投标。',
      category: '合规红线',
      resolved: false,
      documentId: docId,
      createdAt: new Date().toISOString()
    })
  }

  // 7. 保证金比例异常检测
  const bondMatch = text.match(/保证金[^\d]*(\d+)[^\d]*%/)
  if (bondMatch) {
    const ratio = parseInt(bondMatch[1])
    if (ratio > 2) {
      risks.push({
        id: riskId++,
        type: 'unfair_clause',
        level: 'medium',
        title: '投标保证金比例超标',
        description: `投标保证金比例为${ratio}%，超过《招标投标法实施条例》规定的最高2%限额。`,
        suggestion: '根据《招标投标法实施条例》第二十六条，投标保证金不得超过招标项目估算价的2%。',
        category: '霸王条款',
        resolved: false,
        documentId: docId,
        createdAt: new Date().toISOString()
      })
    }
  }

  // 去重
  const seen = new Set()
  const uniqueRisks = risks.filter(r => {
    const key = r.title + r.description
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    risks: uniqueRisks,
    summary: {
      high: uniqueRisks.filter(r => r.level === 'high').length,
      medium: uniqueRisks.filter(r => r.level === 'medium').length,
      low: uniqueRisks.filter(r => r.level === 'low').length,
      total: uniqueRisks.length
    }
  }
}

module.exports = { analyzeRisks, loadExternalRegulations }
