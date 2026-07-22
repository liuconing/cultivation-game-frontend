import axios from 'axios'
import { useAuthStore } from '@/stores'

/** 專案 API 請求用 axios 實例（baseURL 來自 `VITE_API_BASE_URL`）。 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { axios, apiClient }
