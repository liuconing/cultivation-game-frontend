import type { GameViewMap } from '../game-view-state'

/** 探索地圖狀態標籤的顯示資料。 */
export interface MapStatusPresentation {
  /** 顯示於地圖卡片右上角的境界或鎖定標籤。 */
  label: string
  /** 對應共用 StatusBadge 的視覺色調。 */
  tone: 'jade' | 'gold' | 'cinnabar'
  /** 說明目前地圖的可進入狀態或境界風險。 */
  description: string
}

/**
 * 將後端的解鎖狀態與境界差轉成地圖 ViewModel 狀態。
 *
 * 後端以正數代表地圖境界高於玩家，因此只有正數才屬於挑戰地圖；
 * 負數代表玩家已高於地圖，仍是可進入狀態。
 *
 * @param unlocked - 後端判定角色是否已解鎖地圖。
 * @param realmDifference - 地圖建議境界減去玩家境界的階數。
 * @returns 地圖畫面使用的解鎖、挑戰或鎖定狀態。
 */
export const getGameViewMapStatus = (
  unlocked: boolean,
  realmDifference: number,
): GameViewMap['status'] => {
  if (!unlocked) {
    return 'locked'
  }

  return realmDifference > 0 ? 'challenging' : 'unlocked'
}

/**
 * 依實際境界差建立地圖標籤，避免把所有可進入地圖都寫成同境界。
 *
 * @param map - 地圖的狀態、境界差與建議境界。
 * @returns 可直接交給地圖卡片與 StatusBadge 的中文顯示資料。
 */
export const getMapStatusPresentation = (
  map: Pick<
    GameViewMap,
    'status' | 'realmDifference' | 'recommendedRealm'
  >,
): MapStatusPresentation => {
  if (map.status === 'locked') {
    return {
      label: '未解鎖',
      tone: 'cinnabar',
      description: `需達${map.recommendedRealm}方可進入`,
    }
  }

  if (map.realmDifference > 0) {
    return {
      label:
        map.realmDifference === 1
          ? '高一境界'
          : `高 ${map.realmDifference} 境界`,
      tone: 'gold',
      description: '境界壓制・獎勵提升',
    }
  }

  if (map.realmDifference < 0) {
    const lowerRealmCount = Math.abs(map.realmDifference)

    return {
      label:
        lowerRealmCount === 1
          ? '低一境界'
          : `低 ${lowerRealmCount} 境界`,
      tone: 'jade',
      description: '境界較低・獎勵依規則調整',
    }
  }

  return {
    label: '同境界',
    tone: 'jade',
    description: '可安全進入',
  }
}
