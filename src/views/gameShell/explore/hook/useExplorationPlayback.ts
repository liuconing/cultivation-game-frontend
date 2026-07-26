import { useEffect, useRef, useState, type RefObject } from 'react'
import type { GameViewBattleLogEntry } from '@/utils'

/** 探索戰鬥播放 hook 的輸入。 */
export interface UseExplorationPlaybackInput {
  /** 是否正在顯示探索結果。 */
  isOpen: boolean
  /** 戰鬥結果 ID；新 ID 會重啟播放。 */
  battleId: string | null
  /** 後端已完成結算的完整戰鬥紀錄。 */
  battleLog: GameViewBattleLogEntry[]
}

/** 探索戰鬥播放 hook 對畫面公開的狀態。 */
export interface ExplorationPlayback {
  /** 目前依序顯示的戰鬥紀錄。 */
  visibleBattleLog: GameViewBattleLogEntry[]
  /** 目前已顯示的紀錄筆數。 */
  visibleCount: number
  /** 目前處於逐筆播放、結算等待或結果揭示階段。 */
  phase: ExplorationPlaybackPhase
  /** 勝敗、結算與獎勵是否可以同時顯示。 */
  isOutcomeRevealed: boolean
  /** 應掛在捲動容器上的 ref，用於新紀錄出現時自動捲到底部。 */
  scrollContainerRef: RefObject<HTMLOListElement | null>
}

/** Hook 內部用來隔離不同戰鬥播放來源的狀態。 */
interface InternalPlaybackState {
  /** 開關、戰鬥 ID 與紀錄長度組成的播放來源。 */
  source: string
  /** 目前戰鬥的純播放狀態。 */
  state: ExplorationPlaybackState
}

/** 探索戰鬥每筆敘述出現的固定間隔。 */
export const explorationPlaybackIntervalMs = 450

/** 探索戰報從等待到結果揭示的播放階段。 */
export type ExplorationPlaybackPhase = 'idle' | 'playing' | 'settling' | 'revealed'

/** 探索戰報播放狀態機的純資料。 */
export interface ExplorationPlaybackState {
  /** 目前播放階段，只有 revealed 可以顯示勝敗與獎勵。 */
  phase: ExplorationPlaybackPhase
  /** 目前已顯示的戰報筆數。 */
  visibleCount: number
}

/**
 * 計算播放開始時應顯示的戰鬥行動數。
 *
 * @param totalEntries - 後端戰鬥紀錄總筆數。
 * @returns 有紀錄時先顯示第一筆，空紀錄則為零。
 */
const getInitialPlaybackCount = (totalEntries: number): number => Math.min(1, Math.max(0, totalEntries))

/**
 * 建立一場戰鬥剛開啟時的播放狀態。
 *
 * @param totalEntries - 後端戰鬥紀錄總筆數。
 * @returns 空戰報直接揭示；其餘先顯示第一筆並開始或等待結算。
 */
const createExplorationPlaybackState = (totalEntries: number): ExplorationPlaybackState => {
  const visibleCount = getInitialPlaybackCount(totalEntries)

  if (totalEntries <= 0) {
    return { phase: 'revealed', visibleCount: 0 }
  }

  return {
    phase: visibleCount >= totalEntries ? 'settling' : 'playing',
    visibleCount,
  }
}

/**
 * 計算下一個播放刻度的可見筆數。
 *
 * @param currentCount - 目前已顯示筆數。
 * @param totalEntries - 後端戰鬥紀錄總筆數。
 * @returns 每次最多增加一筆且不超過總數。
 */
const getNextPlaybackCount = (currentCount: number, totalEntries: number): number =>
  Math.min(Math.max(0, currentCount) + 1, Math.max(0, totalEntries))

/**
 * 將播放狀態推進一個 450ms 刻度。
 *
 * @param current - 目前播放狀態。
 * @param totalEntries - 後端戰鬥紀錄總筆數。
 * @returns 下一個播放狀態；最後一筆後保留一個 settling 刻度。
 */
const advanceExplorationPlayback = (
  current: ExplorationPlaybackState,
  totalEntries: number,
): ExplorationPlaybackState => {
  if (current.phase === 'idle' || current.phase === 'revealed') {
    return current
  }

  if (current.phase === 'settling') {
    return { ...current, phase: 'revealed' }
  }

  const visibleCount = getNextPlaybackCount(current.visibleCount, totalEntries)

  return {
    visibleCount,
    phase: visibleCount >= totalEntries ? 'settling' : 'playing',
  }
}

/**
 * 管理探索戰鬥 450ms 逐筆播放、自動捲動與關閉清理。
 *
 * @param input - 結果開關、戰鬥 ID 與完整戰鬥紀錄。
 * @returns 畫面目前可見的紀錄、完成狀態與捲動 ref。
 *
 * 計時器會在關閉、切換戰鬥或元件卸載時清除，避免舊結果繼續
 * 修改新一輪播放狀態。
 */
export function useExplorationPlayback({
  isOpen,
  battleId,
  battleLog,
}: UseExplorationPlaybackInput): ExplorationPlayback {
  const [playback, setPlayback] = useState<InternalPlaybackState>({
    /** 初始關閉來源不會啟動計時器。 */
    source: 'closed:none:0',
    /** 關閉時不顯示戰報或結果。 */
    state: { phase: 'idle', visibleCount: 0 },
  })
  const scrollContainerRef = useRef<HTMLOListElement>(null)
  const source = `${isOpen ? 'open' : 'closed'}:${battleId ?? 'none'}:${battleLog.length}`
  const initialState = isOpen
    ? createExplorationPlaybackState(battleLog.length)
    : { phase: 'idle' as const, visibleCount: 0 }
  const activeState = playback.source === source ? playback.state : initialState

  if (playback.source !== source) {
    // React 會在提交畫面前以新來源重跑本次 render，避免切換戰鬥時
    // 短暫顯示上一場的勝敗或播放進度。
    setPlayback({
      source,
      state: initialState,
    })
  }

  useEffect(() => {
    if (!isOpen || activeState.phase === 'idle' || activeState.phase === 'revealed') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      // playing 每次增加一筆；settling 再保留一個完整刻度，
      // 確保最後一筆戰報可讀完後才揭示勝敗與獎勵。
      setPlayback((current) =>
        current.source === source
          ? {
              ...current,
              state: advanceExplorationPlayback(current.state, battleLog.length),
            }
          : current,
      )
    }, explorationPlaybackIntervalMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeState.phase, activeState.visibleCount, battleLog.length, isOpen, source])

  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) {
      return
    }

    scrollContainerRef.current.scrollTo({
      behavior: 'smooth',
      top: scrollContainerRef.current.scrollHeight,
    })
  }, [isOpen, activeState.visibleCount])

  return {
    visibleBattleLog: battleLog.slice(0, activeState.visibleCount),
    visibleCount: activeState.visibleCount,
    phase: activeState.phase,
    isOutcomeRevealed: activeState.phase === 'revealed',
    scrollContainerRef,
  }
}
