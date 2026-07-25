import axios from './axios'

export const login = (data) => axios.post('/auth/login', data)
export const register = (data) => axios.post('/auth/register', data)
export const getCurrentUser = () => axios.get('/users/me')