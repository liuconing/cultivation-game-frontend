import { apiClient } from '@/lib/axios'
import type { CharacterStats, SpiritualRootQuality } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

export interface SpiritualRootUpgradeData {
  beforeQuality: SpiritualRootQuality
  afterQuality: SpiritualRootQuality
  consumedEssence: number
  spiritualRootEssence: number
  nextQuality: SpiritualRootQuality | null
  nextCost: number | null
  multipliers: {
    cultivation: { before: number; after: number }
    statGrowth: { before: number; after: number }
  }
  derivedStats: {
    before: CharacterStats
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
