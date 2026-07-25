import axios from './axios'

export const getRequirements = () => axios.get('/requirements')
export const getRequirementById = (id) => axios.get(`/requirements/${id}`)
export const createRequirement = (data) => axios.post('/requirements', data)
export const updateRequirement = (id, data) => axios.put(`/requirements/${id}`, data)
export const deleteRequirement = (id) => axios.delete(`/requirements/${id}`)