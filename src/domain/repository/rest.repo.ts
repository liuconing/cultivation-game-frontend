import { apiClient } from '@/lib/axios'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

export interface CompleteRestData {
  cost: number
  currentHp: number
  currentMp: number
  spiritStones: number
  restingSince: null
}

export type CompleteRestRes = ApiSuccess<CompleteRestData>

/** 使用靈石立即完成休養。 */
export const completeRest = async (
  options: MutationOptions,
): Promise<CompleteRestRes> => {
  const { data } = await apiClient.post<CompleteRestRes>(
    apiEndpoints.completeRest.path(),
    {},
    { headers: createMutationHeaders(options) },
  )

  return data
}
