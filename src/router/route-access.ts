import type { SessionStatus } from '../session/session.types.ts'

/** 路由守衛判斷時需要的輸入。 */
export interface RouteAccessInput {
  /** 目前瀏覽器 pathname。 */
  pathname: string
  /** Session Provider 已判斷的登入與角色狀態。 */
  sessionStatus: SessionStatus
}

/** 路由可直接顯示的判斷結果。 */
export interface AllowRouteAccess {
  /** 表示目前路由可以顯示。 */
  kind: 'allow'
}

/** 路由需要導向其他位置的判斷結果。 */
export interface RedirectRouteAccess {
  /** 表示目前路由需要重新導向。 */
  kind: 'redirect'
  /** 重新導向的目的路徑。 */
  to: string
  /** 是否保留原路徑供登入成功後返回。 */
  preserveFrom: boolean
}

/** 路由需要等待 session 啟動的判斷結果。 */
export interface LoadingRouteAccess {
  /** 表示目前需要顯示載入狀態。 */
  kind: 'loading'
}

/** 路由需要顯示 session 錯誤的判斷結果。 */
export interface ErrorRouteAccess {
  /** 表示目前需要顯示錯誤狀態。 */
  kind: 'error'
}

/** 路由守衛所有可能的判斷結果。 */
export type RouteAccessResult =
  | AllowRouteAccess
  | RedirectRouteAccess
  | LoadingRouteAccess
  | ErrorRouteAccess

/** 不依賴 session 的公開工具頁。 */
const publicUtilityPaths = new Set(['/foundation'])

/** 僅供未登入使用者使用的認證路徑。 */
const authPaths = new Set(['/login', '/register'])

/** FE-01 目前開放的遊戲主框架路徑。 */
const gamePaths = new Set([
  '/game',
  '/game/cultivation',
  '/game/explore',
  '/game/loadout',
  '/game/cave',
])

/**
 * 產生不保留來源的重新導向結果。
 *
 * @param to - 重新導向的目的路徑。
 * @returns 路由重新導向結果。
 */
const redirectTo = (to: string): RedirectRouteAccess => ({
  kind: 'redirect',
  to,
  preserveFrom: false,
})

/**
 * 依登入、角色與目前 pathname 決定應顯示或導向的路由。
 *
 * @param input - 目前 pathname 與 session 狀態。
 * @returns 可顯示、重新導向、載入或錯誤結果。
 */
export const resolveRouteAccess = ({
  pathname,
  sessionStatus,
}: RouteAccessInput): RouteAccessResult => {
  if (publicUtilityPaths.has(pathname)) {
    return { kind: 'allow' }
  }

  if (
    sessionStatus === 'hydrating' ||
    sessionStatus === 'checking'
  ) {
    return { kind: 'loading' }
  }

  if (sessionStatus === 'error') {
    return { kind: 'error' }
  }

  if (pathname === '/') {
    if (sessionStatus === 'anonymous') {
      return redirectTo('/login')
    }
    if (sessionStatus === 'noCharacter') {
      return redirectTo('/character/create')
    }
    return redirectTo('/game/cultivation')
  }

  if (authPaths.has(pathname)) {
    if (sessionStatus === 'anonymous') {
      return { kind: 'allow' }
    }
    if (sessionStatus === 'noCharacter') {
      return redirectTo('/character/create')
    }
    return redirectTo('/game/cultivation')
  }

  if (pathname === '/character/create') {
    if (sessionStatus === 'anonymous') {
      return {
        kind: 'redirect',
        to: '/login',
        preserveFrom: true,
      }
    }
    if (sessionStatus === 'ready') {
      return redirectTo('/game/cultivation')
    }
    return { kind: 'allow' }
  }

  if (gamePaths.has(pathname)) {
    if (sessionStatus === 'anonymous') {
      return {
        kind: 'redirect',
        to: '/login',
        preserveFrom: true,
      }
    }
    if (sessionStatus === 'noCharacter') {
      return redirectTo('/character/create')
    }
    if (pathname === '/game') {
      return redirectTo('/game/cultivation')
    }
    return { kind: 'allow' }
  }

  return redirectTo('/')
}
