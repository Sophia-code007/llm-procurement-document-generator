const express = require('express');
const router = express.Router();
const { readDB } = require('../db');

// 获取所有模板
router.get('/', (req, res) => {
  try {
    const db = readDB();
    res.json(db.templates);
  } catch (error) {
    res.status(500).json({ message: '获取模板失败', error: error.message });
  }
});

// 按类型获取模板
router.get('/category/:category', (req, res) => {
  try {
    const db = readDB();
    const templates = db.templates.filter(t => t.category === req.params.category);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: '获取模板失败', error: error.message });
  }
});

module.exports = router;