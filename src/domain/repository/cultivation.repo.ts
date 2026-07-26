import { apiClient } from '@/lib/axios'
import type { MinorRealm } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type IsoDateString,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

/** 領取離線修為後的結算資料。 */
export interface ClaimCultivationData {
  /** 本次實際獲得的修為。 */
  awardedCultivation: number
  /** 本次修為計算採計的秒數。 */
  calculatedSeconds: number
  /** 套用靈根與功法後的每秒修為。 */
  cultivationPerSecond: number
  /** 結算後的角色總修為。 */
  cultivation: number
  /** 目前境界可累積的修為上限。 */
  cultivationCap: number
  /** 結算後的小境界。 */
  minorRealm: MinorRealm
  /** 本次領取完成的時間。 */
  lastCultivationClaimAt: IsoDateString
}

export interface ClaimCultivationRes extends ApiSuccess<ClaimCultivationData> {}

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
