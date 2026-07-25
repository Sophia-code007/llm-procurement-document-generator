const express = require('express');
const router = express.Router();
const { readDB, writeDB, generateId } = require('../db');
const { analyzeRisks } = require('../risk-engine');

// 获取所有风险
router.get('/', (req, res) => {
  try {
    const db = readDB();
    res.json(db.risks || []);
  } catch (error) {
    res.status(500).json({ message: '获取风险列表失败', error: error.message });
  }
});

// 按文件获取风险
router.get('/document/:docId', (req, res) => {
  try {
    const db = readDB();
    const risks = (db.risks || []).filter(r => r.documentId === req.params.docId);
    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: '获取风险失败', error: error.message });
  }
});

// 智能风险分析接口
router.post('/analyze', (req, res) => {
  try {
    const { docType, data, content, docId } = req.body;
    if (!docType || !data) {
      return res.status(400).json({ message: '缺少必要参数：docType 和 data' });
    }

    const result = analyzeRisks({ docType, data, content, docId });

    // 将结果保存到数据库
    const db = readDB();
    if (!db.risks) db.risks = [];

    // 删除该文档旧的风险记录
    db.risks = db.risks.filter(r => r.documentId !== docId);

    // 添加新的风险记录
    result.risks.forEach(risk => {
      db.risks.push({
        _id: generateId(),
        ...risk,
        documentId: docId || 'temp-' + Date.now()
      });
    });
    writeDB(db);

    res.json(result);
  } catch (error) {
    console.error('风险分析失败', error);
    res.status(500).json({ message: '风险分析失败', error: error.message });
  }
});

// 更新风险状态
router.put('/:id', (req, res) => {
  try {
    const db = readDB();
    const idx = db.risks.findIndex(r => r._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: '风险不存在' });

    db.risks[idx] = { ...db.risks[idx], ...req.body, updatedAt: new Date().toISOString() };
    writeDB(db);
    res.json(db.risks[idx]);
  } catch (error) {
    res.status(500).json({ message: '更新风险失败', error: error.message });
  }
});

// 批量更新风险状态
router.put('/batch/resolve', (req, res) => {
  try {
    const { ids, resolved } = req.body;
    const db = readDB();
    let count = 0;
    ids.forEach(id => {
      const idx = db.risks.findIndex(r => r._id === id);
      if (idx !== -1) {
        db.risks[idx].resolved = resolved;
        db.risks[idx].updatedAt = new Date().toISOString();
        count++;
      }
    });
    writeDB(db);
    res.json({ message: `已更新${count}条风险状态`, count });
  } catch (error) {
    res.status(500).json({ message: '批量更新失败', error: error.message });
  }
});

module.exports = router;
