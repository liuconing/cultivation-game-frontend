import { apiClient } from '@/lib/axios'
import type { ItemEffect, ItemQuality, ItemUsableRealm } from './itemCatalog.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

export interface ShopPill {
  id: string
  name: string
  usableRealm: ItemUsableRealm
  usableRealmName: string
  quality: ItemQuality
  qualityName: string
  effects: ItemEffect[]
  price: number
  realmEligible: boolean
  affordable: boolean
}

export interface ShopPillsData {
  spiritStones: number
  products: ShopPill[]
}

export interface PurchasePillParams {
  templateId: string
  quantity: number
}

export interface PurchasePillData {
  templateId: string
  quantityPurchased: number
  unitPrice: number
  totalPrice: number
  quantityOwned: number
  spiritStones: number
}

export interface UsePillParams {
  templateId: string
}

export interface PillCharacterSnapshot {
  currentHp: number
  currentMp: number
  cultivation: number
}

export interface UsePillData {
  templateId: string
  consumed: 1
  quantityOwned: number
  before: PillCharacterSnapshot
  after: PillCharacterSnapshot
  appliedEffects: ItemEffect[]
}

export type GetShopPillsRes = ApiSuccess<ShopPillsData>
export type PurchasePillRes = ApiSuccess<PurchasePillData>
export type UsePillRes = ApiSuccess<UsePillData>

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
