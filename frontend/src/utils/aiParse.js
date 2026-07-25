// AI自然语言解析工具（本地规则版，可替换为真实大模型API）

export function intelligentParse(text, templateType) {
  const data = {}

  // 项目名称
  const projectNameMatch = text.match(/(.{2,30}?(?:项目|采购|建设|工程))/)
  if (projectNameMatch) data.projectName = projectNameMatch[1]

  // 预算金额
  const budgetMatch = text.match(/(?:预算|总预算)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*(?:万|元)?/)
  if (budgetMatch) {
    const val = parseFloat(budgetMatch[1])
    data.budget = text.indexOf('万') > -1 ? val * 10000 : val
  }

  // 采购方式
  if (text.includes('公开招标')) data.purchaseMethod = '公开招标'
  else if (text.includes('竞争性谈判')) data.purchaseMethod = '竞争性谈判'
  else if (text.includes('竞争性磋商')) data.purchaseMethod = '竞争性磋商'
  else if (text.includes('询价')) data.purchaseMethod = '询价'
  else if (text.includes('单一来源')) data.purchaseMethod = '单一来源'

  // 地点
  const locationMatch = text.match(/(?:地点|建设地点|交货地点|服务地点)[^，。,]*([^，。,]{4,40})/)
  if (locationMatch) {
    data.location = locationMatch[1].trim()
    data.deliveryAddress = locationMatch[1].trim()
    data.serviceLocation = locationMatch[1].trim()
  }

  // 工期
  const durationMatch = text.match(/([0-9]+)\s*(?:日历天|天工期|工期)/)
  if (durationMatch) data.duration = parseInt(durationMatch[1])

  // 服务期限
  const periodMatch = text.match(/服务期限[^，。,]*([0-9]+)\s*年/)
  if (periodMatch) data.servicePeriod = periodMatch[1] + '年'

  // 质保期
  const warrantyMatch = text.match(/([0-9]+)\s*年(?:原厂)?质保/)
  if (warrantyMatch) data.warrantyPeriod = warrantyMatch[1] + '年原厂质保'

  // 投标保证金
  const depositMatch = text.match(/投标保证金[^0-9]*([0-9]+)\s*(?:万|元)/)
  if (depositMatch) {
    const val = parseInt(depositMatch[1])
    data.bidDeposit = text.indexOf('万') > -1 ? val * 10000 : val
  }

  // 付款方式
  if (text.includes('货到验收') && text.includes('一次性')) {
    data.paymentMethod = '货到验收合格后一次性支付'
  } else if (text.includes('按月') && text.includes('进度')) {
    data.paymentMethod = '分期付款：预付款+到货款+质保金'
  } else if (text.includes('按季度支付')) {
    data.paymentMethod = '按季度支付'
  }

  // 资质
  if (text.includes('建筑工程施工总承包一级')) data.qualification = '建筑工程施工总承包一级'
  else if (text.includes('建筑工程施工总承包二级')) data.qualification = '建筑工程施工总承包二级'

  // 项目经理
  const pmMatch = text.match(/项目经理[^，。,]*([^，。,]{4,30})/)
  if (pmMatch) data.pmRequirement = pmMatch[1].trim()

  // 评标办法
  if (text.includes('综合评估法')) data.evalMethod = '综合评估法'
  else if (text.includes('最低投标价')) data.evalMethod = '经评审的最低投标价法'

  // 联合体
  if (text.includes('不接受联合体')) data.acceptUnion = '不接受'
  else if (text.includes('接受联合体')) data.acceptUnion = '接受'

  // 质量标准
  if (text.includes('合格标准')) data.qualityStandard = '合格'
  else if (text.includes('优良')) data.qualityStandard = '优良'

  // 建筑面积
  const areaMatch = text.match(/建筑面积[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*(?:平方米|平米)/)
  if (areaMatch) data.buildingArea = areaMatch[1] + ' 平方米'

  // 结构形式
  if (text.includes('框架结构')) data.structureType = '框架结构'
  else if (text.includes('钢结构')) data.structureType = '钢结构'

  // 层数
  const floorMatch = text.match(/地上[^0-9]*([0-9]+)\s*层/)
  if (floorMatch) data.floorCount = parseInt(floorMatch[1])

  const underMatch = text.match(/地下[^0-9]*([0-9]+)\s*层/)
  if (underMatch) data.undergroundFloors = parseInt(underMatch[1])

  // 进口产品
  if (text.includes('不允许进口')) data.importAllowed = '不允许'
  else if (text.includes('允许进口')) data.importAllowed = '允许'

  // 厂家授权
  if (text.includes('厂家授权')) data.manufacturerAuth = '需要'

  // 团队人数
  const teamMatch = text.match(/(?:不少于|配备)[^0-9]*([0-9]+)\s*人/)
  if (teamMatch) data.teamSize = parseInt(teamMatch[1])

  // 响应时间
  const responseMatch = text.match(/([0-9]+)\s*小时响应/)
  if (responseMatch) data.responseTime = '7×24小时响应，' + responseMatch[1] + '小时到场'

  // 联系人
  const contactMatch = text.match(/联系人[：:]\s*([^，。,\s]+)/)
  if (contactMatch) data.contactPerson = contactMatch[1]

  const phoneMatch = text.match(/(?:电话|联系电话)[：:]\s*([0-9]{11})/)
  if (phoneMatch) data.contactPhone = phoneMatch[1]

  // 服务范围
  const scopeMatch = text.match(/服务内容包括([^。]+)/)
  if (scopeMatch) data.serviceScope = scopeMatch[1].trim()

  // 技术要求
  const techMatch = text.match(/(?:要求|技术参数)[^，。,]*([^。]{10,100})/)
  if (techMatch) data.techRequirement = techMatch[1].trim()

  // 交货期
  const deliveryMatch = text.match(/([0-9]{4}年[0-9]+月[0-9]+日)[前].*交付/)
  if (deliveryMatch) data.deliveryTime = deliveryMatch[1] + '前'

  // 采购清单（货物类）
  if (templateType === 'goods') {
    const items = []
    const itemPatterns = [
      /([0-9]+)\s*台([^\s，。,、]+服务器)/,
      /([0-9]+)\s*台([^\s，。,、]+交换机)/,
    ]
    itemPatterns.forEach(p => {
      const m = text.match(p)
      if (m) {
        items.push({ quantity: parseInt(m[1]), itemName: m[2], unit: '台' })
      }
    })
    if (items.length > 0) data.purchaseItems = items
  }

  return data
}

// 计算解析出的字段数量
export function countParsedFields(data) {
  return Object.keys(data).filter(k => data[k] !== '' && data[k] !== undefined && data[k] !== null).length
}
