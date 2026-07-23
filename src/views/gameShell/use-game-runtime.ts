import { useMemo } from 'react'
import { getItemsUsecase } from '@/domain/usecase'
import { useFetch } from '@/hook'
import { useSession } from '@/session'
import {
  createGameViewState,
  type GameViewState,
} from './game-state.adapter'

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
  /** 重新讀取 Session 與 GameState。 */
  reloadGameState: () => Promise<void>
  /** FE-04 接入前保留的修為領取操作介面。 */
  claimCultivation: () => void
  /** FE-11 接入前保留的突破操作介面。 */
  resolveBreakthrough: (outcome: 'success' | 'failure') => void
  /** FE-12 接入前保留的靈根升級操作介面。 */
  upgradeSpiritualRoot: () => void
  /** FE-06 接入前保留的探索操作介面。 */
  resolveExploration: () => void
  /** FE-05 接入前保留的休養操作介面。 */
  completeCaveRecovery: () => void
  /** FE-09 接入前保留的裝備穿戴操作介面。 */
  equipEquipment: (instanceId: string) => void
  /** FE-10 接入前保留的裝備出售操作介面。 */
  sellEquipment: (instanceId: string) => void
  /** FE-16 接入前保留的功法裝備操作介面。 */
  equipCultivationMethod: (templateId: string) => void
  /** FE-08 接入前保留的技能配置操作介面。 */
  equipSkill: (templateId: string) => void
  /** FE-13 接入前保留的丹藥購買操作介面。 */
  buyPill: (templateId: string) => void
  /** FE-13 接入前保留的丹藥使用操作介面。 */
  consumePill: (templateId: string) => void
}

/** 尚未接入之後續 mutation 的無副作用暫存操作。 */
const pendingMutation = (): void => undefined

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
    reloadGameState: reloadSession,
    claimCultivation: pendingMutation,
    resolveBreakthrough: pendingMutation,
    upgradeSpiritualRoot: pendingMutation,
    resolveExploration: pendingMutation,
    completeCaveRecovery: pendingMutation,
    equipEquipment: pendingMutation,
    sellEquipment: pendingMutation,
    equipCultivationMethod: pendingMutation,
    equipSkill: pendingMutation,
    buyPill: pendingMutation,
    consumePill: pendingMutation,
  }
}
