import { useMemo, type PropsWithChildren } from 'react'
import { useQueryClient } from '@/lib/react-query'
import {
  getMyCharacterUsecase,
  logoutUserUsecase,
} from '@/domain'
import { useFetch, useMutation } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import { useAuthStore } from '@/stores'
import { SessionContext } from './session-context'
import { shouldFinalizeLogoutAfterError } from './logout-policy'
import type {
  SessionBootstrapData,
  SessionContextValue,
  SessionStatus,
} from './session.types'

/** Session 角色檢查所使用的 TanStack Query key。 */
const sessionQueryKey = ['session-bootstrap'] as const

/** Session 角色檢查需要的參數。 */
interface BootstrapSessionParams {
  /** 目前登入憑證；同時用於隔離不同帳號的快取。 */
  token: string
}

/**
 * 驗證目前 token 所屬帳號是否已有角色。
 *
 * @param params - 包含目前 token 的角色檢查參數。
 * @returns 已有角色或尚未建立角色的 Session 狀態。
 * @throws token 空白或角色 API 無法完成時保留原始錯誤。
 */
const bootstrapSession = async ({
  token,
}: BootstrapSessionParams): Promise<SessionBootstrapData> => {
  if (!token) {
    throw new Error('缺少登入憑證')
  }

  const characterResponse = await getMyCharacterUsecase()
  if (!characterResponse.data.character) {
    return {
      status: 'noCharacter',
      character: null,
    }
  }

  return {
    status: 'ready',
    character: characterResponse.data.character,
  }
}

/**
 * 判斷角色檢查是否值得再嘗試一次。
 *
 * @param failureCount - TanStack Query 已失敗的次數。
 * @param error - 最後一次角色 API 錯誤。
 * @returns 僅網路錯誤或 5xx 的第一次失敗可以重試。
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
 * 管理登入憑證、角色存在性與登出生命週期。
 *
 * @param props - Provider 內需要使用 Session 的 React 子節點。
 * @returns 提供 Session context 的 React 節點。
 *
 * 登出成功或伺服器回傳 401 時會清除本機憑證；網路或 5xx
 * 失敗則保留登入狀態，讓使用者可以安全重試。
 */
export function SessionProvider({
  children,
}: PropsWithChildren) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const queryClient = useQueryClient()
  const sessionQuery = useFetch(
    bootstrapSession,
    { token: token ?? '' },
    {
      queryKey: [...sessionQueryKey, token ?? ''],
      enabled: hasHydrated && Boolean(token),
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      retry: shouldRetrySession,
      enableGlobalError: false,
    },
  )
  const logoutMutation = useMutation(
    () => logoutUserUsecase(),
    {
      enableGlobalError: false,
    },
  )

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
      errorMessage: sessionQuery.isError
        ? getApiClientError(sessionQuery.error).message
        : null,
      isLoggingOut: logoutMutation.isPending,
      reloadSession: async () => {
        await sessionQuery.refetch()
      },
      logout: async () => {
        let clearReason: 'logout' | 'invalid' = 'logout'

        try {
          await logoutMutation.mutateAsync()
        } catch (error) {
          if (
            !shouldFinalizeLogoutAfterError(
              getApiClientError(error).status,
            )
          ) {
            throw error
          }
          clearReason = 'invalid'
        }

        clearAuth({ reason: clearReason })
        queryClient.removeQueries({
          queryKey: sessionQueryKey,
        })
      },
    }),
    [
      clearAuth,
      logoutMutation,
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
