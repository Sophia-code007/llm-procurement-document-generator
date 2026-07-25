const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} = require('docx');
const { readDB, writeDB, generateId, verifyToken } = require('../db');

const templateMapping = {
  'template1': '货物类_标准化模板(2).docx',
  'template2': '工程类_标准化模板(2).docx',
  'template3': '服务类_标准化模板(2).docx',
  'template4': '货物类_采购合同_动态模板.docx',
  'template5': '工程类_采购合同_动态模板 (1)(1).docx',
  'template6': '服务类_采购合同_动态模板.docx'
};

function getTemplateFilePath(templateId) {
  const fileName = templateMapping[templateId];
  if (!fileName) return null;
  const templateType = templateId.startsWith('template') && parseInt(templateId.replace('template', '')) <= 3 ? 'bidding' : 'contract';
  return path.join(__dirname, '../templates', templateType, fileName);
}

function mapFields(data) {
  const result = Object.assign({}, data);

  const aliasMap = {
    'projectName': ['projectName', 'purchaseProjectName'],
    'projectCode': ['projectCode'],
    'budget': ['budget', 'maxPriceAmount', 'totalBudgetAmount', 'ceilingPrice'],
    'contactPerson': ['contactPerson', 'bidderName', 'tendererName', 'purchaseContactPerson'],
    'contactPhone': ['contactPhone', 'purchaseContactPhone'],
    'deliveryDate': ['deliveryDate', 'docSaleStartDate', 'bidStartDate', 'planStartDate'],
    'deliveryLocation': ['deliveryLocation', 'constructionLocation', 'serviceLocation', 'submitLocation', 'bidOpenLocation', 'docPurchaseLocation'],
    'technicalRequirements': ['technicalRequirements', 'techRequirement', 'serviceContent'],
    'qualificationRequirements': ['qualificationRequirements', 'qualificationRequirement'],
    'evaluationMethod': ['evaluationMethod'],
    'fundSource': ['fundSource'],
    'servicePeriod': ['servicePeriod'],
    'paymentTerms': ['paymentTerms'],
    'ceilingPrice': ['ceilingPrice', 'budget', 'maxPriceAmount'],
    'bidBondAmount': ['bidBondAmount'],
    'performanceBondRatio': ['performanceBondRatio'],
    'bidValidPeriod': ['bidValidPeriod'],
    'docCopyCount': ['docCopyCount'],
    'docPrice': ['docPrice'],
    'province': ['province'],
    'agencyName': ['agencyName'],
    'tendererName': ['tendererName'],
    'issueYear': ['issueYear'],
    'issueMonth': ['issueMonth'],
    'issueDay': ['issueDay'],
    'docSaleEndDate': ['docSaleEndDate'],
    'bidEndDate': ['bidEndDate'],
    'planEndDate': ['planEndDate'],
    'submitDeadlineDate': ['submitDeadlineDate'],
    'submitDeadlineTime': ['submitDeadlineTime'],
    'bidOpenDate': ['bidOpenDate'],
    'bidOpenTime': ['bidOpenTime'],
    'agencyAddress': ['agencyAddress'],
    'docPurchaseLocation': ['docPurchaseLocation'],
    'allowImportGoods': ['allowImportGoods'],
    'setMaxPriceLimit': ['setMaxPriceLimit'],
    'quoteScope': ['quoteScope'],
    'serviceStandards': ['serviceStandards']
  };

  for (const [target, sources] of Object.entries(aliasMap)) {
    if (!result[target]) {
      for (const source of sources) {
        if (data[source]) {
          result[target] = data[source];
          break;
        }
      }
    }
  }

  if (!result.agencyName && result.tendererName) {
    result.agencyName = result.tendererName;
  }

  if (data.deliveryDate) {
    const date = new Date(data.deliveryDate);
    result.issueYear = date.getFullYear().toString();
    result.issueMonth = (date.getMonth() + 1).toString();
    result.issueDay = date.getDate().toString();

    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 30);
    result.docSaleEndDate = endDate.toISOString().split('T')[0];
    result.bidEndDate = result.docSaleEndDate;
    result.planEndDate = result.docSaleEndDate;
    result.submitDeadlineDate = result.docSaleEndDate;
    result.bidOpenDate = result.docSaleEndDate;
  }

  if (!result.submitDeadlineDate && result.docSaleEndDate) {
    result.submitDeadlineDate = result.docSaleEndDate;
  }

  if (!result.bidOpenDate && result.submitDeadlineDate) {
    result.bidOpenDate = result.submitDeadlineDate;
  }

  result.submitDeadlineTime = result.submitDeadlineTime || '10:00';
  result.bidOpenTime = result.bidOpenTime || '10:30';
  result.docPrice = result.docPrice || '免费';
  result.bidBondAmount = result.bidBondAmount || (result.ceilingPrice ? (parseFloat(result.ceilingPrice) * 0.02).toFixed(2) : '2.00');

  const defaults = {
    'fundSource': '财政资金',
    'allowImportGoods': '是',
    'setMaxPriceLimit': '否',
    'quoteScope': '全部',
    'evaluationMethod': '综合评分法',
    'paymentTerms': '一次性付清',
    'servicePeriod': '12个月',
    'serviceStandards': '符合国家相关行业标准',
    'bidValidPeriod': '90天',
    'docCopyCount': '1份',
    'docPrice': '免费',
    'performanceBondRatio': '10',
    'province': '湖北省',
    'agencyAddress': '请填写代理机构地址',
    'docPurchaseLocation': '请填写购买地点',
    'purchaseOrgName': '',
    'agencyName': '',
    'projectCode': ''
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (!result[key]) result[key] = value;
  }

  return result;
}

