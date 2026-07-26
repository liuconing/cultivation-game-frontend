import { createCharacter, getMyCharacter } from '../repository'
import type { CreateCharacterParams, CreateCharacterRes, GetMyCharacterRes, MutationOptions } from '../repository'

export interface GetMyCharacterDto extends GetMyCharacterRes {}
export interface CreateCharacterDto extends CreateCharacterRes {}
export interface CreateCharacterParamsDto extends CreateCharacterParams {}

/** 取得目前使用者的角色。 */
export const getMyCharacterUsecase = (): Promise<GetMyCharacterDto> => getMyCharacter()

/** 建立目前使用者的角色。 */
export const createCharacterUsecase = (
  params: CreateCharacterParamsDto,
  options: MutationOptions,
): Promise<CreateCharacterDto> => createCharacter(params, options)
