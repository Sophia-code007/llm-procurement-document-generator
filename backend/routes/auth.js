const express = require('express');
const router = express.Router();
const { readDB, writeDB, generateId, hashPassword, verifyPassword, generateToken } = require('../db');

// 用户注册
router.post('/register', (req, res) => {
  try {
    const { userName, username, email, password, companyName, company, department, phone } = req.body;
    
    const userEmail = email || username;
    const userCompany = company || companyName || '';
    
    if (!userName || !userEmail || !password) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    const db = readDB();
    
    if (db.users.find(u => u.email === userEmail)) {
      return res.status(400).json({ message: '该账号已注册' });
    }

    const newUser = {
      _id: generateId(),
      userName,
      email: userEmail,
      password: hashPassword(password),
      company: userCompany,
      department: department || '',
      phone: phone || '',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: '注册成功',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

// 用户登录
router.post('/login', (req, res) => {
  try {
    const { email, password, username } = req.body;
    const loginAccount = email || username;
    
    if (!loginAccount || !password) {
      return res.status(400).json({ message: '请填写账号和密码' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === loginAccount || u.userName === loginAccount);
    
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: '账号或密码错误' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: '登录成功',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

module.exports = router;