async function generateFromTemplate(templateId, data) {
  const filePath = getTemplateFilePath(templateId);
  if (!filePath) {
    throw new Error('模板文件不存在');
  }

  const buffer = fs.readFileSync(filePath);

  try {
    const result = await mammoth.convertToHtml({ buffer });
    let html = result.value;

    const mappedData = mapFields(data);

    for (const key of Object.keys(mappedData)) {
      if (mappedData[key]) {
        const placeholder = '{{' + key + '}}';
        html = html.replace(new RegExp(placeholder, 'g'), mappedData[key]);
      }
    }

    const hardcodedReplacements = {
      '福建农林大学': mappedData.purchaseOrgName || mappedData.tendererName || '',
      '福建省天海招标有限公司': mappedData.agencyName || '',
      '色谱仪': mappedData.procurementContent || mappedData.itemName || '',
      'CG2025-001': mappedData.projectCode || '',
      '350001': '',
      '13800138000': mappedData.contactPhone || '',
      '0591-87878463': mappedData.contactPhone || '',
      '张经理': mappedData.contactPerson || '',
      'FJTHZB@163.com': '',
      '福州市鼓楼区': mappedData.deliveryLocation || '',
      '福建省': mappedData.province || ''
    };

    for (const [oldText, newText] of Object.entries(hardcodedReplacements)) {
      html = html.replace(new RegExp(oldText, 'g'), newText || '');
    }

    html = html.replace(/\{\{[^}]+\}\}/g, '');

    return { html, docxBuffer: buffer, mappedData };
  } catch (error) {
    console.error('模板转换错误:', error);
    throw error;
  }
}

function buildDocFromHTML(html) {
  if (!html) return [];
  const blocks = [];
  const tagRegex = /<(h1|h2|h3|p|table)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const inner = match[2];
    if (tag === 'table') {
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
      const rows = [];
      let rowMatch;
      while ((rowMatch = rowRegex.exec(inner)) !== null) {
        const cells = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          cells.push(stripTags(cellMatch[1]));
        }
        if (cells.length) rows.push(cells);
      }
      if (rows.length) blocks.push(makeTable(rows));
    } else {
      const text = stripTags(inner);
      if (!text) continue;
      if (tag === 'h1') {
        blocks.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 }, children: [new TextRun({ text: text, bold: true, size: 36, font: 'SimHei' })] }));
      } else if (tag === 'h2') {
        blocks.push(makeHeading(text, HeadingLevel.HEADING_2));
      } else if (tag === 'h3') {
        blocks.push(makeHeading(text, HeadingLevel.HEADING_3));
      } else {
        blocks.push(makePara(text));
      }
    }
  }
  if (blocks.length === 0) {
    const text = stripTags(html);
    if (text) blocks.push(makePara(text));
  }
  return blocks;
}

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
};

function makePara(text, opts) {
  opts = opts || {};
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 60, after: opts.after || 60, line: 360 },
    children: [new TextRun({ text: text || '', size: opts.size || 22, bold: !!opts.bold, font: 'SimSun' })]
  });
}

function makeHeading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: text || '', bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : (level === HeadingLevel.HEADING_2 ? 28 : 24), font: 'SimHei' })]
  });
}

function makeTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: (rows || []).map(function(r, i) {
      return new TableRow({
        children: r.map(function(c) {
          return new TableCell({
            borders: cellBorders,
            shading: i === 0 ? { fill: 'F2F3F5' } : undefined,
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [makePara(c, { size: 20 })]
          });
        })
      });
    })
  });
}

function stripTags(s) {
  if (!s) return '';
  return s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}

async function packAndSend(res, fileName, children) {
  const doc = new Document({
    creator: '采购文件智能生成系统',
    title: fileName,
    styles: { default: { document: { run: { font: 'SimSun' } } } },
    sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }]
  });
  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '.docx"; filename*=UTF-8\'\'' + encodeURIComponent(fileName + '.docx'));
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}

