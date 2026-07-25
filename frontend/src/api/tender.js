import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截
request.interceptors.request.use(config => {
  return config
})

// 响应拦截：适配后端统一返回格式 {code, message, data}
request.interceptors.response.use(
  response => {
    const res = response.data
    // 业务成功，只返回data数据
    if (res.code === 200) {
      return res.data
    } else {
      // 业务失败，抛出错误信息
      return Promise.reject(res.message || '请求失败')
    }
  },
  error => {
    return Promise.reject(error.message || '网络错误')
  }
)

// 获取模板列表
export function getTemplates() {
  return request.get('/templates')
}

// AI自然语言解析接口（已修复：templateType -> template_type 和后端完全对齐，解决422、无法调用大模型问题）
export function aiParse(text, templateType) {
  return request.post('/ai/parse', { 
    text, 
    template_type: templateType 
  })
}

// 创建文档异步生成任务（新版无项目流程）
export function createGenerateTask(data) {
  return request.post('/tender-documents/async-generate', data)
}

// 查询任务进度状态
export function getTaskStatus(taskId) {
  return request.get(`/tender-documents/${taskId}`)
}

// 下载生成完成的Word文档
export function downloadDocument(taskId) {
  window.open(`/api/tender-documents/${taskId}/download`, '_blank')
}

export default request