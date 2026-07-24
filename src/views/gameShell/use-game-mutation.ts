import { useState } from 'react'
import { useGlobalErrorHandler } from '@/error'
import { useMutation } from '@/hook'
import { uuid } from '@/lib/uuid'
import {
  createOperationIntentLifecycle,
  type OperationIntentLifecycle,
} from './game-mutation'
import { useGameRuntime } from './use-game-runtime'

/** 後端資源異動函式收到的冪等資訊。 */
export interface GameMutationContext {
  /** 送往後端 `Idempotency-Key` header 的唯一鍵。 */
  idempotencyKey: string
}

/** `useGameMutation` 的生命週期設定。 */
export interface UseGameMutationOptions<TIntent, TData> {
  /** 穩定且唯一的操作名稱，用來隔離不同後端 mutation。 */
  operation: string
  /** 實際呼叫 repository/usecase 的函式，必須傳遞冪等鍵。 */
  request: (
    intent: TIntent,
    context: GameMutationContext,
  ) => Promise<TData>
  /** GameState 同步完成後執行的頁面專屬成功處理。 */
  onSuccess?: (data: TData, intent: TIntent) => void | Promise<void>
  /** API 異動失敗時執行的頁面專屬錯誤處理。 */
  onError?: (error: unknown, intent: TIntent) => void
  /** GameState 之外需要一併刷新的額外查詢。 */
  synchronize?: (
    data: TData,
    intent: TIntent,
  ) => void | Promise<void>
  /** 未提供局部錯誤處理時是否顯示全域通知。 */
  enableGlobalError?: boolean
}

/** 正式遊戲資源異動對頁面公開的操作介面。 */
export interface GameMutation<TIntent, TData> {
  /** 以目前參數送出異動；pending 時會忽略重複點擊。 */
  execute: (intent: TIntent) => void
  /** 取消尚未送出的操作意圖並建立下一輪冪等生命週期。 */
  cancelIntent: () => void
  /** 是否正在等待後端異動與 GameState 同步。 */
  isPending: boolean
  /** 最後一次後端異動錯誤。 */
  error: unknown
  /** 最後一次成功回傳的資料。 */
  data: TData | undefined
  /** 目前正在處理或最後送出的操作參數。 */
  activeIntent: TIntent | null
}

/** hook 內部送給 TanStack Mutation 的完整變數。 */
interface GameMutationVariables<TIntent> {
  /** 畫面送出的操作參數。 */
  intent: TIntent
  /** 這次操作固定使用的冪等鍵。 */
  idempotencyKey: string
}

/**
 * 統一正式遊戲資源異動、冪等鍵與 GameState 同步。
 *
 * @param options - 操作名稱、後端請求與頁面專屬 callback。
 * @returns 防連點且可安全重試的資源異動介面。
 *
 * 後端成功後會先結束冪等意圖，再同步 GameState；同步失敗不會
 * 重送已成功的 mutation，而是交由全域錯誤通知提示使用者刷新。
 */
export function useGameMutation<TIntent, TData>(
  options: UseGameMutationOptions<TIntent, TData>,
): GameMutation<TIntent, TData> {
  const { reloadGameState } = useGameRuntime()
  const { handleGlobalError } = useGlobalErrorHandler()
  const [lifecycle] = useState<OperationIntentLifecycle<TIntent>>(
    () =>
      createOperationIntentLifecycle<TIntent>(
        options.operation,
        uuid,
      ),
  )
  const mutation = useMutation(
    ({
      intent,
      idempotencyKey,
    }: GameMutationVariables<TIntent>) =>
      options.request(intent, { idempotencyKey }),
    {
      enableGlobalError: options.enableGlobalError,
      onError: options.onError
        ? (error, variables) => {
            options.onError?.(error, variables.intent)
          }
        : undefined,
      onSuccess: async (data, variables) => {
        // API 已成功即結束本輪冪等鍵；後續刷新失敗時不可把已完成
        // 的資源異動當作未知結果重新送出。
        lifecycle.complete(variables.intent)

        try {
          await Promise.all([
            reloadGameState(),
            options.synchronize?.(data, variables.intent),
          ])
          await options.onSuccess?.(data, variables.intent)
        } catch (error) {
          handleGlobalError(error)
        }
      },
    },
  )

  return {
    execute: (intent) => {
      if (mutation.isPending) {
        return
      }

      // acquire 會依 operation 與參數指紋決定沿用舊鍵或建立新鍵，
      // 因此網路錯誤重試安全，切換目標也不會誤用舊鍵。
      const record = lifecycle.acquire(intent)
      mutation.mutate({
        intent,
        idempotencyKey: record.idempotencyKey,
      })
    },
    cancelIntent: () => {
      if (!mutation.isPending) {
        lifecycle.cancel()
        mutation.reset()
      }
    },
    isPending: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    activeIntent: mutation.variables?.intent ?? null,
  }
}
