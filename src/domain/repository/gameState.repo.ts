import { apiClient } from '@/lib/axios'
import type {
  CharacterEquippedItemIds,
  CharacterResponse,
  CharacterStats,
} from './character.repo'
import type { ApiSuccess, IsoDateString } from './common'
import { apiEndpoints } from './endpoints'
import type { ItemEffect } from './itemCatalog.repo'

/** 背包中可堆疊道具的數量資料。 */
export interface GameInventoryEntry {
  /** 道具模板 ID。 */
  templateId: string
  /** 背包目前持有數量。 */
  quantity: number
}

/** 角色持有的單一不可堆疊裝備 instance。 */
export interface GameEquipmentInstance {
  /** 裝備 instance 唯一識別碼。 */
  instanceId: string
  /** 裝備對應的模板 ID。 */
  templateId: string
  /** 建立 instance 時產生的隨機詞條。 */
  rolledAffixes: ItemEffect[]
  /** 取得此裝備的時間。 */
  acquiredAt: IsoDateString
}

/** 休養狀態的即時預覽。 */
export interface RestPreview {
  /** 依經過時間預計自然恢復後的生命值。 */
  currentHp: number
  /** 依經過時間預計自然恢復後的靈力值。 */
  currentMp: number
  /** 立即補滿生命與靈力所需的靈石。 */
  instantCompleteCost: number
}

/** 遊戲地圖的顯示與解鎖資料。 */
export interface GameMap {
  /** 地圖唯一識別碼。 */
  id: string
  /** 地圖顯示名稱。 */
  name: string
  /** 解鎖地圖所需的大境界。 */
  unlockRealm: string
  /** 建議進入地圖的大境界。 */
  recommendedRealm: string
  /** 地圖事件的基礎修為獎勵。 */
  baseCultivation: number
  /** 地圖事件的基礎靈石獎勵。 */
  baseSpiritStones: number
  /** 目前角色是否已解鎖此地圖。 */
  unlocked: boolean
}

/** 初次載入遊戲畫面所需的完整狀態。 */
export interface GameStateData {
  /** 後端產生此份狀態的伺服器時間。 */
  serverTime: IsoDateString
  /** 目前登入使用者的完整角色資料。 */
  character: CharacterResponse
  /** 套用裝備、功法與靈根後的最終屬性。 */
  derivedStats: CharacterStats
  /** 背包中的可堆疊道具。 */
  inventory: GameInventoryEntry[]
  /** 角色持有的所有裝備 instance。 */
  equipmentInstances: GameEquipmentInstance[]
  /** 各裝備欄目前穿戴的 instance ID。 */
  equipment: CharacterEquippedItemIds
  /** 目前裝備的功法模板 ID。 */
  equippedCultivationMethodId: string | null
  /** 角色已學會的技能 ID。 */
  learnedSkillIds: string[]
  /** 目前配置的主動技能 ID。 */
  equippedActiveSkillId: string | null
  /** 目前配置的被動技能 ID。 */
  equippedPassiveSkillId: string | null
  /** 已解鎖的地圖 ID。 */
  unlockedMapIds: string[]
  /** 所有 V1 地圖及其解鎖狀態。 */
  maps: GameMap[]
  /** 已首次通關的 Boss ID。 */
  firstClearBossIds: string[]
  /** 目前可以領取的修為數量。 */
  claimableCultivation: number
  /** 本次修為計算採計的離線秒數。 */
  claimableCultivationSeconds: number
  /** 目前休養恢復與立即完成費用預覽。 */
  restPreview: RestPreview
}

export type GetGameStateRes = ApiSuccess<GameStateData>

/** 取得目前登入角色的完整遊戲狀態。 */
export const getGameState = async (): Promise<GetGameStateRes> => {
  const { data } = await apiClient.get<GetGameStateRes>(
    apiEndpoints.getGameState.path(),
  )

  return data
}
