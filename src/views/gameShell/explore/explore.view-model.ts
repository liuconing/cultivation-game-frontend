import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { exploreUsecase } from '@/domain'
import type { ExplorationData } from '@/domain/repository'
import { getApiClientError } from '@/lib/axios'
import { useGameMutation } from '@/hook'
import { useGameRuntime } from '@/containers'
import { createExplorationResultView } from './explorationResultAdapter'
import { useExplorationPlayback } from './hook/useExplorationPlayback'

/** 玩家送出的探索操作意圖。 */
interface ExploreIntent {
  /** 玩家選擇的地圖 ID。 */
  mapId: string
}

/** 管理地圖選擇、探索提交與戰鬥結果播放。 */
export function useExploreViewModel() {
  const navigate = useNavigate()
  const { gameState } = useGameRuntime()
  const [selectedMapId, setSelectedMapId] = useState(gameState.maps[0]?.id ?? '')
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [explorationResult, setExplorationResult] = useState<ExplorationData | null>(null)
  const [exploreError, setExploreError] = useState<string | null>(null)
  const exploreTriggerRef = useRef<HTMLElement>(null)
  const selectedMap = gameState.maps.find((map) => map.id === selectedMapId) ?? gameState.maps[0]
  const resultView = useMemo(
    () => (explorationResult ? createExplorationResultView(explorationResult) : null),
    [explorationResult],
  )
  const battle = resultView?.battle ?? null
  const {
    visibleBattleLog,
    visibleCount: visibleBattleLogCount,
    phase: battlePlaybackPhase,
    isOutcomeRevealed,
    scrollContainerRef: battleLogRef,
  } = useExplorationPlayback({
    isOpen: isResultOpen,
    battleId: battle?.id ?? null,
    battleLog: battle?.log ?? [],
  })
  const isEncounter = resultView?.kind === 'event'
  const canRevealBattleOutcome = isEncounter || isOutcomeRevealed
  const hasLowResources =
    gameState.character.health / gameState.character.maxHealth < 0.3 ||
    gameState.character.spiritPower / gameState.character.maxSpiritPower < 0.2
  const exploreMutation = useGameMutation<ExploreIntent, Awaited<ReturnType<typeof exploreUsecase>>>({
    operation: 'explore',
    request: ({ mapId }, { idempotencyKey }) => exploreUsecase({ mapId }, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setExploreError(null)
      setExplorationResult(response.data)
      setIsResultOpen(true)
    },
    onError: (error) => {
      setExploreError(getApiClientError(error).message)
    },
  })
  const canExplore = Boolean(selectedMap) && selectedMap?.status !== 'locked' && !exploreMutation.isPending

  const handleCloseResult = useCallback(() => {
    setIsResultOpen(false)
  }, [])

  const handleExplore = () => {
    if (!canExplore || !selectedMap) {
      return
    }

    // Mutation pending 會讓按鈕暫時 disabled 並失焦；先保留觸發元素，
    // 讓全螢幕結果關閉時仍能回到原操作位置。
    exploreTriggerRef.current = document.activeElement as HTMLElement | null
    setExploreError(null)
    exploreMutation.execute({
      mapId: selectedMap.id,
    })
  }

  const handleGoToLoadout = () => {
    setIsResultOpen(false)
    navigate('/game/loadout')
  }

  return {
    /** 角色摘要。 */
    character: gameState.character,
    /** 地圖列表。 */
    maps: gameState.maps,
    /** 目前選中的地圖。 */
    selectedMap,
    /** 是否開啟結果 Modal。*/
    isResultOpen,
    /** 探索錯誤訊息。 */
    exploreError,
    /** 結果畫面模型。 */
    resultView,
    /** 可見的戰鬥紀錄。 */
    visibleBattleLog,
    /** 已顯示的戰鬥紀錄筆數。 */
    visibleBattleLogCount,
    /** 戰鬥播放階段。 */
    battlePlaybackPhase,
    /** 勝敗與獎勵是否可揭示。 */
    isOutcomeRevealed,
    /** 戰鬥紀錄捲動容器 ref。*/
    battleLogRef,
    /** 結果關閉後需還原焦點的觸發元素。 */
    exploreTriggerRef,
    /** 是否為非戰鬥事件。 */
    isEncounter,
    /** 是否可揭示戰鬥結果標題與徽章。 */
    canRevealBattleOutcome,
    /** 生命或靈力是否偏低。 */
    hasLowResources,
    /** 是否可送出探索。 */
    canExplore,
    /** 探索請求是否進行中。 */
    isExplorePending: exploreMutation.isPending,
    /** 選擇地圖。 */
    handleSelectMap: setSelectedMapId,
    /** 開始探索。 */
    handleExplore,
    /** 關閉結果 Modal。*/
    handleCloseResult,
    /** 前往整備頁。 */
    handleGoToLoadout,
  }
}

export type IExploreViewModel = ReturnType<typeof useExploreViewModel>
