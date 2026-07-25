import { useEffect, useRef, useState, type RefObject } from 'react'
import type { GameViewBattleLogEntry } from '../game-view-state'
import {
  explorationPlaybackIntervalMs,
  getInitialPlaybackCount,
  getNextPlaybackCount,
} from './exploration-playback'

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
  /** 是否已顯示全部戰鬥紀錄。 */
  isComplete: boolean
  /** 應掛在捲動容器上的 ref，用於新紀錄出現時自動捲到底部。 */
  scrollContainerRef: RefObject<HTMLOListElement | null>
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
  const [playback, setPlayback] = useState({
    /** 用來辨識是否已切換至另一場戰鬥。 */
    source: '',
    /** 目前已依序顯示的紀錄筆數。 */
    visibleCount: 0,
  })
  const scrollContainerRef = useRef<HTMLOListElement>(null)
  const source = `${isOpen ? 'open' : 'closed'}:${battleId ?? 'none'}`

  if (playback.source !== source) {
    setPlayback({
      source,
      visibleCount: isOpen
        ? getInitialPlaybackCount(battleLog.length)
        : 0,
    })
  }

  const visibleCount =
    playback.source === source ? playback.visibleCount : 0
  const isComplete = visibleCount >= battleLog.length

  useEffect(() => {
    if (!isOpen || isComplete) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      // 播放狀態每次只增加一筆，讓長戰鬥保留可讀節奏。
      setPlayback((current) => ({
        ...current,
        visibleCount: getNextPlaybackCount(
          current.visibleCount,
          battleLog.length,
        ),
      }))
    }, explorationPlaybackIntervalMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [battleLog.length, isComplete, isOpen, visibleCount])

  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) {
      return
    }

    scrollContainerRef.current.scrollTo({
      behavior: 'smooth',
      top: scrollContainerRef.current.scrollHeight,
    })
  }, [isOpen, visibleCount])

  return {
    visibleBattleLog: battleLog.slice(0, visibleCount),
    visibleCount,
    isComplete,
    scrollContainerRef,
  }
}
