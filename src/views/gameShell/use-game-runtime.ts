import { useMemo } from 'react'
import { getItemsUsecase } from '@/domain/usecase'
import { useFetch } from '@/hook'
import { useSession } from '@/session'
import { createGameViewState } from './game-state.adapter'
import type { GameViewState } from './game-view-state'

/** 正式遊戲頁共用的查詢快取鍵。 */
export const itemCatalogQueryKey = ['item-catalog', 'v1'] as const

/** 正式遊戲頁共用的 runtime 狀態。 */
export interface GameRuntime {
  /** 合併 GameState 與 catalog 後的畫面資料。 */
  gameState: GameViewState
  /** 靜態 catalog 是否仍在載入。 */
  isCatalogLoading: boolean
  /** 靜態 catalog 載入失敗時的錯誤。 */
  catalogError: unknown
  /** 重新讀取 V1 靜態物品 catalog。 */
  reloadCatalog: () => Promise<void>
  /** 重新讀取 Session 與 GameState。 */
  reloadGameState: () => Promise<void>
}

/** 以 Session GameState 與 TanStack Query catalog 建立正式遊戲資料來源。 */
export const useGameRuntime = (): GameRuntime => {
  const { gameState, reloadSession } = useSession()
  const catalogQuery = useFetch(
    getItemsUsecase,
    {},
    {
      queryKey: itemCatalogQueryKey,
      staleTime: Number.POSITIVE_INFINITY,
      retry: 1,
    },
  )

  const viewState = useMemo(
    () => {
      if (!gameState) {
        return null
      }
      return createGameViewState(
        gameState,
        catalogQuery.data?.data.items ?? [],
      )
    },
    [catalogQuery.data, gameState],
  )

  if (!viewState) {
    throw new Error('遊戲頁缺少已初始化的 GameState。')
  }

  return {
    gameState: {
      ...viewState,
      isLoading: catalogQuery.isPending,
    },
    isCatalogLoading: catalogQuery.isPending,
    catalogError: catalogQuery.error,
    reloadCatalog: async () => {
      await catalogQuery.refetch()
    },
    reloadGameState: reloadSession,
  }
}
