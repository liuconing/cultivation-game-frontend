import type { AuthUser } from '@/domain/repository'
import { create, persist } from '@/lib/zustand'

/** 登入成功後寫入 store 的 payload。 */
export type AuthSession = {
  /** JWT token。 */
  token: string
  /** 目前登入使用者。 */
  user: AuthUser
}

/** Auth store 狀態與操作。 */
export type AuthStore = {
  /** JWT token；未登入時為 null。 */
  token: string | null
  /** 目前登入使用者；未登入時為 null。 */
  user: AuthUser | null
  /** 寫入登入 session。 */
  setAuth: (session: AuthSession) => void
  /** 清除登入 session（登出）。 */
  clearAuth: () => void
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
      setAuth: ({ token, user }) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
)

/** 是否已登入（有 token）。 */
export const selectIsAuthenticated = (state: AuthStore): boolean =>
  Boolean(state.token)
