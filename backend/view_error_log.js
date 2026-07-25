const fs = require('fs');
const logPath = 'C:\\Users\\30915\\AppData\\Local\\Temp\\trae-agent-toolhost\\jobs\\job-9840b9bfbc234470abd1e5a9806b64ae\\output.log';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const start = content.indexOf('docxtemplater error');
  if (start !== -1) {
    console.log(content.substring(start, start + 3000));
  }
} catch (e) {
  console.error('读取日志文件失败:', e);
}