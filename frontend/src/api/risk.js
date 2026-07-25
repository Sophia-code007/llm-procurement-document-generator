import axios from './axios'

export const getRisksByDocument = (documentId) => axios.get(`/risk/document/${documentId}`)
export const createRisk = (data) => axios.post('/risk', data)
export const updateRisk = (id, data) => axios.put(`/risk/${id}`, data)
export const deleteRisk = (id) => axios.delete(`/risk/${id}`)
export const analyzeRisk = (data) => axios.post('/risk/analyze', data)
export const getAllRisks = () => axios.get('/risk')