router.post('/', (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const decoded = verifyToken(token);
    const document = {
      _id: generateId(),
      ...req.body,
      createdBy: decoded ? decoded.id : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const db = readDB();
    db.documents.push(document);
    writeDB(db);
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: '创建文件失败', error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const db = readDB();
    res.json(db.documents);
  } catch (error) {
    res.status(500).json({ message: '获取文件失败', error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = readDB();
    const doc = db.documents.find(d => d._id === req.params.id);
    if (!doc) return res.status(404).json({ message: '文件不存在' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: '获取文件失败', error: error.message });
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const db = readDB();
    const doc = db.documents.find(d => d._id === req.params.id);
    if (!doc) return res.status(404).json({ message: '文件不存在' });
    const children = buildDocFromHTML(doc.content || '<p>' + (doc.name || '采购文件') + '</p>');
    await packAndSend(res, doc.name || '采购文件', children);
  } catch (error) {
    console.error('download error:', error);
    res.status(500).json({ message: '下载文件失败', error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { fileName, type, title, sections, html } = req.body;
    const name = fileName || title || '采购文件';
    let children;
    if (html) {
      children = buildDocFromHTML(html);
    } else {
      children = buildDocFromSections(title || name, sections || []);
    }
    try {
      const db = readDB();
      db.documents.push({
        _id: generateId(),
        name: name,
        type: type || 'bid',
        content: html || JSON.stringify(sections || []),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      writeDB(db);
    } catch (e) {
      console.error('保存文档记录失败:', e);
    }
    await packAndSend(res, name, children);
  } catch (error) {
    console.error('generate error:', error);
    res.status(500).json({ message: '生成文件失败', error: error.message });
  }
});

router.post('/generate-from-template', async (req, res) => {
  try {
    const { templateId, data, outputType, fileName } = req.body;

    const db = readDB();
    const template = db.templates.find(t => t._id === templateId);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }

    const result = await generateFromTemplate(templateId, data || {});
    const html = result.html;
    const docName = fileName || data?.projectName || template.name;

    try {
      db.documents.push({
        _id: generateId(),
        name: docName,
        type: template.type,
        content: html,
        templateId: template._id,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      writeDB(db);
    } catch (e) {
      console.error('保存文档记录失败:', e);
    }

    if (outputType === 'word') {
      try {
        const PizZip = require('pizzip');

        const zip = new PizZip(result.docxBuffer);
        const xml = zip.files['word/document.xml'].asText();

        let fixedXml = xml;

        const placeholderNames = Object.keys(result.mappedData);

        placeholderNames.forEach(function(name) {
          if (result.mappedData[name]) {
            const searchPattern = new RegExp('\\{\\{[^}]*?' + name + '[^}]*?\\}\\}', 'g');
            const matches = fixedXml.match(searchPattern);

            if (matches) {
              matches.forEach(function(match) {
                const tPattern = /<w:t>([^<]*)<\/w:t>/g;
                let textParts = [];
                let tMatch;
                while ((tMatch = tPattern.exec(match)) !== null) {
                  textParts.push(tMatch[1]);
                }

                const cleanPlaceholder = '{{' + name + '}}';
                const isSimple = textParts.length === 1 && textParts[0] === cleanPlaceholder;

                if (isSimple) {
                  fixedXml = fixedXml.replace(match, result.mappedData[name]);
                } else {
                  let tempXml = match;
                  const dataValue = result.mappedData[name];
                  const firstT = tempXml.indexOf('<w:t>');
                  const lastTClose = tempXml.lastIndexOf('</w:t>');

                  if (firstT !== -1 && lastTClose !== -1) {
                    const beforeFirstT = tempXml.substring(0, firstT + 5);
                    const afterLastTClose = tempXml.substring(lastTClose + 6);
                    tempXml = beforeFirstT + dataValue + afterLastTClose;
                    fixedXml = fixedXml.replace(match, tempXml);
                  } else {
                    fixedXml = fixedXml.replace(match, dataValue);
                  }
                }
              });
            }
          }
        });

        fixedXml = fixedXml.replace(/\{\{[^}]+\}\}/g, '');

        zip.file('word/document.xml', fixedXml);

        const outputBuffer = zip.generate({ type: 'nodebuffer' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(docName) + '.docx"; filename*=UTF-8\'\'' + encodeURIComponent(docName + '.docx'));
        res.setHeader('Content-Length', outputBuffer.length);
        res.send(outputBuffer);
      } catch (error) {
        console.error('Word generation error:', error);
        const children = buildDocFromHTML(html);
        await packAndSend(res, docName, children);
      }
    } else if (outputType === 'pdf') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline');
      res.send(html);
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    }
  } catch (error) {
    console.error('generate-from-template error:', error);
    res.status(500).json({ message: '生成文件失败', error: error.message });
  }
});

router.post('/generate-translation', async (req, res) => {
  try {
    const { fileName, targetLang, content } = req.body;
    const name = fileName || ('翻译结果_' + (targetLang || 'en'));
    const lines = String(content || '').split('\n').filter(function(l) { return l.trim(); });
    const children = [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 }, children: [new TextRun({ text: name, bold: true, size: 36, font: 'SimHei' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [new TextRun({ text: '目标语言：' + (targetLang || 'en').toUpperCase(), size: 22, color: '86909C' })] })
    ];
    lines.forEach(function(line) { children.push(makePara(line)); });
    const doc = new Document({
      creator: '采购文件智能生成系统',
      title: name,
      styles: { default: { document: { run: { font: 'SimSun' } } } },
      sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }]
    });
    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(name) + '.docx"; filename*=UTF-8\'\'' + encodeURIComponent(name + '.docx'));
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('translation error:', error);
    res.status(500).json({ message: '生成翻译文件失败', error: error.message });
  }
});

module.exports = router;
