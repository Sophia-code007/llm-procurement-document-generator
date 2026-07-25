const express = require('express');
const router = express.Router();
const { readDB, writeDB, generateId, verifyToken } = require('../db');

// 创建需求
router.post('/', (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const decoded = verifyToken(token);
    
    const requirement = {
      _id: generateId(),
      ...req.body,
      createdBy: decoded ? decoded.id : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const db = readDB();
    db.requirements.push(requirement);
    writeDB(db);

    res.status(201).json(requirement);
  } catch (error) {
    res.status(500).json({ message: '创建需求失败', error: error.message });
  }
});

// 获取所有需求
router.get('/', (req, res) => {
  try {
    const db = readDB();
    res.json(db.requirements);
  } catch (error) {
    res.status(500).json({ message: '获取需求失败', error: error.message });
  }
});

module.exports = router;