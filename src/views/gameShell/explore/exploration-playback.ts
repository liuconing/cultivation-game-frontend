/** 探索戰鬥每筆敘述出現的固定間隔。 */
export const explorationPlaybackIntervalMs = 450

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
