import { apiClient } from '@/lib/axios'
import type { CharacterStats } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

/** 裝備功法需要的 request body。 */
export interface EquipCultivationMethodParams {
  /** 要裝備的功法模板 ID。 */
  cultivationMethodTemplateId: string
}

/** 裝備功法後的倍率與屬性結算。 */
export interface EquipCultivationMethodData {
  /** 結算後已裝備的功法模板 ID。 */
  equippedCultivationMethodId: string
  /** 此功法提供的修煉速度倍率。 */
  cultivationMultiplier: number
  /** 此功法提供的突破率加成。 */
  breakthroughBonus: number
  /** 裝備功法後重新計算的角色最終屬性。 */
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
