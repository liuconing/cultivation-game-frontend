import { apiClient } from '@/lib/axios'
import type {
  CharacterEquippedItemIds,
  CharacterResponse,
  CharacterStats,
} from './character.repo'
import type { ApiSuccess, IsoDateString } from './common'
import { apiEndpoints } from './endpoints'
import type { ItemEffect } from './itemCatalog.repo'

export interface GameInventoryEntry {
  templateId: string
  quantity: number
}

export interface GameEquipmentInstance {
  instanceId: string
  templateId: string
  rolledAffixes: ItemEffect[]
  acquiredAt: IsoDateString
}

export interface RestPreview {
  currentHp: number
  currentMp: number
  instantCompleteCost: number
}

export interface GameMap {
  id: string
  name: string
  unlockRealm: string
  recommendedRealm: string
  baseCultivation: number
  baseSpiritStones: number
  unlocked: boolean
}

/** 初次載入遊戲畫面所需的完整狀態。 */
export interface GameStateData {
  serverTime: IsoDateString
  character: CharacterResponse
  derivedStats: CharacterStats
  inventory: GameInventoryEntry[]
  equipmentInstances: GameEquipmentInstance[]
  equipment: CharacterEquippedItemIds
  equippedCultivationMethodId: string | null
  learnedSkillIds: string[]
  equippedActiveSkillId: string | null
  equippedPassiveSkillId: string | null
  unlockedMapIds: string[]
  maps: GameMap[]
  firstClearBossIds: string[]
  claimableCultivation: number
  claimableCultivationSeconds: number
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
