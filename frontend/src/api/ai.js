import axios from './axios'

export const parseRequirement = (text, category) => {
  return axios.post('/ai/parse-requirement', { text, category }, { timeout: 30000 })
}

export const parseContract = (text, category) => {
  return axios.post('/ai/parse-contract', { text, category }, { timeout: 30000 })
}