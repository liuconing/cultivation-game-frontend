import { createContext, useContext, useEffect, useMemo, useRef, type PropsWithChildren } from 'react'
import { Button, Panel } from '@/components'
import { getGameStateUsecase, getItemsUsecase } from '@/domain'
import { useFetch } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import { useQueryClient } from '@/lib/react-query'
import { useSession } from '@/session'
import type { GameViewState } from '@/utils'
import { createGameViewState } from './GameStateAdapter'

/** Game Runtime 載入或錯誤畫面的共用參數。 */
interface RuntimeStatusProps {
  /** 供輔助技術辨識目前狀態的英文標籤。 */
  eyebrow: string
  /** 狀態畫面的中文標題。 */
  title: string
  /** 狀態的中文詳細說明。 */
  message: string
  /** 可重試時執行的刷新操作；載入中不提供。 */
  onRetry?: () => Promise<void>
}

/** `GET /game/state` 的共用 TanStack Query key。 */
const gameStateQueryKey = ['game-state'] as const

/** V1 物品 catalog 的共用 TanStack Query key。 */
const itemCatalogQueryKey = ['item-catalog', 'v1'] as const

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

/** Game Runtime Provider 尚未掛載時使用的空 context。 */
const GameRuntimeContext = createContext<GameRuntime | null>(null)

/**
 * 取得遊戲頁唯一的 GameState Runtime。
 *
 * @returns Provider 持有的 GameState 畫面模型與刷新操作。
 * @throws 在 GameRuntimeProvider 外呼叫時拋出明確錯誤。
 */
export const useGameRuntime = (): GameRuntime => {
  const runtime = useContext(GameRuntimeContext)

  if (!runtime) {
    throw new Error('useGameRuntime 必須在 GameRuntimeProvider 內使用')
  }

  return runtime
}

/**
 * 顯示 GameState Runtime 的區塊級載入或錯誤狀態。
 *
 * @param props - 標題、說明與選用的重試操作。
 * @returns 可存取且不會暴露未完成 GameState 的狀態頁。
 */
const RuntimeStatus = ({ eyebrow, title, message, onRetry }: RuntimeStatusProps) => (
  <main
    aria-busy={onRetry ? undefined : true}
    className='ink-wash grid min-h-dvh place-items-center bg-ink-950 px-4 text-neutral-200'
  >
    <Panel eyebrow={eyebrow} title={title}>
      <p
        aria-live={onRetry ? 'assertive' : 'polite'}
        className='text-sm leading-6 text-neutral-400'
        role={onRetry ? 'alert' : 'status'}
      >
        {message}
      </p>
      {onRetry ? (
        <Button
          className='mt-4'
          onClick={() => {
            void onRetry()
          }}
        >
          重新載入
        </Button>
      ) : null}
    </Panel>
  </main>
)

/**
 * 判斷 GameState 查詢是否可以重試。
 *
 * @param failureCount - 已失敗次數。
 * @param error - 最後一次 API 錯誤。
 * @returns 僅網路錯誤或 5xx 的第一次失敗可以重試。
 */
const shouldRetryGameState = (failureCount: number, error: unknown): boolean => {
  const apiError = getApiClientError(error)
  return (apiError.status === null || apiError.status >= 500) && failureCount < 1
}

/**
 * 集中持有正式遊戲的 GameState、catalog、投影與刷新生命週期。
 *
 * @param props - 只有 GameState 可用後才會顯示的遊戲子頁。
 * @returns Game Runtime context 或對應的載入／錯誤狀態。
 *
 * 當後端指出角色不存在時會回頭刷新 Session，讓路由守衛導向
 * 角色建立頁；Provider 卸載時也會移除含角色資料的 GameState 快取。
 */
export function GameRuntimeProvider({ children }: PropsWithChildren) {
  const { character, reloadSession } = useSession()
  const queryClient = useQueryClient()
  const characterId = character?.id ?? ''
  const hasRequestedSessionRefreshRef = useRef(false)
  const gameStateQuery = useFetch(getGameStateUsecase, undefined, {
    queryKey: [...gameStateQueryKey, characterId],
    enabled: Boolean(characterId),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    retry: shouldRetryGameState,
    enableGlobalError: false,
  })
  const catalogQuery = useFetch(
    getItemsUsecase,
    {},
    {
      queryKey: itemCatalogQueryKey,
      staleTime: Number.POSITIVE_INFINITY,
      retry: 1,
    },
  )
  const gameStateError = gameStateQuery.isError ? getApiClientError(gameStateQuery.error) : null
  const isCharacterMissing = gameStateError?.status === 404 && gameStateError.code === 'CHARACTER_NOT_FOUND'

  useEffect(() => {
    if (!isCharacterMissing || hasRequestedSessionRefreshRef.current) {
      return
    }

    hasRequestedSessionRefreshRef.current = true
    void reloadSession()
  }, [isCharacterMissing, reloadSession])

  useEffect(
    () => () => {
      // GameState 含角色私有資源；離開 Runtime 時移除快取，
      // 避免登出後下一個帳號短暫讀到上一個帳號的狀態。
      queryClient.removeQueries({
        queryKey: gameStateQueryKey,
      })
    },
    [queryClient],
  )

  const viewState = useMemo(() => {
    if (!gameStateQuery.data) {
      return null
    }

    // 投影集中在 Runtime：先取得權威 GameState，再以 catalog
    // 補上名稱與顯示資訊，頁面不直接理解後端 DTO。
    return createGameViewState(gameStateQuery.data.data, catalogQuery.data?.data.items ?? [])
  }, [catalogQuery.data, gameStateQuery.data])

  const runtime = useMemo<GameRuntime | null>(() => {
    if (!viewState) {
      return null
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
      reloadGameState: async () => {
        await gameStateQuery.refetch()
      },
    }
  }, [catalogQuery, gameStateQuery, viewState])

  if (gameStateQuery.isPending || isCharacterMissing || !characterId) {
    return <RuntimeStatus eyebrow='GAME RUNTIME' message='正在同步角色與遊戲狀態。' title='載入遊戲資料' />
  }

  if (gameStateQuery.isError || !runtime) {
    return (
      <RuntimeStatus
        eyebrow='GAME RUNTIME ERROR'
        message={gameStateError?.message ?? '遊戲狀態暫時無法載入，請稍後再試。'}
        onRetry={async () => {
          hasRequestedSessionRefreshRef.current = false
          await gameStateQuery.refetch()
        }}
        title='無法載入遊戲'
      />
    )
  }

  return <GameRuntimeContext.Provider value={runtime}>{children}</GameRuntimeContext.Provider>
}
