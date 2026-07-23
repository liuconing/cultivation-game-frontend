import type {
  AuthUser,
  CharacterResponse,
  GameStateData,
} from '@/domain/repository'

/** 前端啟動期間可觀察的登入與角色狀態。 */
export type SessionStatus =
  | 'hydrating'
  | 'anonymous'
  | 'checking'
  | 'noCharacter'
  | 'ready'
  | 'error'

/** Session Provider 對畫面公開的資料與操作。 */
export interface SessionContextValue {
  /** 目前 session 的啟動狀態。 */
  status: SessionStatus
  /** 已登入的使用者；未登入時為 null。 */
  user: AuthUser | null
  /** 後端目前角色；未建立或未完成檢查時為 null。 */
  character: CharacterResponse | null
  /** 完整遊戲狀態；尚未完成啟動時為 null。 */
  gameState: GameStateData | null
  /** Session 啟動失敗時可顯示的訊息。 */
  errorMessage: string | null
  /** 重新執行角色與 GameState 啟動檢查。 */
  reloadSession: () => Promise<void>
  /** 清除目前登入狀態與快取。 */
  logout: () => void
}

/** Session 啟動查詢的成功結果。 */
export type SessionBootstrapData =
  | {
      /** 使用者尚未建立角色。 */
      status: 'noCharacter'
      /** 無角色狀態固定為 null。 */
      character: null
      /** 無角色時不請求 GameState。 */
      gameState: null
    }
  | {
      /** 角色與 GameState 都已完成載入。 */
      status: 'ready'
      /** 後端回傳的目前角色。 */
      character: CharacterResponse
      /** 後端回傳的完整遊戲狀態。 */
      gameState: GameStateData
    }
