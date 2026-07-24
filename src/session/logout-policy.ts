/** 判斷登出錯誤是否代表目前 token 已經失效。 */
export const shouldFinalizeLogoutAfterError = (
  status: number | null,
): boolean => status === 401
