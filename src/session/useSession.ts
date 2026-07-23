import { useContext } from 'react'
import { SessionContext } from './session-context'
import type { SessionContextValue } from './session.types'

/**
 * 取得目前登入、角色與 GameState 啟動狀態。
 *
 * @returns Session Provider 公開的狀態與操作。
 */
export const useSession = (): SessionContextValue => {
  const session = useContext(SessionContext)

  if (!session) {
    throw new Error('useSession 必須在 SessionProvider 內使用')
  }

  return session
}
