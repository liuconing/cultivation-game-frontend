/** 後端 API 共用的錯誤回傳格式。 */
export interface ApiErrorResponse {
  /** 固定為 false，代表請求失敗。 */
  ok: false
  /** 錯誤訊息。 */
  message: string
}

/**
 * 建立後端受保護路由所需的 Authorization 標頭。
 *
 * @param token - 使用者 JWT token。
 * @returns 帶有 Bearer token 的 Authorization 標頭。
 */
export const createAuthorizationHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
})
