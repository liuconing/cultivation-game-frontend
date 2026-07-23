import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  authMock,
  authMockScenarioOptions,
  validateAuthForm,
  type AuthFieldErrors,
  type AuthFormValues,
  type AuthMockNotice,
  type AuthMockScenario,
  type AuthMode,
} from '@/data/authMock'

export interface ILoginViewModel {
  mode: AuthMode
  values: AuthFormValues
  fieldErrors: AuthFieldErrors
  notice: AuthMockNotice | null
  scenario: AuthMockScenario
  scenarioOptions: typeof authMockScenarioOptions
  showPassword: boolean
  isSubmitting: boolean
  accountRef: RefObject<HTMLInputElement | null>
  passwordRef: RefObject<HTMLInputElement | null>
  confirmPasswordRef: RefObject<HTMLInputElement | null>
  handleFieldChange: (
    field: keyof AuthFormValues,
    value: string,
  ) => void
  handleScenarioChange: (scenario: AuthMockScenario) => void
  handleTogglePassword: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const getInitialValues = (mode: AuthMode): AuthFormValues => {
  if (mode === 'register') {
    return {
      account: authMock.register.account,
      password: authMock.register.password,
      confirmPassword: authMock.register.confirmPassword,
    }
  }

  return {
    account: authMock.login.account,
    password: authMock.login.password,
    confirmPassword: '',
  }
}

/** 管理登入與註冊畫面的純記憶體 Mock 互動。 */
export function useLoginViewModel(): ILoginViewModel {
  const location = useLocation()
  const navigate = useNavigate()
  const mode: AuthMode =
    location.pathname === '/register' ? 'register' : 'login'
  const [values, setValues] = useState<AuthFormValues>(() =>
    getInitialValues(mode),
  )
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [notice, setNotice] = useState<AuthMockNotice | null>(null)
  const [scenario, setScenario] = useState<AuthMockScenario>(
    'successNoCharacter',
  )
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const accountRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const submitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current)
      }
    }
  }, [])

  const focusFirstError = (errors: AuthFieldErrors) => {
    if (errors.account) {
      accountRef.current?.focus()
    } else if (errors.password) {
      passwordRef.current?.focus()
    } else if (errors.confirmPassword) {
      confirmPasswordRef.current?.focus()
    }
  }

  const focusAccountAfterSubmit = () => {
    window.requestAnimationFrame(() => {
      accountRef.current?.focus()
    })
  }

  const handleFieldChange = (
    field: keyof AuthFormValues,
    value: string,
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))
    setNotice(null)
  }

  const completeMockSubmit = () => {
    setIsSubmitting(false)

    if (scenario === 'fieldError') {
      const mockErrors = {
        account: '此 Email 未通過 Mock 欄位驗證。',
      }
      setFieldErrors(mockErrors)
      setNotice({
        tone: 'error',
        message: '請修正標示的欄位後再試一次。',
      })
      focusAccountAfterSubmit()
      return
    }

    if (scenario === 'accountExists') {
      setNotice({
        tone: 'error',
        message:
          mode === 'register'
            ? '此 Email 已建立帳號，請改用登入。'
            : '此帳號狀態無法登入，請切換其他 Mock 情境。',
      })
      focusAccountAfterSubmit()
      return
    }

    if (scenario === 'networkError') {
      setNotice({
        tone: 'error',
        message: 'Mock 連線失敗，資料未送出，請稍後重試。',
      })
      return
    }

    if (mode === 'register') {
      setNotice({
        tone: 'success',
        message: 'Mock 註冊成功，請返回登入頁繼續。',
      })
      return
    }

    navigate(
      scenario === 'successHasCharacter'
        ? '/game/cultivation'
        : '/character/create',
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const errors = validateAuthForm(mode, values)
    setFieldErrors(errors)
    setNotice(null)

    if (Object.keys(errors).length > 0) {
      focusFirstError(errors)
      return
    }

    setIsSubmitting(true)
    submitTimerRef.current = window.setTimeout(
      completeMockSubmit,
      550,
    )
  }

  return {
    mode,
    values,
    fieldErrors,
    notice,
    scenario,
    scenarioOptions: authMockScenarioOptions,
    showPassword,
    isSubmitting,
    accountRef,
    passwordRef,
    confirmPasswordRef,
    handleFieldChange,
    handleScenarioChange: setScenario,
    handleTogglePassword: () => {
      setShowPassword((currentValue) => !currentValue)
    },
    handleSubmit,
  }
}
