import { useMemo, type PropsWithChildren } from 'react'
import {
  useQuery,
  useQueryClient,
  type QueryFunctionContext,
} from '@/lib/react-query'
import {
  getGameStateUsecase,
  getMyCharacterUsecase,
} from '@/domain'
import { getApiClientError } from '@/lib/axios'
import { useAuthStore } from '@/stores'
import { SessionContext } from './session-context'
import type {
  SessionBootstrapData,
  SessionContextValue,
  SessionStatus,
} from './session.types'

/** Session 啟動查詢使用的固定 query key 前綴。 */
const SESSION_QUERY_KEY = 'session-bootstrap'

/**
 * 依目前 token 載入角色與完整 GameState。
 *
 * @param context - TanStack Query 提供的 query key 資訊。
 * @returns 無角色或已完整載入的 session 啟動結果。
 */
const bootstrapSession = async ({
  queryKey,
}: QueryFunctionContext<
  readonly [typeof SESSION_QUERY_KEY, string]
>): Promise<SessionBootstrapData> => {
  const [, token] = queryKey

  if (!token) {
    throw new Error('缺少登入 token')
  }

  const characterResponse = await getMyCharacterUsecase()
  if (!characterResponse.data.character) {
    return {
      status: 'noCharacter',
      character: null,
      gameState: null,
    }
  }

  try {
    const gameStateResponse = await getGameStateUsecase()
    return {
      status: 'ready',
      character: characterResponse.data.character,
      gameState: gameStateResponse.data,
    }
  } catch (error) {
    const apiError = getApiClientError(error)
    if (
      apiError.status === 404 &&
      apiError.code === 'CHARACTER_NOT_FOUND'
    ) {
      return {
        status: 'noCharacter',
        character: null,
        gameState: null,
      }
    }

    throw error
  }
}

/**
 * 判斷 session 啟動失敗是否需要自動重試。
 *
 * @param failureCount - 目前已失敗的次數。
 * @param error - 本次 API 錯誤。
 * @returns 是否再重試一次。
 */
const shouldRetrySession = (
  failureCount: number,
  error: unknown,
): boolean => {
  const apiError = getApiClientError(error)
  const isRetryable =
    apiError.status === null || apiError.status >= 500

  return isRetryable && failureCount < 1
}

/**
 * 集中提供 token 還原、角色檢查與 GameState 啟動狀態。
 *
 * @param props - Provider 包覆的 React 子節點。
 */
export function SessionProvider({
  children,
}: PropsWithChildren) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const queryClient = useQueryClient()
  const sessionQuery = useQuery({
    queryKey: [SESSION_QUERY_KEY, token ?? ''],
    queryFn: bootstrapSession,
    enabled: hasHydrated && Boolean(token),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    retry: shouldRetrySession,
  })

  const status: SessionStatus = !hasHydrated
    ? 'hydrating'
    : !token
      ? 'anonymous'
      : sessionQuery.isPending
        ? 'checking'
        : sessionQuery.isError
          ? 'error'
          : (sessionQuery.data?.status ?? 'checking')

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      character: sessionQuery.data?.character ?? null,
      gameState: sessionQuery.data?.gameState ?? null,
      errorMessage: sessionQuery.isError
        ? getApiClientError(sessionQuery.error).message
        : null,
      reloadSession: async () => {
        await sessionQuery.refetch()
      },
      logout: () => {
        clearAuth({ reason: 'logout' })
        queryClient.removeQueries({
          queryKey: [SESSION_QUERY_KEY],
        })
      },
    }),
    [
      clearAuth,
      queryClient,
      sessionQuery,
      status,
      user,
    ],
  )

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
