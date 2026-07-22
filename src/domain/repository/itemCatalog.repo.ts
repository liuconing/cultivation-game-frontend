import { apiClient } from '@/lib/axios'

export const itemCategories = [
  'accessories',
  'chest_armor',
  'cultivation_methods',
  'headgear',
  'pants',
  'pills',
  'shoes',
  'weapons',
] as const

export const itemQualities = ['fan', 'huang', 'xuan', 'di', 'tian', 'xian'] as const

export const itemSlots = [
  'accessory',
  'chest',
  'head',
  'method',
  'pants',
  'shoes',
  'weapon',
] as const

export const itemUsableRealms = [
  'qi_condensation',
  'qi_refining',
  'foundation',
  'golden_core',
  'nascent_soul',
  'spirit_transformation',
  'body_integration',
  'mahayana',
  'tribulation',
  'true_immortal',
] as const

export const itemEffectTimings = ['instant', 'battle_buff', 'breakthrough'] as const

export type ItemCategory = (typeof itemCategories)[number]
export type ItemQuality = (typeof itemQualities)[number]
export type ItemSlot = (typeof itemSlots)[number]
export type ItemUsableRealm = (typeof itemUsableRealms)[number]
export type ItemEffectTiming = (typeof itemEffectTimings)[number]

/** 道具效果條目。 */
export interface ItemEffect {
  /** 影響的屬性。 */
  stat: string
  /** 效果類型。 */
  type: string
  /** 效果數值。 */
  value: number
  /** 顯示文字。 */
  display: string
}

/** `GET /items` 回傳的單筆道具資料。 */
export interface ItemCatalogResponse {
  /** 道具 ID。 */
  id: string
  /** 道具分類。 */
  category: ItemCategory
  /** 分類顯示名稱。 */
  categoryName: string
  /** 對應裝備欄位，無則為 null。 */
  slot: ItemSlot | null
  /** schema 版本。 */
  schemaVersion: number
  /** 來源檔案。 */
  sourceFile: string
  /** 道具名稱。 */
  name: string
  /** 可使用境界。 */
  usableRealm: ItemUsableRealm
  /** 可使用境界顯示名稱。 */
  usableRealmName: string
  /** 道具品質。 */
  quality: ItemQuality
  /** 品質顯示名稱。 */
  qualityName: string
  /** 道具效果列表。 */
  effects: ItemEffect[]
  /** 效果觸發時機。 */
  effectTiming?: ItemEffectTiming
  /** 效果持續回合數。 */
  durationTurns?: number
  /** 建立時間（ISO 字串）。 */
  createdAt: string
  /** 更新時間（ISO 字串）。 */
  updatedAt: string
}

/** `GET /items` 支援的精確比對查詢參數。 */
export interface GetItemsParams {
  /** 依分類過濾。 */
  category?: ItemCategory
  /** 依可使用境界過濾。 */
  usableRealm?: ItemUsableRealm
  /** 依品質過濾。 */
  quality?: ItemQuality
  /** 依裝備欄位過濾。 */
  slot?: ItemSlot
}

/** `GET /items` 回傳格式。 */
export interface GetItemsRes {
  /** 固定為 true，代表請求成功。 */
  ok: true
  /** 符合條件的道具總數。 */
  total: number
  /** 道具列表。 */
  items: ItemCatalogResponse[]
}

/**
 * 取得道具圖鑑資料。
 *
 * @param params - 道具查詢過濾條件。
 * @returns 符合條件的道具列表。
 */
export const getItems = async (
  params: GetItemsParams = {},
): Promise<GetItemsRes> => {
  const { data } = await apiClient.get<GetItemsRes>('/items', {
    params,
  })

  return data
}
