import axios from './axios'

export const getSuppliers = () => axios.get('/suppliers')
export const getSuppliersByCategory = (category) => axios.get(`/suppliers/category/${category}`)
export const createSupplier = (data) => axios.post('/suppliers', data)