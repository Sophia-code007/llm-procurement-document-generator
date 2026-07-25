require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/documents', require('./routes/documents'));
const riskRouter = require('./routes/risk');
console.log('Loaded risk routes:', riskRouter.stack ? riskRouter.stack.map(r => ({ method: r.method, path: r.path })) : 'no stack');
app.use('/api/risk', riskRouter);
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/translate', require('./routes/translate'));


app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '采购文件智能生成系统 API 服务正在运行', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});