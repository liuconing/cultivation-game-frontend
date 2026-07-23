import {
  useMutation as useReactQueryMutation,
  type MutationFunctionContext,
  type UseMutationOptions as UseMutationOptionsBase,
} from '@/lib/react-query'
import { useGlobalErrorHandler } from '@/error'

/** 共用 mutation hook 的設定。 */
export type UseMutationOptions<
  TData,
  TError,
  TParams,
  TOnMutateResult,
> = Omit<
  UseMutationOptionsBase<
    TData,
    TError,
    TParams,
    TOnMutateResult
  >,
  'mutationFn'
> & {
  /** 是否輸出 mutation 最終結果，預設為 false。 */
  enableLogger?: boolean
  /** 未提供局部 onError 時是否顯示全域錯誤，預設為 true。 */
  enableGlobalError?: boolean
}

/** 共用 mutation logger 所需資料。 */
interface MutationLogInput<TData, TParams, TError> {
  /** 被呼叫的 mutation 函式名稱。 */
  functionName: string
  /** 傳給 mutation 函式的參數。 */
  params: TParams
  /** mutation 成功資料。 */
  data?: TData
  /** mutation 失敗錯誤。 */
  error?: TError | null
}

/**
 * 輸出單次 mutation 的最終結果。
 *
 * @param input - mutation 名稱、參數、資料與錯誤。
 */
const logMutationResult = <TData, TParams, TError>({
  functionName,
  params,
  data,
  error,
}: MutationLogInput<TData, TParams, TError>): void => {
  console.groupCollapsed(
    `%cuseMutation: %c${functionName || 'anonymousMutation'}`,
    'color: #000; font-size:10px; font-weight: 700; font-style: italic;',
    'color: #196c35; font-size:10px; font-weight: 700; font-style: italic;',
  )
  console.log({ params, data, error })
  console.groupEnd()
}

/**
 * 執行具局部 callback、logger 與全域錯誤處理的 mutation。
 *
 * @param mutationFn - 實際異動資料的非同步函式。
 * @param options - Mutation callback、logger 與錯誤處理設定。
 * @returns TanStack Query 的完整 mutation 結果。
 */
export function useMutation<
  TData,
  TParams = void,
  TError = unknown,
  TOnMutateResult = unknown,
>(
  mutationFn: (params: TParams) => Promise<TData>,
  options?: UseMutationOptions<
    TData,
    TError,
    TParams,
    TOnMutateResult
  >,
) {
  const {
    enableLogger = false,
    enableGlobalError = true,
    onError,
    onSettled,
    ...mutationOptions
  } = options ?? {}
  const { handleGlobalError } = useGlobalErrorHandler()

  return useReactQueryMutation<
    TData,
    TError,
    TParams,
    TOnMutateResult
  >({
    ...mutationOptions,
    mutationFn,
    onError: async (
      error: TError,
      params: TParams,
      onMutateResult: TOnMutateResult | undefined,
      context: MutationFunctionContext,
    ) => {
      if (onError) {
        await onError(error, params, onMutateResult, context)
      } else if (enableGlobalError) {
        handleGlobalError(error)
      }
    },
    onSettled: async (
      data: TData | undefined,
      error: TError | null,
      params: TParams,
      onMutateResult: TOnMutateResult | undefined,
      context: MutationFunctionContext,
    ) => {
      if (enableLogger) {
        logMutationResult({
          functionName: mutationFn.name,
          params,
          data,
          error,
        })
      }

      await onSettled?.(
        data,
        error,
        params,
        onMutateResult,
        context,
      )
    },
  })
}
