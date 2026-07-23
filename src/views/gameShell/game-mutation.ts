/** 取得本次資源異動的冪等鍵；網路失敗重試時沿用既有鍵。 */
export const getOrCreateIdempotencyKey = (
  currentKey: string | null,
  createKey: () => string,
): string => currentKey ?? createKey()
