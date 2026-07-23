import { apiClient } from '@/lib/axios'
import type { CharacterStats, SpiritualRootQuality } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

/** 靈根品質升級完成後的消耗、倍率與屬性結算。 */
export interface SpiritualRootUpgradeData {
  /** 升級前的靈根品質。 */
  beforeQuality: SpiritualRootQuality
  /** 升級後的靈根品質。 */
  afterQuality: SpiritualRootQuality
  /** 本次升級消耗的靈根精華。 */
  consumedEssence: number
  /** 升級完成後剩餘的靈根精華。 */
  spiritualRootEssence: number
  /** 下一階靈根品質，已達最高品質時為 null。 */
  nextQuality: SpiritualRootQuality | null
  /** 下一次升級所需精華，已達最高品質時為 null。 */
  nextCost: number | null
  /** 升級前後的靈根倍率差異。 */
  multipliers: {
    /** 升級前後的修煉速度倍率。 */
    cultivation: {
      /** 升級前的修煉速度倍率。 */
      before: number
      /** 升級後的修煉速度倍率。 */
      after: number
    }
    /** 升級前後的角色屬性成長倍率。 */
    statGrowth: {
      /** 升級前的角色屬性成長倍率。 */
      before: number
      /** 升級後的角色屬性成長倍率。 */
      after: number
    }
  }
  /** 升級前後重新計算的角色最終屬性。 */
  derivedStats: {
    /** 升級前的角色最終屬性。 */
    before: CharacterStats
    /** 升級後的角色最終屬性。 */
    after: CharacterStats
  }
}

export type UpgradeSpiritualRootRes = ApiSuccess<SpiritualRootUpgradeData>

/** 提升目前角色的靈根品質。 */
export const upgradeSpiritualRoot = async (
  options: MutationOptions,
): Promise<UpgradeSpiritualRootRes> => {
  const { data } = await apiClient.post<UpgradeSpiritualRootRes>(
    apiEndpoints.upgradeSpiritualRoot.path(),
    {},
    { headers: createMutationHeaders(options) },
  )

  return data
}
