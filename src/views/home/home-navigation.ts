import type { SessionStatus } from '@/session'

/** 首頁主要操作的呈現方式。 */
export type HomeActionKind = 'link' | 'pending' | 'retry'

/** 首頁 Header 與 Hero 共用的主要操作資料。 */
export interface HomeAction {
  /** 操作應呈現為連結、等待按鈕或重試按鈕。 */
  kind: HomeActionKind
  /** 顯示給使用者的中文操作文字。 */
  label: string
  /** 連結操作的目的路徑；非連結狀態固定為 null。 */
  to: string | null
  /** 匿名登入時需要繼續傳遞的原始受保護路徑。 */
  from: string | null
}

/**
 * 依 Session 狀態決定首頁主要操作。
 *
 * @param status - 目前登入與角色檢查狀態。
 * @param preservedRoute - 使用者登入前想前往的受保護路徑。
 * @returns Header 與 Hero 可共同使用的操作資料。
 */
export const resolveHomeAction = (
  status: SessionStatus,
  preservedRoute: string | null,
): HomeAction => {
  if (status === 'anonymous') {
    return {
      kind: 'link',
      label: '登入',
      to: '/login',
      from: preservedRoute,
    }
  }

  if (status === 'noCharacter') {
    return {
      kind: 'link',
      label: '建立角色',
      to: '/character/create',
      from: null,
    }
  }

  if (status === 'ready') {
    return {
      kind: 'link',
      label: '進入遊戲',
      to: '/game/cultivation',
      from: null,
    }
  }

  if (status === 'error') {
    return {
      kind: 'retry',
      label: '重新確認',
      to: null,
      from: null,
    }
  }

  return {
    kind: 'pending',
    label: '確認道籍中',
    to: null,
    from: null,
  }
}
