/** 後端序列化後的 ISO 8601 日期字串。 */
export type IsoDateString = string

/** API 成功回應 envelope。 */
export interface ApiSuccess<T> {
  /** 固定為 true，表示請求成功。 */
  ok: true
  /** 後端回傳的成功資料。 */
  data: T
}

/** API 失敗回應 envelope。 */
export interface ApiFailure {
  /** 固定為 false，表示請求失敗。 */
  ok: false
  /** 可供前端判斷失敗類型的穩定錯誤碼。 */
  code: string
  /** 提供使用者或開發者閱讀的錯誤訊息。 */
  message: string
  /** 錯誤相關的額外結構化資訊。 */
  details?: unknown
}

/** API 完整回應型別。 */
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

/** 所有資源異動請求必須提供的冪等設定。 */
export interface MutationOptions {
  /** 識別同一筆資源異動請求的唯一冪等鍵。 */
  idempotencyKey: string
}

/** 建立資源異動請求使用的 Idempotency-Key header。 */
export const createMutationHeaders = ({
  idempotencyKey,
}: MutationOptions) => ({
  'Idempotency-Key': idempotencyKey,
})
