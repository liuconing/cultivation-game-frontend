import { apiClient } from '@/lib/axios'
import type { ApiSuccess } from './common'
import { apiEndpoints } from './endpoints'

/** 後端健康狀態資料。 */
export interface HealthData {
  /** 後端服務健康狀態。 */
  status: 'healthy'
  /** Mongoose 目前的 MongoDB 連線狀態代碼。 */
  mongo: number
}

export type GetHealthRes = ApiSuccess<HealthData>

/** 取得後端與 MongoDB 健康狀態。 */
export const getHealth = async (): Promise<GetHealthRes> => {
  const { data } = await apiClient.get<GetHealthRes>(
    apiEndpoints.health.path(),
  )

  return data
}
