import { useMemo } from 'react'
import { type UseQueryOptions, useQuery, type QueryKey } from '@/lib/react-query'
import { uuid } from '@/lib/uuid'

type UseQueryBaseOptions<TData, TError> = Omit<
  UseQueryOptions<TData, TError, TData, QueryKey>,
  'initialData' | 'queryFn' | 'queryKey'
>

export interface UseFetchOptions<TData, TError> extends UseQueryBaseOptions<TData, TError> {
  /**
   * 是否啟用 Logger, 預設為: false
   */
  enableLogger?: boolean

  /**
   * 是否顯示 Loading Spinner
   */
  enableSpinner?: boolean

  /**
   * This is used to prepoulate a query with initial data.
   */
  initialData?: () => TData

  /**
   * This is used to identify the query in the cache.
   * */
  queryKey?: QueryKey
  /**
   * This callback will fire any time the query successfully fetches new data.
   */
  onSuccess?: (data: TData) => void
  /**
   * This callback will fire if the query encounters an error and will be passed the error.
   */
  onError?: (error: TError) => void
  /**
   * This callback will fire any time the query is either successfully fetched or errors and be passed either the data or error.
   */
  onSettled?: (data: TData | undefined, error: TError | undefined) => void
}

export function useFetch<TData, TParams, TError extends Error>(
  queryFn: (param: TParams) => Promise<TData>,
  params: TParams,
  options?: UseFetchOptions<TData, TError>,
) {
  // const { spinner } = useSpinner()
  // const { globalErrorHandler } = useGlobalErrorHandler()

  const enableLogger = options?.enableLogger ?? false
  // const enableSpinner = options?.enableSpinner ?? false

  /** 避免 編譯後 function name 重複 */
  const queryKeyUUid = useMemo(() => uuid(), [])

  const queryResult = useQuery({
    ...options,
    queryKey: options?.queryKey ? [...options.queryKey, params] : [queryKeyUUid, params],
    queryFn: async () => {
      let result
      let error

      try {
        // result = enableSpinner ? await spinner(queryFn(params)) : await queryFn(params)
        result = await queryFn(params)

        if (options?.onSuccess) {
          options.onSuccess(result)
        }

        return result
      } catch (err) {
        error = err as TError

        // 若有設定 onError，則使用 onError 的錯誤處理, 否則使用全域錯誤處理
        if (options?.onError) {
          options.onError(error)
        } else {
          // globalErrorHandler(error)
        }

        // 必須要 throw error, useQuery 的狀態才會改變
        throw error
      } finally {
        if (options?.onSettled) {
          options.onSettled(result, error)
        }

        if (enableLogger) {
          console.groupCollapsed(
            `%cuseFetch: %c${queryFn.name}`,
            'color: #000; font-size:10px; font-weight: 700; font-style: italic;',
            'color: #196c35; font-size:10px; font-weight: 700; font-style: italic;',
          )
          console.log({
            params: params,
            result,
            error,
          })
          console.groupEnd()
        }
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  return queryResult
}
