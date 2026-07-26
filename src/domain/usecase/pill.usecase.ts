import { getShopPills, purchasePill, usePill } from '../repository'
import type {
  GetShopPillsRes,
  MutationOptions,
  PurchasePillParams,
  PurchasePillRes,
  UsePillParams,
  UsePillRes,
} from '../repository'

export interface GetShopPillsDto extends GetShopPillsRes {}
export interface PurchasePillDto extends PurchasePillRes {}
export interface PurchasePillParamsDto extends PurchasePillParams {}
export interface UsePillDto extends UsePillRes {}
export interface UsePillParamsDto extends UsePillParams {}

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
