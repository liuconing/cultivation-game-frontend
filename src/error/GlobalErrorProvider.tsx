import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { getApiClientError } from '@/lib/axios'
import {
  GlobalErrorContext,
  type GlobalErrorContextValue,
} from './global-error-context'
import {
  createGlobalErrorNotice,
  type GlobalErrorNotice as GlobalErrorNoticeData,
} from './global-error'
import { GlobalErrorNotice } from './GlobalErrorNotice'

/**
 * 提供全站最新一筆 API 錯誤與非阻塞通知。
 *
 * @param props - Provider 包覆的 React 子節點。
 */
export function GlobalErrorProvider({
  children,
}: PropsWithChildren) {
  const [error, setError] =
    useState<GlobalErrorNoticeData | null>(null)

  /** 關閉目前顯示的全域錯誤。 */
  const clearGlobalError = useCallback((): void => {
    setError(null)
  }, [])

  /**
   * 將未知錯誤正規化後更新全域錯誤通知。
   *
   * @param unknownError - Query 或 Mutation 回傳的未知錯誤。
   */
  const handleGlobalError = useCallback(
    (unknownError: unknown): void => {
      const notice = createGlobalErrorNotice(
        getApiClientError(unknownError),
      )

      if (notice) {
        setError(notice)
      }
    },
    [],
  )

  const value = useMemo<GlobalErrorContextValue>(
    () => ({
      error,
      handleGlobalError,
      clearGlobalError,
    }),
    [clearGlobalError, error, handleGlobalError],
  )

  return (
    <GlobalErrorContext.Provider value={value}>
      {children}
      {error ? (
        <GlobalErrorNotice
          error={error}
          onClose={clearGlobalError}
        />
      ) : null}
    </GlobalErrorContext.Provider>
  )
}
