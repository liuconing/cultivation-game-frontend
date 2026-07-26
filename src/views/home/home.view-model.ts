import { useLocation } from 'react-router'
import { getPreservedRoute } from '@/router/route-state'
import { useSession } from '@/session'
import { useAuthStore } from '@/stores'
import {
  resolveHomeAction,
  type HomeAction,
} from './home-navigation'

/** 公開遊戲介紹首頁需要的 Session 狀態與操作。 */
export interface IHomeViewModel {
  /** Header 與 Hero 共用的狀態操作。 */
  action: HomeAction
  /** 是否需要提醒使用者登入憑證已失效。 */
  hasInvalidSessionNotice: boolean
  /** 重新向後端確認目前登入與角色狀態。 */
  handleRetrySession: () => void
  /** 關閉登入憑證失效提示。 */
  handleDismissSessionNotice: () => void
}

/**
 * 管理公開首頁的 Session 操作與失效憑證提示。
 *
 * 首頁本身不載入 GameState；只讀取既有 Session 狀態決定入口，
 * 避免公開內容依賴遊戲 API 才能顯示。
 *
 * @returns 公開首頁所需的唯讀狀態與操作。
 */
export function useHomeViewModel(): IHomeViewModel {
  const location = useLocation()
  const { status, reloadSession } = useSession()
  const sessionNotice = useAuthStore((state) => state.sessionNotice)
  const clearSessionNotice = useAuthStore(
    (state) => state.clearSessionNotice,
  )
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
