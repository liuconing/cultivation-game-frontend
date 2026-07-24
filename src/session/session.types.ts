import type {
  AuthUser,
  CharacterResponse,
} from '@/domain/repository'

/**
 * Session 啟動流程的狀態。
 *
 * `ready` 只表示登入憑證有效且已有角色；GameState 由遊戲 Runtime
 * 另外載入，避免認證生命週期持有遊戲資料。
 */
export type SessionStatus =
  | 'hydrating'
  | 'anonymous'
  | 'checking'
  | 'noCharacter'
  | 'ready'
  | 'error'

/** Session Provider 對路由與認證畫面公開的最小介面。 */
export interface SessionContextValue {
  /** 目前登入與角色檢查狀態。 */
  status: SessionStatus
  /** 已登入的使用者；匿名狀態為 null。 */
  user: AuthUser | null
  /** 已登入使用者的角色；尚未建立角色時為 null。 */
  character: CharacterResponse | null
  /** 角色檢查失敗時供頁面顯示的中文訊息。 */
  errorMessage: string | null
  /** 是否正在撤銷目前登入憑證。 */
  isLoggingOut: boolean
  /** 重新檢查目前帳號是否已有角色，不會載入 GameState。 */
  reloadSession: () => Promise<void>
  /** 撤銷目前 token；成功或 401 時清除本機登入狀態。 */
  logout: () => Promise<void>
}

/** Session 啟動後的角色檢查結果。 */
export type SessionBootstrapData =
  | {
      /** 表示帳號尚未建立角色。 */
      status: 'noCharacter'
      /** 未建立角色時固定為 null。 */
      character: null
    }
  | {
      /** 表示帳號已有角色，可以進入遊戲 Runtime。 */
      status: 'ready'
      /** 目前帳號擁有的角色。 */
      character: CharacterResponse
    }
