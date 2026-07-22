import { useState } from 'react'
import type { FormEvent } from 'react'
import { authMock } from '@/data/authMock'

type AuthMode = 'login' | 'register'

/** 登入 / 註冊畫面的資料模型。 */
export interface ILoginViewModel {
  /** 目前是否為註冊模式。 */
  isRegister: boolean
  /** 操作後顯示的提示訊息。 */
  message: string
  /** 帳號欄位預設值。 */
  accountDefault: string
  /** 密碼欄位預設值。 */
  passwordDefault: string
  /** 角色名稱欄位預設值（註冊用）。 */
  characterNameDefault: string
  /** 切換為登入模式。 */
  handleSelectLogin: () => void
  /** 切換為註冊模式。 */
  handleSelectRegister: () => void
  /** 處理表單送出。 */
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

/**
 * 提供登入 / 註冊畫面的狀態與操作。
 *
 * @returns 登入畫面的顯示狀態、預設值與事件處理器。
 */
export function useLoginViewModel(): ILoginViewModel {
  const [mode, setMode] = useState<AuthMode>('login')
  const [message, setMessage] = useState('')
  const isRegister = mode === 'register'

  /** 處理表單送出，顯示 mock 驗證訊息。 */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(authMock.message)
  }

  /** 切換為登入模式並清除訊息。 */
  const handleSelectLogin = () => {
    setMode('login')
    setMessage('')
  }

  /** 切換為註冊模式並清除訊息。 */
  const handleSelectRegister = () => {
    setMode('register')
    setMessage('')
  }

  return {
    isRegister,
    message,
    accountDefault: isRegister ? authMock.register.account : authMock.login.account,
    passwordDefault: isRegister ? authMock.register.password : authMock.login.password,
    characterNameDefault: authMock.register.characterName,
    handleSelectLogin,
    handleSelectRegister,
    handleSubmit,
  }
}
