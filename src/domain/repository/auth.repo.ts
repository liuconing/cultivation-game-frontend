import { apiClient } from '@/lib/axios'
import type { ApiSuccess, IsoDateString } from './common'
import { apiEndpoints } from './endpoints'

/** 認證 API 回傳的使用者資料。 */
export interface AuthUser {
  /** 使用者唯一識別碼。 */
  id: string
  /** 使用者登入 Email。 */
  email: string
  /** 使用者帳號建立時間。 */
  createdAt: IsoDateString
  /** 使用者資料最後更新時間。 */
  updatedAt: IsoDateString
}

/** `POST /auth/login` request body。 */
export interface LoginUserParams {
  /** 登入或註冊使用的 Email。 */
  email: string
  /** 登入或註冊使用的密碼。 */
  password: string
}

/** `POST /auth/register` request body。 */
export type RegisterUserParams = LoginUserParams

/** 登入成功資料。 */
export interface LoginUserData {
  /** 後續受保護 API 使用的 JWT token。 */
  token: string
  /** 登入成功的使用者資料。 */
  user: AuthUser
}

/** 註冊成功資料；token 需透過登入取得。 */
export interface RegisterUserData {
  /** 註冊完成後建立的使用者資料。 */
  user: AuthUser
}

/** 登出成功資料。 */
export interface LogoutUserData {
  /** 目前 token 是否已由後端撤銷。 */
  loggedOut: true
}

export type LoginUserRes = ApiSuccess<LoginUserData>
export type RegisterUserRes = ApiSuccess<RegisterUserData>
export type LogoutUserRes = ApiSuccess<LogoutUserData>

/** 註冊使用者。 */
export const registerUser = async (
  params: RegisterUserParams,
): Promise<RegisterUserRes> => {
  const { data } = await apiClient.post<RegisterUserRes>(
    apiEndpoints.register.path(),
    params,
  )

  return data
}

/** 登入並取得 JWT token。 */
export const loginUser = async (
  params: LoginUserParams,
): Promise<LoginUserRes> => {
  const { data } = await apiClient.post<LoginUserRes>(
    apiEndpoints.login.path(),
    params,
  )

  return data
}

/** 撤銷目前 Bearer token 對應的後端 session。 */
export const logoutUser = async (): Promise<LogoutUserRes> => {
  const { data } = await apiClient.post<LogoutUserRes>(
    apiEndpoints.logout.path(),
  )

  return data
}
