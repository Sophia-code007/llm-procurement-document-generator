const express = require('express');
const router = express.Router();
const { readDB, verifyToken } = require('../db');

// 获取当前用户信息
router.get('/me', (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: '未提供认证令牌' });
    
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: '无效的认证令牌' });

    const db = readDB();
    const user = db.users.find(u => u._id === decoded.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
});

module.exports = router;