import { apiClient } from '@/lib/axios'
import type { CharacterStats } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

export interface EquipCultivationMethodParams {
  cultivationMethodTemplateId: string
}

export interface EquipCultivationMethodData {
  equippedCultivationMethodId: string
  cultivationMultiplier: number
  breakthroughBonus: number
  derivedStats: CharacterStats
}

export type EquipCultivationMethodRes =
  ApiSuccess<EquipCultivationMethodData>

/** 裝備角色持有的功法。 */
export const equipCultivationMethod = async (
  params: EquipCultivationMethodParams,
  options: MutationOptions,
): Promise<EquipCultivationMethodRes> => {
  const { data } = await apiClient.post<EquipCultivationMethodRes>(
    apiEndpoints.equipCultivationMethod.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
