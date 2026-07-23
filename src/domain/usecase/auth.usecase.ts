import { loginUser, registerUser } from '../repository'
import type {
  LoginUserParams,
  LoginUserRes,
  RegisterUserParams,
  RegisterUserRes,
} from '../repository'

/** 登入回傳 DTO。 */
export type LoginUserDto = LoginUserRes

/** 登入 usecase 傳入參數。 */
export type LoginUserParamsDto = LoginUserParams

/** 註冊回傳 DTO。 */
export type RegisterUserDto = RegisterUserRes

/** 註冊 usecase 傳入參數。 */
export type RegisterUserParamsDto = RegisterUserParams

/**
 * 登入使用者並取得 JWT token。
 *
 * @param params - 登入所需的 email 與密碼。
 * @returns 登入回傳 DTO。
 */
export const loginUserUsecase = async (
  params: LoginUserParamsDto,
): Promise<LoginUserDto> => {
  return loginUser(params)
}

/**
 * 註冊使用者；JWT token 需於登入後取得。
 *
 * @param params - 註冊所需的 email、密碼與使用者名稱。
 * @returns 註冊回傳 DTO。
 */
export const registerUserUsecase = async (
  params: RegisterUserParamsDto,
): Promise<RegisterUserDto> => {
  return registerUser(params)
}
