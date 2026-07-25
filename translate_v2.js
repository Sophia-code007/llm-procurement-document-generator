const express = require('express');
const router = express.Router();
const https = require('https');

const SEPARATOR = '\n|||\n';
const MAX_CHARS = 3500;
const TIMEOUT = 45000;
const MAX_RETRIES = 2;
const CONCURRENT_REQUESTS = 5;
const DEEPSEEK_MODEL = 'deepseek-v4-flash';

const langNames = {
  en: '英语',
  ja: '日语',
  ko: '韩语',
  fr: '法语',
  de: '德语',
  es: '西班牙语'
};

function translateWithGoogle(text, targetLang) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`;
    
    https.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (Array.isArray(result) && Array.isArray(result[0])) {
            const translated = result[0].map(item => item[0]).join('');
            resolve({ translated, sourceLang: result[8] || 'auto', success: true });
          } else {
            reject(new Error('Invalid response format'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function translateWithDeepSeek(text, sourceLang, targetLang) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
  
  if (!DEEPSEEK_API_KEY) {
    return Promise.reject(new Error('DEEPSEEK_API_KEY not set'));
  }
  
  return new Promise((resolve, reject) => {
    const langName = langNames[targetLang] || targetLang;
    const systemPrompt = `你是一个专业翻译器。将输入文本翻译成${langName}。
要求：
1. 只返回翻译结果，不要任何解释、说明或额外内容
2. 输入文本用 "${SEPARATOR.trim()}" 分隔多段，输出也必须用完全相同的分隔符分隔
3. 保持原文的格式和结构
4. 不要添加任何前缀、后缀或标记`;

    const requestBody = JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.1,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]
    });

    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: TIMEOUT
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.choices && result.choices[0] && result.choices[0].message) {
            resolve({ 
              translated: result.choices[0].message.content.trim(), 
              success: true 
            });
          } else {
            reject(new Error(result.error?.message || 'Translation failed'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(requestBody);
    req.end();
  });
}

async function translateInBatches(text, targetLang, method = 'deepseek') {
  const chunks = [];
  const paragraphs = text.split(SEPARATOR);
  
  for (let i = 0; i < paragraphs.length; i += CONCURRENT_REQUESTS) {
    const batch = paragraphs.slice(i, i + CONCURRENT_REQUESTS);
    const batchText = batch.join(SEPARATOR);
    
    let result;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (method === 'google') {
          result = await translateWithGoogle(batchText, targetLang);
        } else {
          result = await translateWithDeepSeek(batchText, 'auto', targetLang);
        }
        break;
      } catch (error) {
        if (attempt === MAX_RETRIES) throw error;
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    
    chunks.push(result.translated);
  }
  
  return chunks.join(SEPARATOR);
}

router.post('/', async (req, res) => {
  try {
    const { text, targetLang, sourceLang = 'zh', method = 'deepseek' } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing text or target language' });
    }

    let result;
    if (text.length <= MAX_CHARS) {
      if (method === 'google') {
        result = await translateWithGoogle(text, targetLang);
      } else {
        result = await translateWithDeepSeek(text, sourceLang, targetLang);
      }
    } else {
      result = { translated: await translateInBatches(text, targetLang, method), success: true };
    }

    res.json({
      success: true,
      translatedText: result.translated,
      sourceLang: result.sourceLang || sourceLang,
      targetLang
    });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: '翻译失败，请检查API配置或使用Google翻译' 
    });
  }
});

module.exports = router;