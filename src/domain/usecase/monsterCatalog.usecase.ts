import { getMonsters } from '../repository'
import type { GetMonstersParams, GetMonstersRes } from '../repository'

/** 取得怪物圖鑑回傳 DTO。 */
export interface GetMonstersDto extends GetMonstersRes {}

/** 取得怪物圖鑑 usecase 傳入參數。 */
export interface GetMonstersParamsDto extends GetMonstersParams {}

/**
 * 取得怪物圖鑑資料。
 *
 * @param params - 怪物查詢過濾條件。
 * @returns 取得怪物圖鑑回傳 DTO。
 */
export const getMonstersUsecase = async (
  params: GetMonstersParamsDto = {},
): Promise<GetMonstersDto> => {
  return getMonsters(params)
}
