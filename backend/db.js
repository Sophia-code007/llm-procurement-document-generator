const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');
let memoryDB = null;
let useMemory = false;

function initialDB() {
  return { users: [], templates: [], requirements: [], documents: [], risks: [], suppliers: [] };
}

function readDB() {
  if (useMemory && memoryDB) {
    return JSON.parse(JSON.stringify(memoryDB));
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log('readDB file failed, using memory:', err.message);
    useMemory = true;
    if (!memoryDB) memoryDB = initialDB();
    return JSON.parse(JSON.stringify(memoryDB));
  }
}

function writeDB(db) {
  if (useMemory) {
    memoryDB = JSON.parse(JSON.stringify(db));
    return;
  }
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.log('writeDB file failed, switching to memory:', err.message);
    useMemory = true;
    memoryDB = JSON.parse(JSON.stringify(db));
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function hashPassword(password) {
  return require('crypto').createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    exp: Date.now() + 24 * 60 * 60 * 1000
  };
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  return base64 + '.' + require('crypto').createHmac('sha256', 'secret-key').update(base64).digest('hex');
}

function verifyToken(token) {
  try {
    const [payload, signature] = token.split('.');
    const expectedSig = require('crypto').createHmac('sha256', 'secret-key').update(payload).digest('hex');
    if (signature !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (Date.now() > data.exp) return null;
    return data;
  } catch (err) {
    return null;
  }
}

module.exports = {
  readDB,
  writeDB,
  generateId,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};
