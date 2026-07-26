/** 單一資源異動意圖目前保留的冪等資訊。 */
export interface OperationIntentRecord<TIntent> {
  /** 操作名稱，避免不同 API 意外共用冪等鍵。 */
  operation: string
  /** 參數正規化後的指紋，用來辨識是否仍是同一操作。 */
  fingerprint: string
  /** 送往後端 `Idempotency-Key` header 的唯一鍵。 */
  idempotencyKey: string
  /** 原始操作參數，供畫面辨識目前正在處理的項目。 */
  intent: TIntent
}

/** 管理單一資源異動冪等鍵生命週期的純函式介面。 */
export interface OperationIntentLifecycle<TIntent> {
  /**
   * 取得操作意圖的冪等紀錄；相同參數重試會沿用原鍵。
   *
   * @param intent - 本次準備送出的資源異動參數。
   * @returns 含操作名稱、參數指紋與冪等鍵的紀錄。
   */
  acquire: (intent: TIntent) => OperationIntentRecord<TIntent>
  /**
   * 標記後端異動成功；只會清除仍對應相同參數的紀錄。
   *
   * @param intent - 已由後端成功處理的操作參數。
   */
  complete: (intent: TIntent) => void
  /** 使用者取消目前意圖時清除冪等鍵，下次操作會建立新鍵。 */
  cancel: () => void
  /**
   * 讀取目前保留的操作意圖。
   *
   * @returns 尚未成功或取消的意圖；沒有時為 null。
   */
  current: () => OperationIntentRecord<TIntent> | null
}

/**
 * 將操作參數轉成穩定且可比較的 JSON 值。
 *
 * @param value - 可能包含陣列或巢狀物件的操作參數。
 * @returns 物件鍵排序後的可序列化值。
 */
const normalizeIntentValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeIntentValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [
          key,
          normalizeIntentValue(child),
        ]),
    )
  }

  return value
}

/**
 * 建立操作名稱與參數共同構成的穩定指紋。
 *
 * @param operation - 資源異動的固定操作名稱。
 * @param intent - 本次異動參數。
 * @returns 可用來比較兩次操作是否相同的字串。
 */
export const createOperationIntentFingerprint = <TIntent>(
  operation: string,
  intent: TIntent,
): string =>
  JSON.stringify([
    operation,
    normalizeIntentValue(intent) ?? null,
  ])

/**
 * 建立不依賴 React 的冪等鍵生命週期。
 *
 * @param operation - 單一後端資源異動的穩定名稱。
 * @param createKey - 建立新冪等鍵的函式。
 * @returns 可取得、完成、取消與檢查意圖的狀態機。
 *
 * 同一操作與參數在成功前會保留鍵；參數改變、成功或取消都會讓
 * 下一次 acquire 取得新鍵，避免不同請求共用同一冪等紀錄。
 */
export const createOperationIntentLifecycle = <TIntent>(
  operation: string,
  createKey: () => string,
): OperationIntentLifecycle<TIntent> => {
  let record: OperationIntentRecord<TIntent> | null = null

  return {
    acquire: (intent) => {
      const fingerprint = createOperationIntentFingerprint(
        operation,
        intent,
      )

      if (record?.fingerprint === fingerprint) {
        return record
      }

      record = {
        operation,
        fingerprint,
        idempotencyKey: createKey(),
        intent,
      }
      return record
    },
    complete: (intent) => {
      const fingerprint = createOperationIntentFingerprint(
        operation,
        intent,
      )
      if (record?.fingerprint === fingerprint) {
        record = null
      }
    },
    cancel: () => {
      record = null
    },
    current: () => record,
  }
}
