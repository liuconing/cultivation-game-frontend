import axios from 'axios'

/** 專案 API 請求用 axios 實例（baseURL 來自 `VITE_API_BASE_URL`）。 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
})

export { axios, apiClient }
