import { apiClient } from '@/lib/axios'
import type {
  CharacterEquippedItemIds,
  CharacterEquipmentSlot,
  CharacterStats,
} from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'
import type { GameEquipmentInstance } from './gameState.repo'
import type { ItemEffect } from './itemCatalog.repo'

export interface EquipmentInstanceParams {
  instanceId: string
}

export interface EquipmentComparisonData {
  selected: GameEquipmentInstance
  equipped: GameEquipmentInstance | null
  fixedEffects: ItemEffect[]
  rolledAffixes: ItemEffect[]
  statDifference: Record<keyof CharacterStats, number>
  salePrice: number
  canEquip: boolean
  restrictionReason: 'INVALID_REALM' | null
}

export interface EquipEquipmentData {
  slot: CharacterEquipmentSlot
  equippedInstanceId: string
  replacedInstanceId: string | null
  affectedInstances: Array<{
    instanceId: string
    equipped: boolean
  }>
  equipment: CharacterEquippedItemIds
  derivedStats: CharacterStats
  selected: GameEquipmentInstance
}

export interface SellEquipmentData {
  removedInstanceId: string
  salePrice: number
  spiritStones: number
}

export type CompareEquipmentRes = ApiSuccess<EquipmentComparisonData>
export type EquipEquipmentRes = ApiSuccess<EquipEquipmentData>
export type SellEquipmentRes = ApiSuccess<SellEquipmentData>

/** 比較背包裝備與目前穿戴裝備。 */
export const compareEquipment = async (
  instanceId: string,
): Promise<CompareEquipmentRes> => {
  const { data } = await apiClient.get<CompareEquipmentRes>(
    apiEndpoints.compareEquipment.path(instanceId),
  )

  return data
}

/** 穿戴指定裝備 instance。 */
export const equipEquipment = async (
  params: EquipmentInstanceParams,
  options: MutationOptions,
): Promise<EquipEquipmentRes> => {
  const { data } = await apiClient.post<EquipEquipmentRes>(
    apiEndpoints.equipEquipment.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}

/** 出售指定裝備 instance。 */
export const sellEquipment = async (
  params: EquipmentInstanceParams,
  options: MutationOptions,
): Promise<SellEquipmentRes> => {
  const { data } = await apiClient.post<SellEquipmentRes>(
    apiEndpoints.sellEquipment.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
