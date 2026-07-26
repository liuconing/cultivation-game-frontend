/** React Router 導向時可附帶的站內來源資料。 */
export interface RouteLocationState {
  /** 使用者原先嘗試進入的受保護站內路徑。 */
  from?: unknown
}

/** 不可作為登入後返回目標的認證與公開入口。 */
const blockedReturnPaths = new Set(['/', '/login', '/register'])

/**
 * 從 Router state 取得安全的站內來源路徑。
 *
 * @param state - React Router location state。
 * @returns 合法的受保護站內路徑；資料無效時回傳 null。
 */
export const getPreservedRoute = (state: unknown): string | null => {
  if (!state || typeof state !== 'object') {
    return null
  }

  const { from } = state as RouteLocationState
  if (
    typeof from !== 'string' ||
    !from.startsWith('/') ||
    from.startsWith('//')
  ) {
    return null
  }

  const pathname = from.split(/[?#]/u, 1)[0]
  if (blockedReturnPaths.has(pathname)) {
    return null
  }

  return from
}

/**
 * 決定認證成功後的站內目的地。
 *
 * @param state - React Router location state。
 * @returns 保存的受保護路徑；沒有合法來源時交由 `/game` 守衛分流。
 */
export const getPostAuthRoute = (state: unknown): string =>
  getPreservedRoute(state) ?? '/game'
