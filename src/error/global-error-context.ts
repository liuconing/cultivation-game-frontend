import { createContext } from 'react'
import type { GlobalErrorNotice } from './global-error'

/** Global Error Provider 對應用程式公開的狀態與操作。 */
export interface GlobalErrorContextValue {
  /** 目前顯示的最新一筆全域錯誤。 */
  error: GlobalErrorNotice | null
  /** 將未知錯誤正規化並顯示為全域通知。 */
  handleGlobalError: (error: unknown) => void
  /** 關閉目前全域錯誤通知。 */
  clearGlobalError: () => void
}

/** 尚未掛載 Global Error Provider 時的空 context。 */
export const GlobalErrorContext =
  createContext<GlobalErrorContextValue | null>(null)
