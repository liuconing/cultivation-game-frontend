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

/** 指定單一裝備 instance 的 request body。 */
export interface EquipmentInstanceParams {
  /** 要操作的裝備 instance 唯一識別碼。 */
  instanceId: string
}

/** 背包裝備與目前穿戴裝備的比較資料。 */
export interface EquipmentComparisonData {
  /** 玩家選擇要比較的裝備 instance。 */
  selected: GameEquipmentInstance
  /** 同部位目前穿戴的裝備 instance，未穿戴時為 null。 */
  equipped: GameEquipmentInstance | null
  /** 套用品質倍率後的裝備固定效果。 */
  fixedEffects: ItemEffect[]
  /** 選擇裝備建立時產生的隨機詞條。 */
  rolledAffixes: ItemEffect[]
  /** 換裝前後每項角色屬性的差值。 */
  statDifference: Record<keyof CharacterStats, number>
  /** 出售選擇裝備可獲得的靈石。 */
  salePrice: number
  /** 目前角色境界是否允許穿戴此裝備。 */
  canEquip: boolean
  /** 無法穿戴的穩定原因碼，可以穿戴時為 null。 */
  restrictionReason: 'INVALID_REALM' | null
}

/** 穿戴裝備完成後的結算資料。 */
export interface EquipEquipmentData {
  /** 本次換裝影響的裝備欄位。 */
  slot: CharacterEquipmentSlot
  /** 本次完成穿戴的裝備 instance ID。 */
  equippedInstanceId: string
  /** 被換下的裝備 instance ID，原欄位為空時為 null。 */
  replacedInstanceId: string | null
  /** 本次換裝後各相關 instance 的穿戴狀態。 */
  affectedInstances: Array<{
    /** 受影響的裝備 instance ID。 */
    instanceId: string
    /** 結算後此 instance 是否處於穿戴中。 */
    equipped: boolean
  }>
  /** 結算後所有裝備欄位對應的 instance ID。 */
  equipment: CharacterEquippedItemIds
  /** 換裝後重新計算的角色最終屬性。 */
  derivedStats: CharacterStats
  /** 本次完成穿戴的裝備 instance 資料。 */
  selected: GameEquipmentInstance
}

/** 出售裝備完成後的結算資料。 */
export interface SellEquipmentData {
  /** 已從背包移除的裝備 instance ID。 */
  removedInstanceId: string
  /** 本次出售獲得的靈石。 */
  salePrice: number
  /** 出售完成後角色持有的靈石。 */
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
