const express = require('express');
const router = express.Router();
const { readDB } = require('../db');

// 获取所有供应商
router.get('/', (req, res) => {
  try {
    const db = readDB();
    res.json(db.suppliers);
  } catch (error) {
    res.status(500).json({ message: '获取供应商失败', error: error.message });
  }
});

// 按类型获取供应商
router.get('/category/:category', (req, res) => {
  try {
    const db = readDB();
    const suppliers = db.suppliers.filter(s => s.category === req.params.category);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: '获取供应商失败', error: error.message });
  }
});

module.exports = router;