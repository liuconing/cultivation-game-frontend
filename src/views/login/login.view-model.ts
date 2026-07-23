import {
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'
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
import { useAuthStore } from '@/stores'

/** 登入與註冊 ViewController 需要的狀態與操作。 */
export interface ILoginViewModel {
  /** 目前是登入或註冊模式。 */
  mode: AuthMode
  /** 使用者輸入的表單值。 */
  values: AuthFormValues
  /** 各輸入欄位的前端錯誤。 */
  fieldErrors: AuthFieldErrors
  /** API 或 session 狀態通知。 */
  notice: AuthNotice | null
  /** 是否顯示密碼明文。 */
  showPassword: boolean
  /** 是否正在送出 API 請求。 */
  isSubmitting: boolean
  /** Email 輸入欄位 ref。 */
  accountRef: RefObject<HTMLInputElement | null>
  /** 密碼輸入欄位 ref。 */
  passwordRef: RefObject<HTMLInputElement | null>
  /** 確認密碼輸入欄位 ref。 */
  confirmPasswordRef: RefObject<HTMLInputElement | null>
  /** 更新指定表單欄位。 */
  handleFieldChange: (
    field: keyof AuthFormValues,
    value: string,
  ) => void
  /** 切換密碼顯示狀態。 */
  handleTogglePassword: () => void
  /** 驗證並送出登入或註冊表單。 */
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

/** 登入導向所附帶的來源路徑狀態。 */
interface AuthLocationState {
  /** 使用者登入前嘗試進入的受保護路徑。 */
  from?: unknown
}

/**
 * 從 React Router state 取得安全的站內返回路徑。
 *
 * @param state - 目前 location state。
 * @returns 合法站內路徑；無合法來源時回到根路徑。
 */
const getReturnPath = (state: unknown): string => {
  if (!state || typeof state !== 'object') {
    return '/'
  }

  const { from } = state as AuthLocationState
  if (
    typeof from !== 'string' ||
    !from.startsWith('/') ||
    from.startsWith('//') ||
    from === '/login' ||
    from === '/register'
  ) {
    return '/'
  }

  return from
}

/** 管理登入與註冊表單驗證、正式 API 及成功導流。 */
export function useLoginViewModel(): ILoginViewModel {
  const location = useLocation()
  const navigate = useNavigate()
  const mode: AuthMode =
    location.pathname === '/register' ? 'register' : 'login'
  const setAuth = useAuthStore((state) => state.setAuth)
  const sessionNotice = useAuthStore((state) => state.sessionNotice)
  const clearSessionNotice = useAuthStore(
    (state) => state.clearSessionNotice,
  )
  const [values, setValues] = useState<AuthFormValues>(
    createInitialAuthFormValues,
  )
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [notice, setNotice] = useState<AuthNotice | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const accountRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const visibleNotice =
    notice ??
    (sessionNotice === 'expired'
      ? {
          tone: 'error' as const,
          message: '登入狀態已失效，請重新登入。',
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
  const handleFieldChange = (
    field: keyof AuthFormValues,
    value: string,
  ): void => {
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
    onError: handleAuthError,
  })
  const loginMutation = useMutation(loginUserUsecase, {
    onSuccess: (response) => {
      setAuth(response.data)
      navigate(getReturnPath(location.state), { replace: true })
    },
    onError: (error) => {
      if (mode === 'register') {
        setNotice({
          tone: 'error',
          message:
            '道籍已建立，但自動登入失敗，請返回登入後重試。',
        })
        return
      }

      handleAuthError(error)
    },
  })
  const isSubmitting =
    registerMutation.isPending || loginMutation.isPending

  /** 呼叫正式認證 API，註冊成功後立即以相同帳密登入。 */
  const submitAuth = async (): Promise<void> => {
    try {
      const input = {
        email: values.account.trim(),
        password: values.password,
      }

      if (mode === 'register') {
        await registerMutation.mutateAsync(input)
      }

      await loginMutation.mutateAsync(input)
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
