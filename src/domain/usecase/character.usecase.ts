import { createCharacter, getMyCharacter } from '../repository'
import type {
  CreateCharacterParams,
  CreateCharacterRes,
  GetMyCharacterParams,
  GetMyCharacterRes,
} from '../repository'

/** 取得目前角色回傳 DTO。 */
export type GetMyCharacterDto = GetMyCharacterRes

/** 取得目前角色 usecase 傳入參數。 */
export type GetMyCharacterParamsDto = GetMyCharacterParams

/** 建立角色回傳 DTO。 */
export type CreateCharacterDto = CreateCharacterRes

/** 建立角色 usecase 傳入參數。 */
export type CreateCharacterParamsDto = CreateCharacterParams

/**
 * 取得目前使用者的角色。
 *
 * @param params - 傳入參數，包含使用者 token。
 * @returns 目前角色回傳 DTO。
 */
export const getMyCharacterUsecase = async (
  params: GetMyCharacterParamsDto,
): Promise<GetMyCharacterDto> => {
  return getMyCharacter(params)
}

/**
 * 建立目前使用者的角色。
 *
 * @param params - 傳入參數，包含角色資料與使用者 token。
 * @returns 建立角色回傳 DTO。
 */
export const createCharacterUsecase = async (
  params: CreateCharacterParamsDto,
): Promise<CreateCharacterDto> => {
  return createCharacter(params)
}
