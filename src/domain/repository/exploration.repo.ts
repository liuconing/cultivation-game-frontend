import { apiClient } from '@/lib/axios'
import type { CharacterStats, MinorRealm, Realm } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'
import type { ItemEffect } from './itemCatalog.repo'

export interface BattleLogEntry {
  round: number
  actorId: string
  targetId: string
  action: 'attack'
  hit: boolean
  critical: boolean
  damage: number
  targetHp: number
  message: string
}

export interface ExplorationReward {
  type: 'cultivation' | 'spirit_stones' | 'spiritual_root_essence' | 'item'
  amount: number
  templateId?: string
}

export interface CreatedEquipmentResult {
  instanceId: string
  templateId: string
  rolledAffixes: ItemEffect[]
}

export interface ExplorationCharacterAfter {
  realm: Realm
  minorRealm: MinorRealm
  cultivation: number
  spiritStones: number
  spiritualRootEssence: number
  stats: CharacterStats
}

export interface ExploreParams {
  mapId: string
}

export interface ExplorationData {
  seedReference: string
  eventType: 'battle' | 'resource' | 'item' | 'encounter' | 'empty'
  result: 'win' | 'loss' | 'none'
  battleLog?: BattleLogEntry[]
  rewards: ExplorationReward[]
  createdEquipment: CreatedEquipmentResult[]
  characterAfter: ExplorationCharacterAfter
}

export type ExploreRes = ApiSuccess<ExplorationData>

/** 進行一次指定地圖的探索。 */
export const explore = async (
  params: ExploreParams,
  options: MutationOptions,
): Promise<ExploreRes> => {
  const { data } = await apiClient.post<ExploreRes>(
    apiEndpoints.explore.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
