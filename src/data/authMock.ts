export type AuthMode = 'login' | 'register'

export type AuthMockScenario =
  | 'successNoCharacter'
  | 'successHasCharacter'
  | 'fieldError'
  | 'accountExists'
  | 'networkError'

export type AuthFormValues = {
  account: string
  password: string
  confirmPassword: string
}

export type AuthFieldErrors = Partial<
  Record<keyof AuthFormValues, string>
>

export type AuthMockNotice = {
  tone: 'success' | 'error'
  message: string
}

export const authMock = {
  login: {
    account: 'demo@wenxian.local',
    password: 'mock-pass',
  },
  register: {
    account: 'new@wenxian.local',
    password: 'mock-pass',
    confirmPassword: 'mock-pass',
  },
}

export const authMockScenarioOptions: Array<{
  value: AuthMockScenario
  label: string
}> = [
  { value: 'successNoCharacter', label: '成功・尚無角色' },
  { value: 'successHasCharacter', label: '成功・已有角色' },
  { value: 'fieldError', label: '欄位錯誤' },
  { value: 'accountExists', label: '帳號已存在' },
  { value: 'networkError', label: '連線失敗' },
]

/** 驗證 Auth Mock 表單的最小前端規則。 */
export function validateAuthForm(
  mode: AuthMode,
  values: AuthFormValues,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!values.account.trim()) {
    errors.account = '請輸入 Email。'
  } else if (!emailPattern.test(values.account)) {
    errors.account = '請輸入有效的 Email 格式。'
  }

  if (!values.password) {
    errors.password = '請輸入密碼。'
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
