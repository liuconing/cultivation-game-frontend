import { apiClient } from '@/lib/axios'
import type { MinorRealm } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type IsoDateString,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

export interface ClaimCultivationData {
  awardedCultivation: number
  calculatedSeconds: number
  cultivationPerSecond: number
  cultivation: number
  cultivationCap: number
  minorRealm: MinorRealm
  lastCultivationClaimAt: IsoDateString
}

export type ClaimCultivationRes = ApiSuccess<ClaimCultivationData>

/** 領取目前累積的離線修為。 */
export const claimCultivation = async (
  options: MutationOptions,
): Promise<ClaimCultivationRes> => {
  const { data } = await apiClient.post<ClaimCultivationRes>(
    apiEndpoints.claimCultivation.path(),
    {},
    { headers: createMutationHeaders(options) },
  )

  return data
}
