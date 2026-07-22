import { useMemo } from 'react'
import {
  useMutation as useReactQueryMutation,
  type UseMutationOptions as UseMutationOptionsBase,
} from '@/lib/react-query'
import { isEmpty } from '@/lib/lodash'
import { uuid } from '@/lib/uuid'

export interface UseMutationOptions<TData, TParams> extends UseMutationOptionsBase<TData, unknown, TParams, any> {
  /** 是否啟用 Logger, 預設為: false  */
  enableLogger?: boolean
}

export function useMutation<TData, TParams = void>(
  fetchFn: (params: TParams) => Promise<TData>,
  options?: UseMutationOptions<TData, TParams>,
) {
  const enableLogger = options?.enableLogger ?? false

  const mutationFuncName = useMemo(() => {
    return !isEmpty(fetchFn.name) ? fetchFn.name : uuid()
  }, [fetchFn.name])

  const { mutateAsync, data, isPending, isSuccess, isError } = useReactQueryMutation<TData, unknown, TParams>({
    mutationFn: async (params: TParams) => {
      let result
      let error

      try {
        result = await fetchFn(params)

        return result
      } catch (error) {
        throw error
      } finally {
        if (enableLogger) {
          console.groupCollapsed(
            `%cuseMutation: %c${mutationFuncName}`,
            'color: #000; font-size:10px; font-weight: 700; font-style: italic;',
            'color: #196c35; font-size:10px; font-weight: 700; font-style: italic;',
          )
          console.log({
            params,
            result,
            error,
          })
          console.groupEnd()
        }
      }
    },
    ...options,
  })

  return { mutate: mutateAsync, data, isPending, isSuccess, isError }
}
