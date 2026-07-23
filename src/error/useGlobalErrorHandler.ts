import { useContext } from 'react'
import {
  GlobalErrorContext,
  type GlobalErrorContextValue,
} from './global-error-context'

/**
 * 取得全站錯誤狀態與顯示、關閉操作。
 *
 * @returns Global Error Provider 公開的狀態與操作。
 */
export const useGlobalErrorHandler =
  (): GlobalErrorContextValue => {
    const globalError = useContext(GlobalErrorContext)

    if (!globalError) {
      throw new Error(
        'useGlobalErrorHandler 必須在 GlobalErrorProvider 內使用',
      )
    }

    return globalError
  }
