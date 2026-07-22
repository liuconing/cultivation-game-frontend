import { apiClient } from '@/lib/axios'

/** `GET /health` 回傳格式。 */
export interface GetHealthRes {
  /** 固定為 true，代表服務正常。 */
  ok: true
  /** 服務健康狀態。 */
  status: 'healthy'
  /** MongoDB 連線狀態代碼。 */
  mongo: number
}

/**
 * 取得後端健康狀態與 MongoDB 連線狀態。
 *
 * @returns 後端健康檢查結果。
 */
export const getHealth = async (): Promise<GetHealthRes> => {
  const { data } = await apiClient.get<GetHealthRes>('/health')

  return data
}
