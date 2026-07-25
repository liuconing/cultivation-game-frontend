/** 探索戰鬥每筆敘述出現的固定間隔。 */
export const explorationPlaybackIntervalMs = 450

/** 探索戰報從等待到結果揭示的播放階段。 */
export type ExplorationPlaybackPhase =
  | 'idle'
  | 'playing'
  | 'settling'
  | 'revealed'

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
export const getInitialPlaybackCount = (
  totalEntries: number,
): number => Math.min(1, Math.max(0, totalEntries))

/**
 * 建立一場戰鬥剛開啟時的播放狀態。
 *
 * @param totalEntries - 後端戰鬥紀錄總筆數。
 * @returns 空戰報直接揭示；其餘先顯示第一筆並開始或等待結算。
 */
export const createExplorationPlaybackState = (
  totalEntries: number,
): ExplorationPlaybackState => {
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
export const getNextPlaybackCount = (
  currentCount: number,
  totalEntries: number,
): number =>
  Math.min(
    Math.max(0, currentCount) + 1,
    Math.max(0, totalEntries),
  )

/**
 * 將播放狀態推進一個 450ms 刻度。
 *
 * @param current - 目前播放狀態。
 * @param totalEntries - 後端戰鬥紀錄總筆數。
 * @returns 下一個播放狀態；最後一筆後保留一個 settling 刻度。
 */
export const advanceExplorationPlayback = (
  current: ExplorationPlaybackState,
  totalEntries: number,
): ExplorationPlaybackState => {
  if (
    current.phase === 'idle' ||
    current.phase === 'revealed'
  ) {
    return current
  }

  if (current.phase === 'settling') {
    return { ...current, phase: 'revealed' }
  }

  const visibleCount = getNextPlaybackCount(
    current.visibleCount,
    totalEntries,
  )

  return {
    visibleCount,
    phase:
      visibleCount >= totalEntries ? 'settling' : 'playing',
  }
}
