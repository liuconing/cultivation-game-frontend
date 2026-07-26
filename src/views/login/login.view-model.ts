import { useRef, useState, type FormEvent, type RefObject } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { loginUserUsecase, registerUserUsecase } from '@/domain'
import {
  createInitialAuthFormValues,
  validateAuthForm,
  type AuthFieldErrors,
  type AuthFormValues,
  type AuthMode,
  type AuthNotice,
} from '@/data/auth'
import { useMutation } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import { getPostAuthRoute } from '@/router/route-state'
import { useAuthStore } from '@/stores'
import { submitAuthFlow } from './auth-submit-flow'

/** 管理登入與註冊表單驗證、正式 API 及成功導流。 */
export function useLoginViewModel() {
  const location = useLocation()
  const navigate = useNavigate()
  const mode: AuthMode = location.pathname === '/register' ? 'register' : 'login'
  const setAuth = useAuthStore((state) => state.setAuth)
  const sessionNotice = useAuthStore((state) => state.sessionNotice)
  const clearSessionNotice = useAuthStore((state) => state.clearSessionNotice)
  const [values, setValues] = useState<AuthFormValues>(createInitialAuthFormValues)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [notice, setNotice] = useState<AuthNotice | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const accountRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const visibleNotice =
    notice ??
    (sessionNotice === 'invalid'
      ? {
          tone: 'error' as const,
          message: '登入憑證已失效，請重新登入。',
        }
      : null)

  /**
   * 將鍵盤焦點移至第一個驗證錯誤欄位。
   *
   * @param errors - 目前表單的欄位錯誤。
   */
  const focusFirstError = (errors: AuthFieldErrors): void => {
    if (errors.account) {
      accountRef.current?.focus()
    } else if (errors.password) {
      passwordRef.current?.focus()
    } else if (errors.confirmPassword) {
      confirmPasswordRef.current?.focus()
    }
  }

  /** 在畫面更新後將焦點移回 Email 欄位。 */
  const focusAccountAfterSubmit = (): void => {
    window.requestAnimationFrame(() => {
      accountRef.current?.focus()
    })
  }

  /**
   * 更新指定欄位並清除該欄位的舊錯誤。
   *
   * @param field - 要更新的表單欄位。
   * @param value - 欄位的新字串值。
   */
  const handleFieldChange = (field: keyof AuthFormValues, value: string): void => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))
    clearSessionNotice()
    setNotice(null)
  }

  /**
   * 將後端或網路錯誤映射為認證畫面通知。
   *
   * @param error - 登入或註冊 API 回傳的錯誤。
   */
  const handleAuthError = (error: unknown): void => {
    const apiError = getApiClientError(error)

    if (apiError.code === 'INVALID_CREDENTIALS') {
      setNotice({
        tone: 'error',
        message: 'Email 或密碼不正確，請重新輸入。',
      })
      focusAccountAfterSubmit()
      return
    }

    if (apiError.code === 'ACCOUNT_EXISTS') {
      setNotice({
        tone: 'error',
        message: '此 Email 已建立帳號，請改用登入。',
      })
      focusAccountAfterSubmit()
      return
    }

    if (apiError.code === 'VALIDATION_ERROR') {
      setNotice({
        tone: 'error',
        message: '送出的欄位格式不正確，請檢查後再試。',
      })
      focusAccountAfterSubmit()
      return
    }

    setNotice({
      tone: 'error',
      message: apiError.message,
    })
  }

  const registerMutation = useMutation(registerUserUsecase, {
    enableGlobalError: false,
    onError: handleAuthError,
  })
  const loginMutation = useMutation(loginUserUsecase, {
    enableGlobalError: false,
    onSuccess: (response) => {
      setAuth(response.data)
      navigate(getPostAuthRoute(location.state), { replace: true })
    },
    onError: (error) => {
      if (mode === 'register') {
        setNotice({
          tone: 'error',
          message: '道籍已建立，但自動登入失敗，請返回登入後重試。',
        })
        return
      }

      handleAuthError(error)
    },
  })
  const isSubmitting = registerMutation.isPending || loginMutation.isPending

  /** 呼叫正式認證 API，註冊成功後立即以相同帳密登入。 */
  const submitAuth = async (): Promise<void> => {
    try {
      const input = {
        email: values.account.trim(),
        password: values.password,
      }

      await submitAuthFlow(mode, input, {
        register: registerMutation.mutateAsync,
        login: loginMutation.mutateAsync,
      })
    } catch {
      return
    }
  }

  /**
   * 驗證表單並啟動登入或註冊請求。
   *
   * @param event - React 表單送出事件。
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const errors = validateAuthForm(mode, values)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setNotice({
        tone: 'error',
        message: '請修正標示的欄位後再試一次。',
      })
      focusFirstError(errors)
      return
    }

    setNotice(null)
    void submitAuth()
  }

  /** 切換密碼明文顯示狀態。 */
  const handleTogglePassword = (): void => {
    setShowPassword((currentValue) => !currentValue)
  }

  return {
    mode,
    values,
    fieldErrors,
    notice: visibleNotice,
    showPassword,
    isSubmitting,
    accountRef,
    passwordRef,
    confirmPasswordRef,
    handleFieldChange,
    handleTogglePassword,
    handleSubmit,
  }
}

export type ILoginViewModel = ReturnType<typeof useLoginViewModel>
