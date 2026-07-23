/** 後端序列化後的 ISO 8601 日期字串。 */
export type IsoDateString = string

/** API 成功回應 envelope。 */
export interface ApiSuccess<T> {
  ok: true
  data: T
}

/** API 失敗回應 envelope。 */
export interface ApiFailure {
  ok: false
  code: string
  message: string
  details?: unknown
}

/** API 完整回應型別。 */
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

/** 所有資源異動請求必須提供的冪等設定。 */
export interface MutationOptions {
  idempotencyKey: string
}

/** 建立資源異動請求使用的 Idempotency-Key header。 */
export const createMutationHeaders = ({
  idempotencyKey,
}: MutationOptions) => ({
  'Idempotency-Key': idempotencyKey,
})
