import { useEffect, useRef } from 'react'
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from '@/lib/react-query'
import { useGlobalErrorHandler } from '@/error'

type UseQueryBaseOptions<TData, TError> = Omit<
  UseQueryOptions<TData, TError, TData, QueryKey>,
  'queryFn' | 'queryKey'
>

/** 共用查詢 hook 的設定。 */
export interface UseFetchOptions<TData, TError>
  extends UseQueryBaseOptions<TData, TError> {
  /** TanStack Query 用來快取與去除重複請求的穩定 key。 */
  queryKey: QueryKey
  /** 是否輸出最終查詢結果，預設為 false。 */
  enableLogger?: boolean
  /** 未提供局部 onError 時是否顯示全域錯誤，預設為 true。 */
  enableGlobalError?: boolean
  /** 查詢最終成功後執行一次的 callback。 */
  onSuccess?: (data: TData) => void
  /** 查詢重試結束且仍失敗後執行一次的 callback。 */
  onError?: (error: TError) => void
  /** 查詢取得最終成功或失敗結果後執行一次的 callback。 */
  onSettled?: (
    data: TData | undefined,
    error: TError | undefined,
  ) => void
}

/** 共用查詢 logger 所需資料。 */
interface FetchLogInput<TData, TParams, TError> {
  /** 被呼叫的查詢函式名稱。 */
  functionName: string
  /** 傳給查詢函式的參數。 */
  params: TParams
  /** 查詢成功資料。 */
  data?: TData
  /** 查詢失敗錯誤。 */
  error?: TError
}

/**
 * 輸出單次查詢的最終結果。
 *
 * @param input - 查詢名稱、參數、資料與錯誤。
 */
const logFetchResult = <TData, TParams, TError>({
  functionName,
  params,
  data,
  error,
}: FetchLogInput<TData, TParams, TError>): void => {
  console.groupCollapsed(
    `%cuseFetch: %c${functionName || 'anonymousQuery'}`,
    'color: #000; font-size:10px; font-weight: 700; font-style: italic;',
    'color: #196c35; font-size:10px; font-weight: 700; font-style: italic;',
  )
  console.log({ params, data, error })
  console.groupEnd()
}

/**
 * 執行具穩定快取 key、局部 callback 與全域錯誤處理的查詢。
 *
 * @param queryFn - 實際取得資料的非同步函式。
 * @param params - 傳給查詢函式的參數。
 * @param options - 查詢、callback、logger 與錯誤處理設定。
 * @returns TanStack Query 的完整查詢結果。
 */
export function useFetch<
  TData,
  TParams = void,
  TError = unknown,
>(
  queryFn: (params: TParams) => Promise<TData>,
  params: TParams,
  options: UseFetchOptions<TData, TError>,
) {
  const {
    queryKey,
    enableLogger = false,
    enableGlobalError = true,
    onSuccess,
    onError,
    onSettled,
    ...queryOptions
  } = options
  const { handleGlobalError } = useGlobalErrorHandler()
  const handledDataUpdatedAtRef = useRef(0)
  const handledErrorUpdateCountRef = useRef(0)
  const queryResult = useQuery({
    ...queryOptions,
    queryKey,
    queryFn: () => queryFn(params),
  })

  useEffect(() => {
    if (
      !queryResult.isSuccess ||
      queryResult.dataUpdatedAt === 0 ||
      handledDataUpdatedAtRef.current === queryResult.dataUpdatedAt
    ) {
      return
    }

    handledDataUpdatedAtRef.current = queryResult.dataUpdatedAt
    onSuccess?.(queryResult.data)
    onSettled?.(queryResult.data, undefined)

    if (enableLogger) {
      logFetchResult({
        functionName: queryFn.name,
        params,
        data: queryResult.data,
      })
    }
  }, [
    enableLogger,
    onSettled,
    onSuccess,
    params,
    queryFn.name,
    queryResult.data,
    queryResult.dataUpdatedAt,
    queryResult.isSuccess,
  ])

  useEffect(() => {
    if (
      !queryResult.isError ||
      queryResult.errorUpdateCount === 0 ||
      handledErrorUpdateCountRef.current ===
        queryResult.errorUpdateCount
    ) {
      return
    }

    handledErrorUpdateCountRef.current =
      queryResult.errorUpdateCount

    if (onError) {
      onError(queryResult.error)
    } else if (enableGlobalError) {
      handleGlobalError(queryResult.error)
    }

    onSettled?.(undefined, queryResult.error)

    if (enableLogger) {
      logFetchResult({
        functionName: queryFn.name,
        params,
        error: queryResult.error,
      })
    }
  }, [
    enableGlobalError,
    enableLogger,
    handleGlobalError,
    onError,
    onSettled,
    params,
    queryFn.name,
    queryResult.error,
    queryResult.errorUpdateCount,
    queryResult.isError,
  ])

  return queryResult
}
