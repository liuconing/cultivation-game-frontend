import type { AuthUser } from '@/domain/repository'
import { create, persist } from '@/lib/zustand'

/** 登入成功後寫入 store 的 payload。 */
export type AuthSession = {
  /** JWT token。 */
  token: string
  /** 目前登入使用者。 */
  user: AuthUser
}

/** 清除登入狀態的原因。 */
export type AuthClearReason = 'logout' | 'expired'

/** 清除登入狀態時可附帶的資訊。 */
export interface ClearAuthOptions {
  /** 清除登入狀態的原因；未提供時視為一般登出。 */
  reason?: AuthClearReason
}

/** Auth store 狀態與操作。 */
export type AuthStore = {
  /** JWT token；未登入時為 null。 */
  token: string | null
  /** 目前登入使用者；未登入時為 null。 */
  user: AuthUser | null
  /** localStorage 的持久化內容是否已完成還原。 */
  hasHydrated: boolean
  /** 需要在登入頁顯示的 session 提示。 */
  sessionNotice: AuthClearReason | null
  /** 寫入登入 session。 */
  setAuth: (session: AuthSession) => void
  /** 清除登入 session（登出）。 */
  clearAuth: (options?: ClearAuthOptions) => void
  /** 標記持久化登入資料已完成還原。 */
  setHasHydrated: (hasHydrated: boolean) => void
  /** 清除已顯示的 session 提示。 */
  clearSessionNotice: () => void
}

const AUTH_STORAGE_KEY = 'inkdao-auth'

/**
 * 全域認證狀態。
 * 使用 persist 將 token / user 存入 localStorage，重整後可維持登入。
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      sessionNotice: null,
      setAuth: ({ token, user }) =>
        set({ token, user, sessionNotice: null }),
      clearAuth: ({ reason = 'logout' } = {}) =>
        set({
          token: null,
          user: null,
          sessionNotice: reason === 'expired' ? reason : null,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearSessionNotice: () => set({ sessionNotice: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

/** 是否已登入（有 token）。 */
export const selectIsAuthenticated = (state: AuthStore): boolean =>
  Boolean(state.token)
