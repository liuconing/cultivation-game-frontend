import axios, { type AxiosError } from 'axios'
import type { ApiFailure } from '@/domain/repository'
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

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      useAuthStore.getState().token
    ) {
      useAuthStore.getState().clearAuth({ reason: 'expired' })
    }

    return Promise.reject(error)
  },
)

/** API 請求失敗後提供給畫面判斷的標準化資訊。 */
export interface ApiClientError {
  /** HTTP status；尚未取得伺服器回應時為 null。 */
  status: number | null
  /** 後端失敗 envelope 的穩定錯誤碼。 */
  code: string | null
  /** 可顯示或記錄的錯誤訊息。 */
  message: string
}

/**
 * 將未知錯誤轉成畫面可安全使用的 API 錯誤資訊。
 *
 * @param error - Axios 或其他執行階段錯誤。
 * @returns 標準化後的 HTTP 狀態、錯誤碼與訊息。
 */
export const getApiClientError = (error: unknown): ApiClientError => {
  if (axios.isAxiosError<ApiFailure>(error)) {
    const axiosError = error as AxiosError<ApiFailure>
    return {
      status: axiosError.response?.status ?? null,
      code: axiosError.response?.data?.code ?? null,
      message:
        axiosError.response?.data?.message ??
        (axiosError.response
          ? '伺服器暫時無法處理請求。'
          : '無法連線至伺服器，請稍後重試。'),
    }
  }

  return {
    status: null,
    code: null,
    message:
      error instanceof Error ? error.message : '發生未預期的錯誤。',
  }
}

export { axios, apiClient }
