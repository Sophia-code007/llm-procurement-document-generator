import axios from './axios'

export const getDocuments = () => axios.get('/documents')
export const getDocumentById = (id) => axios.get(`/documents/${id}`)
export const createDocument = (data) => axios.post('/documents', data)
export const updateDocument = (id, data) => axios.put(`/documents/${id}`, data)
export const deleteDocument = (id) => axios.delete(`/documents/${id}`)

export const downloadDocument = (id) => axios.get(`/documents/download/${id}`, { responseType: 'blob' })

export const generateDocument = (data) => axios.post('/documents/generate', data, { responseType: 'blob' })

export const generateFromTemplate = (data, options = {}) => axios.post('/documents/generate-from-template', data, options)

export const generateTranslation = (data) => axios.post('/documents/generate-translation', data, { responseType: 'blob' })

export function saveBlobAs(blob, fileName) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(function() { window.URL.revokeObjectURL(url) }, 100)
}

