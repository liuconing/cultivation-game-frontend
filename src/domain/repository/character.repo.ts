import { apiClient } from '@/lib/axios'
import { createAuthorizationHeaders } from './common'
import type { ItemCatalogResponse } from './itemCatalog.repo'

export const genders = ['male', 'female', 'none', 'unknown'] as const

export const spiritualRootTypes = [
  'metal',
  'wood',
  'water',
  'fire',
  'earth',
  'thunder',
  'wind',
  'ice',
] as const

export const spiritualRootQualities = [
  'low',
  'middle',
  'high',
  'earth',
  'heaven',
] as const

export const realms = [
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

export const minorRealms = ['early', 'middle', 'late', 'perfect'] as const

export const characterEquipmentSlots = [
  'weapon',
  'head',
  'chest',
  'pants',
  'shoes',
  'accessory',
  'method',
] as const

export type Gender = (typeof genders)[number]
export type SpiritualRootType = (typeof spiritualRootTypes)[number]
export type SpiritualRootQuality = (typeof spiritualRootQualities)[number]
export type Realm = (typeof realms)[number]
export type MinorRealm = (typeof minorRealms)[number]
export type CharacterEquipmentSlot = (typeof characterEquipmentSlots)[number]

export type CharacterEquipment = Record<
  CharacterEquipmentSlot,
  ItemCatalogResponse | null
>

/** 角色共用的屬性數值。 */
export interface CharacterStats {
  /** 攻擊力。 */
  attack: number
  /** 防禦力。 */
  defense: number
  /** 最大生命值。 */
  maxHp: number
  /** 當前生命值。 */
  currentHp: number
  /** 最大法力值。 */
  maxMp: number
  /** 當前法力值。 */
  currentMp: number
  /** 法力回復。 */
  mpRegen: number
  /** 速度。 */
  speed: number
  /** 暴擊率。 */
  critRate: number
  /** 暴擊傷害。 */
  critDamage: number
  /** 抗暴擊。 */
  critResist: number
  /** 閃避率。 */
  dodgeRate: number
  /** 命中率。 */
  hitRate: number
  /** 幸運值。 */
  luck: number
}

/** 受保護角色 API 回傳的角色資料。 */
export interface CharacterResponse {
  /** 角色 ID。 */
  id: string
  /** 所屬使用者 ID。 */
  userId: string
  /** 角色名稱。 */
  name: string
  /** 性別。 */
  gender: Gender
  /** 靈根屬性。 */
  spiritualRootType: SpiritualRootType
  /** 靈根品質。 */
  spiritualRootQuality: SpiritualRootQuality
  /** 大境界。 */
  realm: Realm
  /** 小境界。 */
  minorRealm: MinorRealm
  /** 當前修為。 */
  cultivation: number
  /** 持有靈石。 */
  spiritStones: number
  /** 基礎屬性。 */
  baseStats: CharacterStats
  /** 裝備配置。 */
  equipment: CharacterEquipment
  /** 建立時間（ISO 字串）。 */
  createdAt: string
  /** 更新時間（ISO 字串）。 */
  updatedAt: string
}

/** `GET /characters/me` 傳入參數。 */
export interface GetMyCharacterParams {
  /** 使用者 JWT token。 */
  token: string
}

/** `POST /characters` 傳入參數；靈根品質由後端產生。 */
export interface CreateCharacterParams {
  /** 角色名稱。 */
  name: string
  /** 性別。 */
  gender: Gender
  /** 靈根屬性。 */
  spiritualRootType: SpiritualRootType
  /** 使用者 JWT token。 */
  token: string
}

/** `GET /characters/me` 回傳格式。 */
export interface GetMyCharacterRes {
  /** 固定為 true，代表請求成功。 */
  ok: true
  /** 角色資料，尚未建立時為 null。 */
  character: CharacterResponse | null
}

/** `POST /characters` 回傳格式。 */
export interface CreateCharacterRes {
  /** 固定為 true，代表請求成功。 */
  ok: true
  /** 新建立的角色資料。 */
  character: CharacterResponse
}

/**
 * 取得目前使用者的角色。需帶 `Authorization: Bearer <token>`。
 *
 * @param params - 傳入參數，包含使用者 token。
 * @returns 目前使用者的角色資料。
 */
export const getMyCharacter = async ({
  token,
}: GetMyCharacterParams): Promise<GetMyCharacterRes> => {
  const { data } = await apiClient.get<GetMyCharacterRes>('/characters/me', {
    headers: createAuthorizationHeaders(token),
  })

  return data
}

/**
 * 建立目前使用者的角色。需帶 `Authorization: Bearer <token>`。
 *
 * @param params - 傳入參數，包含角色資料與使用者 token。
 * @returns 新建立的角色資料。
 */
export const createCharacter = async ({
  token,
  ...input
}: CreateCharacterParams): Promise<CreateCharacterRes> => {
  const { data } = await apiClient.post<CreateCharacterRes>(
    '/characters',
    input,
    {
      headers: createAuthorizationHeaders(token),
    },
  )

  return data
}
