import type { ApiClientError } from '../lib/axios/index.ts'

/** 全域錯誤通知顯示的標準資料。 */
export interface GlobalErrorNotice {
  /** 錯誤通知標題。 */
  title: string
  /** 提供給使用者的共通錯誤訊息。 */
  message: string
  /** 後端穩定錯誤碼；非 API 錯誤時為 null。 */
  code: string | null
  /** HTTP status；未收到伺服器回應時為 null。 */
  status: number | null
}

/**
 * 將 API 錯誤轉為全站可安全顯示的共通錯誤。
 *
 * @param error - 已標準化的 API 錯誤資訊。
 * @returns 全域通知；401 交由 session 處理時回傳 null。
 */
export const createGlobalErrorNotice = (
  error: ApiClientError,
): GlobalErrorNotice | null => {
  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    return null
  }

  if (error.status === null) {
    return {
      title: '連線失敗',
      message: '無法連線至伺服器，請確認網路後再試。',
      code: error.code,
      status: error.status,
    }
  }

  if (error.status === 403) {
    return {
      title: '沒有操作權限',
      message: '目前帳號無法執行此操作。',
      code: error.code,
      status: error.status,
    }
  }

  if (error.status === 429) {
    return {
      title: '請求過於頻繁',
      message: '操作次數過多，請稍候再試。',
      code: error.code,
      status: error.status,
    }
  }

  if (error.status >= 500) {
    return {
      title: '系統暫時無法使用',
      message: '服務目前發生異常，請稍後再試。',
      code: error.code,
      status: error.status,
    }
  }

  return {
    title: '操作未完成',
    message: '目前無法完成此操作，請檢查內容後再試。',
    code: error.code,
    status: error.status,
  }
}
