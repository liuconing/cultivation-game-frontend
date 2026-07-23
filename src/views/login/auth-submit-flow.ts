import type { LoginUserParams } from '@/domain/repository'
import type { AuthMode } from '@/data/auth'

/** 認證送出流程所需的 API 操作。 */
export interface AuthSubmitOperations<TResult> {
  /** 建立新帳號；完成後才可進行自動登入。 */
  register: (credentials: LoginUserParams) => Promise<unknown>
  /** 以相同帳密登入並回傳 session 結果。 */
  login: (credentials: LoginUserParams) => Promise<TResult>
}

/**
 * 依登入或註冊模式循序執行認證 API。
 *
 * @param mode - 目前表單模式。
 * @param credentials - 已通過前端驗證的 Email 與密碼。
 * @param operations - 可替換測試的註冊與登入操作。
 * @returns 登入 API 的 session 結果。
 */
export const submitAuthFlow = async <TResult>(
  mode: AuthMode,
  credentials: LoginUserParams,
  operations: AuthSubmitOperations<TResult>,
): Promise<TResult> => {
  if (mode === 'register') {
    await operations.register(credentials)
  }

  return operations.login(credentials)
}
