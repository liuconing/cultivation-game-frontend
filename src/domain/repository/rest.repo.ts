import { apiClient } from '@/lib/axios'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

/** 使用靈石立即完成休養後的結算資料。 */
export interface CompleteRestData {
  /** 本次立即完成休養消耗的靈石。 */
  cost: number
  /** 完成休養後的生命值。 */
  currentHp: number
  /** 完成休養後的靈力值。 */
  currentMp: number
  /** 扣除費用後剩餘的靈石。 */
  spiritStones: number
  /** 完成休養後固定清除為 null 的休養開始時間。 */
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
