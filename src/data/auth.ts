/** 認證畫面模式。 */
export type AuthMode = 'login' | 'register'

/** 登入與註冊共用的表單欄位。 */
export interface AuthFormValues {
  /** 使用者輸入的 Email。 */
  account: string
  /** 使用者輸入的密碼。 */
  password: string
  /** 註冊時再次輸入的確認密碼。 */
  confirmPassword: string
}

/** 認證表單各欄位的錯誤訊息。 */
export type AuthFieldErrors = Partial<
  Record<keyof AuthFormValues, string>
>

/** 認證操作完成後顯示的通知。 */
export interface AuthNotice {
  /** 通知的視覺語意。 */
  tone: 'success' | 'error'
  /** 顯示給使用者的通知內容。 */
  message: string
}

/** 建立空白認證表單值。 */
export const createInitialAuthFormValues = (): AuthFormValues => ({
  account: '',
  password: '',
  confirmPassword: '',
})

/**
 * 驗證登入與註冊表單的前端規則。
 *
 * @param mode - 目前表單是登入或註冊模式。
 * @param values - 待驗證的表單值。
 * @returns 各欄位對應的驗證錯誤。
 */
export const validateAuthForm = (
  mode: AuthMode,
  values: AuthFormValues,
): AuthFieldErrors => {
  const errors: AuthFieldErrors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!values.account.trim()) {
    errors.account = '請輸入 Email。'
  } else if (!emailPattern.test(values.account.trim())) {
    errors.account = '請輸入有效的 Email 格式。'
  }

  if (!values.password) {
    errors.password = '請輸入密碼。'
  } else if (values.password.length < 8) {
    errors.password = '密碼至少需要 8 個字元。'
  }

  if (mode === 'register') {
    if (!values.confirmPassword) {
      errors.confirmPassword = '請再次輸入密碼。'
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = '兩次輸入的密碼不一致。'
    }
  }

  return errors
}
