import { apiClient } from '@/lib/axios'
import {
  createMutationHeaders,
  type ApiSuccess,
  type IsoDateString,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'
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
export type CharacterEquippedItemIds = Record<
  CharacterEquipmentSlot,
  string | null
>

/** 角色共用屬性。 */
export interface CharacterStats {
  attack: number
  defense: number
  maxHp: number
  currentHp: number
  maxMp: number
  currentMp: number
  mpRegen: number
  speed: number
  critRate: number
  critDamage: number
  critResist: number
  dodgeRate: number
  hitRate: number
  luck: number
}

/** 角色 API 完整 DTO。 */
export interface CharacterResponse {
  id: string
  userId: string
  name: string
  gender: Gender
  spiritualRootType: SpiritualRootType
  spiritualRootQuality: SpiritualRootQuality
  realm: Realm
  minorRealm: MinorRealm
  cultivation: number
  spiritStones: number
  spiritualRootEssence: number
  breakthroughPity: number
  baseStats: CharacterStats
  equipment: CharacterEquipment
  equippedCultivationMethodId: string | null
  learnedSkillIds: string[]
  equippedActiveSkillId: string | null
  equippedPassiveSkillId: string | null
  unlockedMapIds: string[]
  firstClearBossIds: string[]
  lastCultivationClaimAt: IsoDateString
  restingSince: IsoDateString | null
  createdAt: IsoDateString
  updatedAt: IsoDateString
}

/** `POST /characters` request body。 */
export interface CreateCharacterParams {
  name: string
  gender: Gender
  spiritualRootType: SpiritualRootType
}

export interface GetMyCharacterData {
  character: CharacterResponse | null
}

export interface CreateCharacterData {
  character: CharacterResponse
}

export type GetMyCharacterRes = ApiSuccess<GetMyCharacterData>
export type CreateCharacterRes = ApiSuccess<CreateCharacterData>

/** 取得目前登入使用者的角色。 */
export const getMyCharacter = async (): Promise<GetMyCharacterRes> => {
  const { data } = await apiClient.get<GetMyCharacterRes>(
    apiEndpoints.getMyCharacter.path(),
  )

  return data
}

/** 建立目前登入使用者的角色。 */
export const createCharacter = async (
  params: CreateCharacterParams,
  options: MutationOptions,
): Promise<CreateCharacterRes> => {
  const { data } = await apiClient.post<CreateCharacterRes>(
    apiEndpoints.createCharacter.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
