import { useContext } from 'react'
import { GameRuntimeContext } from './game-runtime-context'
import type { GameViewState } from './game-view-state'

/** `GET /game/state` 的共用 TanStack Query key。 */
export const gameStateQueryKey = ['game-state'] as const

/** V1 物品 catalog 的共用 TanStack Query key。 */
export const itemCatalogQueryKey = ['item-catalog', 'v1'] as const

/** 正式遊戲頁可使用的 Runtime 介面。 */
export interface GameRuntime {
  /** 後端 GameState 與 catalog 合併後的畫面模型。 */
  gameState: GameViewState
  /** V1 catalog 是否仍在載入。 */
  isCatalogLoading: boolean
  /** V1 catalog 最後一次載入錯誤；無錯誤時為 null。 */
  catalogError: unknown
  /** 重新讀取 V1 物品 catalog。 */
  reloadCatalog: () => Promise<void>
  /** 重新讀取目前角色的完整 GameState。 */
  reloadGameState: () => Promise<void>
}

/**
 * 取得遊戲頁唯一的 GameState Runtime。
 *
 * @returns Provider 持有的 GameState 畫面模型與刷新操作。
 * @throws 在 GameRuntimeProvider 外呼叫時拋出明確錯誤。
 */
export const useGameRuntime = (): GameRuntime => {
  const runtime = useContext(GameRuntimeContext)

  if (!runtime) {
    throw new Error(
      'useGameRuntime 必須在 GameRuntimeProvider 內使用',
    )
  }

  return runtime
}
