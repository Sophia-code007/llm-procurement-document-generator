import axios from './axios'

export const getTemplates = () => axios.get('/templates')
export const getTemplatesByCategory = (category) => axios.get(`/templates/category/${category}`)
export const getTemplateById = (id) => axios.get(`/templates/${id}`)
export const createTemplate = (data) => axios.post('/templates', data)
export const updateTemplate = (id, data) => axios.put(`/templates/${id}`, data)
export const deleteTemplate = (id) => axios.delete(`/templates/${id}`)