import { getShopPills, purchasePill, usePill } from '../repository'
import type {
  GetShopPillsRes,
  MutationOptions,
  PurchasePillParams,
  PurchasePillRes,
  UsePillParams,
  UsePillRes,
} from '../repository'

export type GetShopPillsDto = GetShopPillsRes
export type PurchasePillDto = PurchasePillRes
export type PurchasePillParamsDto = PurchasePillParams
export type UsePillDto = UsePillRes
export type UsePillParamsDto = UsePillParams

/** 取得丹藥商店商品。 */
export const getShopPillsUsecase = (): Promise<GetShopPillsDto> =>
  getShopPills()

/** 購買丹藥。 */
export const purchasePillUsecase = (
  params: PurchasePillParamsDto,
  options: MutationOptions,
): Promise<PurchasePillDto> => purchasePill(params, options)

/** 使用背包丹藥。 */
export const usePillUsecase = (
  params: UsePillParamsDto,
  options: MutationOptions,
): Promise<UsePillDto> => usePill(params, options)
