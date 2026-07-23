import { apiClient } from '@/lib/axios'
import type { MinorRealm, Realm } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

export interface BreakthroughParams {
  pillTemplateId?: string
}

export interface BreakthroughChanceBreakdown {
  base: number
  spiritualRoot: number
  luck: number
  pill: number
  cultivationMethod: number
  pity: number
  unclamped: number
  final: number
}

export interface BreakthroughData {
  succeeded: boolean
  seedReference: string
  roll: number
  chance: BreakthroughChanceBreakdown
  consumption: {
    spiritStones: number
    pillTemplateId: string | null
    pillQuantity: number
  }
  before: {
    realm: Realm
    cultivation: number
  }
  after: {
    realm: Realm
    minorRealm: MinorRealm
    cultivation: number
    cultivationCap: number
    currentHp: number
    currentMp: number
    spiritStones: number
    breakthroughPity: number
  }
}

export type BreakthroughRes = ApiSuccess<BreakthroughData>

/** 嘗試突破目前大境界。 */
export const breakthrough = async (
  params: BreakthroughParams,
  options: MutationOptions,
): Promise<BreakthroughRes> => {
  const { data } = await apiClient.post<BreakthroughRes>(
    apiEndpoints.breakthrough.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
