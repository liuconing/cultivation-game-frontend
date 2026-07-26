import { useLocation } from 'react-router'
import { getPreservedRoute } from '@/router/route-state'
import { useSession } from '@/session'
import { useAuthStore } from '@/stores'
import { resolveHomeAction } from './home-navigation'

/**
 * 管理公開首頁的 Session 操作與失效憑證提示。
 *
 * 首頁本身不載入 GameState；只讀取既有 Session 狀態決定入口，
 * 避免公開內容依賴遊戲 API 才能顯示。
 *
 * @returns 公開首頁所需的唯讀狀態與操作。
 */
export function useHomeViewModel() {
  const location = useLocation()
  const { status, reloadSession } = useSession()
  const sessionNotice = useAuthStore((state) => state.sessionNotice)
  const clearSessionNotice = useAuthStore((state) => state.clearSessionNotice)
  const preservedRoute = getPreservedRoute(location.state)

  return {
    action: resolveHomeAction(status, preservedRoute),
    hasInvalidSessionNotice: sessionNotice === 'invalid',
    handleRetrySession: () => {
      void reloadSession()
    },
    handleDismissSessionNotice: clearSessionNotice,
  }
}

export type IHomeViewModel = ReturnType<typeof useHomeViewModel>
