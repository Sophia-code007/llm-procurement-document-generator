const express = require('express');
const router = express.Router();
const https = require('https');

const MAX_CHARS_PER_BATCH = 3000;
const TIMEOUT = 40000;
const MAX_RETRIES = 2;
const CONCURRENT_REQUESTS = 8;
const DEEPSEEK_MODEL = 'deepseek-v4-flash';

const langNames = {
  en: '英语',
  ja: '日语',
  ko: '韩语',
  fr: '法语',
  de: '德语',
  es: '西班牙语'
};

function translateWithDeepSeek(text, targetLang) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
  
  if (!DEEPSEEK_API_KEY) {
    return Promise.reject(new Error('DEEPSEEK_API_KEY not set'));
  }
  
  return new Promise((resolve, reject) => {
    const langName = langNames[targetLang] || targetLang;
    const systemPrompt = `你是一个专业翻译器。将输入文本翻译成${langName}。
要求：
1. 只返回翻译结果，不要任何解释、说明或额外内容
2. 保持原文的格式和结构
3. 不要添加任何前缀、后缀或标记`;

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

function splitTextIntoBatches(text, maxChars) {
  const batches = [];
  const paragraphs = text.split('\n');
  let currentBatch = '';
  
  for (const paragraph of paragraphs) {
    if (currentBatch.length + paragraph.length + 1 <= maxChars) {
      currentBatch += (currentBatch ? '\n' : '') + paragraph;
    } else {
      if (currentBatch) batches.push(currentBatch);
      currentBatch = paragraph;
    }
  }
  
  if (currentBatch) batches.push(currentBatch);
  return batches;
}

async function translateInBatches(text, targetLang) {
  const batches = splitTextIntoBatches(text, MAX_CHARS_PER_BATCH);
  const results = [];
  
  for (let i = 0; i < batches.length; i += CONCURRENT_REQUESTS) {
    const batchGroup = batches.slice(i, i + CONCURRENT_REQUESTS);
    const promises = batchGroup.map(batch => {
      let attempts = 0;
      const tryTranslate = async () => {
        try {
          const result = await translateWithDeepSeek(batch, targetLang);
          return result.translated;
        } catch (error) {
          attempts++;
          if (attempts <= MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1000 * attempts));
            return tryTranslate();
          }
          throw error;
        }
      };
      return tryTranslate();
    });
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }
  
  return results.join('\n');
}

router.post('/', async (req, res) => {
  try {
    const { text, targetLang, sourceLang = 'zh' } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing text or target language' });
    }

    let translatedText;
    if (text.length <= MAX_CHARS_PER_BATCH) {
      const result = await translateWithDeepSeek(text, targetLang);
      translatedText = result.translated;
    } else {
      translatedText = await translateInBatches(text, targetLang);
    }

    res.json({
      success: true,
      translatedText,
      sourceLang,
      targetLang
    });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: '翻译失败，请检查API配置' 
    });
  }
});

module.exports = router;