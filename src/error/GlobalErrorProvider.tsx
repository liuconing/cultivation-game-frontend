import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { getApiClientError } from '@/lib/axios'
import {
  GlobalErrorContext,
  type GlobalErrorContextValue,
  type SuccessNotificationOptions,
} from './global-error-context'
import {
  createGlobalErrorNotice,
  type GlobalErrorNotice as GlobalErrorNoticeData,
} from './global-error'
import { GlobalErrorNotice } from './GlobalErrorNotice'
import { GlobalSuccessNotice } from './GlobalSuccessNotice'

/** 成功通知預設顯示兩秒。 */
const DEFAULT_SUCCESS_AUTO_CLOSE_SECONDS = 2

/** Provider 目前顯示的單筆通知。 */
type GlobalNotice =
  | {
      /** 通知種類。 */
      kind: 'error'
      /** 正規化後的錯誤內容。 */
      error: GlobalErrorNoticeData
    }
  | {
      /** 通知種類。 */
      kind: 'success'
      /** 成功通知標題。 */
      title: string
      /** 成功通知內容。 */
      message: string
      /** 自動關閉秒數；0 代表只接受手動關閉。 */
      autoCloseSeconds: number
    }

/**
 * 提供全站最新一筆 API 錯誤與非阻塞通知。
 *
 * @param props - Provider 包覆的 React 子節點。
 */
export function GlobalErrorProvider({
  children,
}: PropsWithChildren) {
  const [notice, setNotice] = useState<GlobalNotice | null>(null)
  const error = notice?.kind === 'error' ? notice.error : null

  /** 關閉目前顯示的全域錯誤。 */
  const clearGlobalError = useCallback((): void => {
    setNotice(null)
  }, [])

  /**
   * 顯示一筆全站成功通知。
   *
   * @param message - 要提供給玩家的成功訊息。
   * @param title - 成功通知標題。
   */
  const notifySuccess = useCallback(
    (
      message: string,
      options: SuccessNotificationOptions = {},
    ): void => {
      setNotice({
        kind: 'success',
        title: options.title ?? '操作成功',
        message,
        autoCloseSeconds: Math.max(
          0,
          options.autoCloseSeconds ??
            DEFAULT_SUCCESS_AUTO_CLOSE_SECONDS,
        ),
      })
    },
    [],
  )

  /**
   * 成功通知到達指定時間後自動關閉；更新通知時會取消舊計時器。
   */
  useEffect(() => {
    if (
      notice?.kind !== 'success' ||
      notice.autoCloseSeconds === 0
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setNotice((currentNotice) =>
        currentNotice === notice ? null : currentNotice,
      )
    }, notice.autoCloseSeconds * 1_000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [notice])

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
        setNotice({
          kind: 'error',
          error: notice,
        })
      }
    },
    [],
  )

  const value = useMemo<GlobalErrorContextValue>(
    () => ({
      error,
      handleGlobalError,
      clearGlobalError,
      notifySuccess,
    }),
    [clearGlobalError, error, handleGlobalError, notifySuccess],
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
      {notice?.kind === 'success' ? (
        <GlobalSuccessNotice
          message={notice.message}
          onClose={clearGlobalError}
          title={notice.title}
        />
      ) : null}
    </GlobalErrorContext.Provider>
  )
}
