import { apiClient } from '@/lib/axios'
import type { ApiSuccess, IsoDateString } from './common'
import { apiEndpoints } from './endpoints'

/** 認證 API 回傳的使用者資料。 */
export interface AuthUser {
  id: string
  email: string
  createdAt: IsoDateString
  updatedAt: IsoDateString
}

/** `POST /auth/login` request body。 */
export interface LoginUserParams {
  email: string
  password: string
}

/** `POST /auth/register` request body。 */
export type RegisterUserParams = LoginUserParams

/** 登入成功資料。 */
export interface LoginUserData {
  token: string
  user: AuthUser
}

/** 註冊成功資料；token 需透過登入取得。 */
export interface RegisterUserData {
  user: AuthUser
}

export type LoginUserRes = ApiSuccess<LoginUserData>
export type RegisterUserRes = ApiSuccess<RegisterUserData>

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
