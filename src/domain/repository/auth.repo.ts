import { apiClient } from '@/lib/axios'

/** 後端 auth API 回傳的使用者資料。 */
export interface AuthUser {
  /** 使用者 ID。 */
  id: string
  /** 使用者 email。 */
  email: string
  /** 使用者名稱。 */
  username: string
  /** 建立時間（ISO 字串）。 */
  createdAt: string
  /** 更新時間（ISO 字串）。 */
  updatedAt: string
}

/** 註冊與登入成功共用的回傳格式。 */
export interface AuthRes {
  /** 固定為 true，代表請求成功。 */
  ok: true
  /** JWT token。 */
  token: string
  /** 登入的使用者資料。 */
  user: AuthUser
}

/** `POST /auth/login` 傳入參數。 */
export interface LoginUserParams {
  /** 登入 email。 */
  email: string
  /** 登入密碼。 */
  password: string
}

/** `POST /auth/register` 傳入參數。 */
export interface RegisterUserParams extends LoginUserParams {
  /** 使用者名稱。 */
  username: string
}

/** `POST /auth/login` 回傳格式。 */
export type LoginUserRes = AuthRes

/** `POST /auth/register` 回傳格式。 */
export type RegisterUserRes = AuthRes

/**
 * 註冊使用者並取得 JWT token。
 *
 * @param params - 註冊所需的 email、密碼與使用者名稱。
 * @returns 註冊成功的使用者資料與 token。
 */
export const registerUser = async (
  params: RegisterUserParams,
): Promise<RegisterUserRes> => {
  const { data } = await apiClient.post<RegisterUserRes>(
    '/auth/register',
    params,
  )

  return data
}

/**
 * 登入使用者並取得 JWT token。
 *
 * @param params - 登入所需的 email 與密碼。
 * @returns 登入成功的使用者資料與 token。
 */
export const loginUser = async (
  params: LoginUserParams,
): Promise<LoginUserRes> => {
  const { data } = await apiClient.post<LoginUserRes>('/auth/login', params)

  return data
}
