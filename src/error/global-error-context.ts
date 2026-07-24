import { createContext } from 'react'
import type { GlobalErrorNotice } from './global-error'

/** 成功通知的顯示設定。 */
export interface SuccessNotificationOptions {
  /** 通知標題；未指定時使用「操作成功」。 */
  title?: string
  /** 自動關閉秒數；未指定時為 2 秒，設為 0 時不自動關閉。 */
  autoCloseSeconds?: number
}

/** Global Error Provider 對應用程式公開的狀態與操作。 */
export interface GlobalErrorContextValue {
  /** 目前顯示的最新一筆全域錯誤。 */
  error: GlobalErrorNotice | null
  /** 將未知錯誤正規化並顯示為全域通知。 */
  handleGlobalError: (error: unknown) => void
  /** 關閉目前全域錯誤通知。 */
  clearGlobalError: () => void
  /** 顯示一筆全站成功通知，新的通知會取代目前通知。 */
  notifySuccess: (
    message: string,
    options?: SuccessNotificationOptions,
  ) => void
}

/** 尚未掛載 Global Error Provider 時的空 context。 */
export const GlobalErrorContext =
  createContext<GlobalErrorContextValue | null>(null)
