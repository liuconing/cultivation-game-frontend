import { apiClient } from '@/lib/axios'
import type {
  CharacterEquippedItemIds,
  CharacterResponse,
  CharacterStats,
} from './character.repo'
import type { ApiSuccess, IsoDateString } from './common'
import { apiEndpoints } from './endpoints'
import type { ItemEffect } from './itemCatalog.repo'

/** 背包內可堆疊物品的數量資料。 */
export interface GameInventoryEntry {
  /** 物品模板 ID。 */
  templateId: string
  /** 玩家目前持有數量。 */
  quantity: number
}

/** 玩家持有的一件不可堆疊裝備實例。 */
export interface GameEquipmentInstance {
  /** 裝備實例的唯一識別碼。 */
  instanceId: string
  /** 裝備所對應的物品模板 ID。 */
  templateId: string
  /** 建立實例時由後端固定下來的隨機詞條。 */
  rolledAffixes: ItemEffect[]
  /** 玩家取得裝備的時間。 */
  acquiredAt: IsoDateString
}

/** 洞府自然休養與立即完成的預覽。 */
export interface RestPreview {
  /** 生命每分鐘恢復的最大值百分比。 */
  healthRecoveryPercentPerMinute: number
  /** 靈力每分鐘恢復的最大值百分比。 */
  spiritRecoveryPercentPerMinute: number
  /** 套用自然恢復後的目前生命。 */
  currentHp: number
  /** 套用自然恢復後的目前靈力。 */
  currentMp: number
  /** 角色派生屬性的生命上限。 */
  maxHp: number
  /** 角色派生屬性的靈力上限。 */
  maxMp: number
  /** 是否已經完全恢復。 */
  isFullyRestored: boolean
  /** 依伺服器時間推算的生命剩餘恢復秒數。 */
  healthSecondsToFull: number
  /** 依伺服器時間推算的靈力剩餘恢復秒數。 */
  spiritSecondsToFull: number
  /** 預計生命完全恢復的 ISO 時間；已回滿時為 null。 */
  healthFullyRestoredAt: IsoDateString | null
  /** 預計靈力完全恢復的 ISO 時間；已回滿時為 null。 */
  spiritFullyRestoredAt: IsoDateString | null
  /** 依伺服器時間推算的剩餘恢復秒數。 */
  secondsToFull: number
  /** 預計完全恢復的 ISO 時間；已回滿時為 null。 */
  fullyRestoredAt: IsoDateString | null
  /** 使用靈石立即完成所需費用。 */
  instantCompleteCost: number
}

/** 離線修煉可領取修為的後端預覽。 */
export interface CultivationPreview {
  /** 經功法與靈根倍率計算後的每小時修煉速度。 */
  cultivationPerHour: number
  /** 目前境界的修為上限。 */
  cultivationCap: number
  /** 離線收益最多累積的秒數。 */
  idleCapSeconds: number
  /** 離線收益最多可累積的修為。 */
  idleCapCultivation: number
  /** 目前可領取的修為。 */
  claimableCultivation: number
  /** 目前累積的有效離線秒數。 */
  claimableSeconds: number
}

/** 靈根品質升級的資源與條件預覽。 */
export interface SpiritualRootUpgradePreview {
  /** 下一階靈根品質；已達上限時為 null。 */
  nextQuality: string | null
  /** 升級需要的靈根精華。 */
  requiredEssence: number
  /** 玩家目前持有的靈根精華。 */
  availableEssence: number
  /** 目前是否符合升級條件。 */
  canUpgrade: boolean
  /** 無法升級時供畫面顯示的原因；可升級時為 null。 */
  unavailableReason: string | null
}

/** 遊戲狀態中可顯示與配置的技能資料。 */
export interface GameSkill {
  /** 技能模板 ID。 */
  id: string
  /** 技能顯示名稱。 */
  name: string
  /** 技能類型。 */
  type: 'active' | 'passive'
  /** 主動技能的靈力消耗；被動技能為 null。 */
  mpCost: number | null
  /** 主動技能的冷卻回合；被動技能為 0。 */
  cooldownTurns: number
  /** 技能效果的中文說明。 */
  description: string
  /** 玩家是否已學會此技能。 */
  learned: boolean
  /** 技能目前是否裝備在對應欄位。 */
  equipped: boolean
}

/** 探索頁使用的地圖狀態與後端倍率。 */
export interface GameMap {
  /** 地圖唯一識別碼。 */
  id: string
  /** 地圖顯示名稱。 */
  name: string
  /** 解鎖地圖需要的境界。 */
  unlockRealm: string
  /** 建議挑戰境界。 */
  recommendedRealm: string
  /** 地圖基礎修為獎勵。 */
  baseCultivation: number
  /** 地圖基礎靈石獎勵。 */
  baseSpiritStones: number
  /** 玩家是否已解鎖地圖。 */
  unlocked: boolean
  /** 角色與地圖建議境界之間的階級差。 */
  realmDifference: number
  /** 境界壓制後的挑戰獎勵倍率。 */
  challengeRewardMultiplier: number
  /** 境界壓制後的掉落倍率。 */
  dropMultiplier: number
}

/** `GET /game/state` 回傳的完整遊戲狀態。 */
export interface GameStateData {
  /** 後端產生回應時的 ISO 時間。 */
  serverTime: IsoDateString
  /** 已登入玩家的角色資料。 */
  character: CharacterResponse
  /** 套用裝備與功法後的派生屬性。 */
  derivedStats: CharacterStats
  /** 玩家持有的可堆疊物品。 */
  inventory: GameInventoryEntry[]
  /** 玩家持有的不可堆疊裝備。 */
  equipmentInstances: GameEquipmentInstance[]
  /** 六個裝備欄目前穿戴的 instance ID。 */
  equipment: CharacterEquippedItemIds
  /** 目前裝備的功法模板 ID。 */
  equippedCultivationMethodId: string | null
  /** 玩家已學會的技能模板 ID。 */
  learnedSkillIds: string[]
  /** 目前裝備的主動技能模板 ID。 */
  equippedActiveSkillId: string | null
  /** 目前裝備的被動技能模板 ID。 */
  equippedPassiveSkillId: string | null
  /** 玩家已解鎖的地圖 ID。 */
  unlockedMapIds: string[]
  /** 玩家已首通的 Boss ID。 */
  firstClearBossIds: string[]
  /** 目前可領取的修為。 */
  claimableCultivation: number
  /** 可領取修為對應的有效離線秒數。 */
  claimableCultivationSeconds: number
  /** 完整修煉收益預覽。 */
  cultivationPreview: CultivationPreview
  /** 洞府休養預覽。 */
  restPreview: RestPreview
  /** 靈根升級預覽。 */
  spiritualRootUpgradePreview: SpiritualRootUpgradePreview
  /** 玩家可使用的技能資料。 */
  skills: GameSkill[]
  /** V1 可探索地圖及其狀態。 */
  maps: GameMap[]
}

export interface GetGameStateRes extends ApiSuccess<GameStateData> {}

/** 讀取目前登入玩家的完整遊戲狀態。 */
export const getGameState = async (): Promise<GetGameStateRes> => {
  const { data } = await apiClient.get<GetGameStateRes>(
    apiEndpoints.getGameState.path(),
  )

  return data
}
