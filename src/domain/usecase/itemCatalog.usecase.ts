import { getItems } from '../repository'
import type { GetItemsParams, GetItemsRes } from '../repository'

/** 取得道具圖鑑回傳 DTO。 */
export type GetItemsDto = GetItemsRes

/** 取得道具圖鑑 usecase 傳入參數。 */
export type GetItemsParamsDto = GetItemsParams

/**
 * 取得道具圖鑑資料。
 *
 * @param params - 道具查詢過濾條件。
 * @returns 取得道具圖鑑回傳 DTO。
 */
export const getItemsUsecase = async (
  params: GetItemsParamsDto = {},
): Promise<GetItemsDto> => {
  return getItems(params)
}
