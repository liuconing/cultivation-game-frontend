import { apiClient } from '@/lib/axios'
import type { ItemEffect, ItemQuality, ItemUsableRealm } from './itemCatalog.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

/** 丹藥商店中的單一商品資料。 */
export interface ShopPill {
  /** 丹藥模板 ID。 */
  id: string
  /** 丹藥顯示名稱。 */
  name: string
  /** 丹藥最低可使用境界。 */
  usableRealm: ItemUsableRealm
  /** 最低可使用境界的顯示名稱。 */
  usableRealmName: string
  /** 丹藥品質代碼。 */
  quality: ItemQuality
  /** 丹藥品質的顯示名稱。 */
  qualityName: string
  /** 使用丹藥時會套用的效果。 */
  effects: ItemEffect[]
  /** 單顆丹藥售價。 */
  price: number
  /** 目前角色境界是否符合使用限制。 */
  realmEligible: boolean
  /** 目前角色持有的靈石是否足以購買一顆。 */
  affordable: boolean
}

/** 丹藥商店列表與角色資產摘要。 */
export interface ShopPillsData {
  /** 目前角色持有的靈石。 */
  spiritStones: number
  /** 商店目前提供的丹藥商品。 */
  products: ShopPill[]
}

/** 購買丹藥需要的 request body。 */
export interface PurchasePillParams {
  /** 要購買的丹藥模板 ID。 */
  templateId: string
  /** 要購買的丹藥數量。 */
  quantity: number
}

/** 購買丹藥完成後的結算資料。 */
export interface PurchasePillData {
  /** 已購買的丹藥模板 ID。 */
  templateId: string
  /** 本次實際購買數量。 */
  quantityPurchased: number
  /** 本次購買使用的單顆售價。 */
  unitPrice: number
  /** 本次購買支付的總靈石。 */
  totalPrice: number
  /** 購買完成後背包持有數量。 */
  quantityOwned: number
  /** 購買完成後角色剩餘靈石。 */
  spiritStones: number
}

/** 使用丹藥需要的 request body。 */
export interface UsePillParams {
  /** 要使用的丹藥模板 ID。 */
  templateId: string
}

/** 使用丹藥前後的角色資源快照。 */
export interface PillCharacterSnapshot {
  /** 快照當下的生命值。 */
  currentHp: number
  /** 快照當下的靈力值。 */
  currentMp: number
  /** 快照當下的累積修為。 */
  cultivation: number
}

/** 使用一顆丹藥後的完整結算資料。 */
export interface UsePillData {
  /** 已使用的丹藥模板 ID。 */
  templateId: string
  /** 本次固定消耗的丹藥數量。 */
  consumed: 1
  /** 使用完成後背包剩餘數量。 */
  quantityOwned: number
  /** 套用丹藥效果前的角色快照。 */
  before: PillCharacterSnapshot
  /** 套用丹藥效果後的角色快照。 */
  after: PillCharacterSnapshot
  /** 本次實際套用的丹藥效果。 */
  appliedEffects: ItemEffect[]
}

export interface GetShopPillsRes extends ApiSuccess<ShopPillsData> {}
export interface PurchasePillRes extends ApiSuccess<PurchasePillData> {}
export interface UsePillRes extends ApiSuccess<UsePillData> {}

/** 取得目前角色可購買的丹藥。 */
export const getShopPills = async (): Promise<GetShopPillsRes> => {
  const { data } = await apiClient.get<GetShopPillsRes>(
    apiEndpoints.getShopPills.path(),
  )

  return data
}

/** 購買指定數量的丹藥。 */
export const purchasePill = async (
  params: PurchasePillParams,
  options: MutationOptions,
): Promise<PurchasePillRes> => {
  const { data } = await apiClient.post<PurchasePillRes>(
    apiEndpoints.purchasePill.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}

/** 使用背包中的指定丹藥。 */
export const usePill = async (
  params: UsePillParams,
  options: MutationOptions,
): Promise<UsePillRes> => {
  const { data } = await apiClient.post<UsePillRes>(
    apiEndpoints.usePill.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
