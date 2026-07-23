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
  /** 攻擊力。 */
  attack: number
  /** 防禦力。 */
  defense: number
  /** 最大生命值。 */
  maxHp: number
  /** 當前生命值。 */
  currentHp: number
  /** 最大靈力值。 */
  maxMp: number
  /** 當前靈力值。 */
  currentMp: number
  /** 每回合靈力回復量。 */
  mpRegen: number
  /** 行動速度。 */
  speed: number
  /** 暴擊機率。 */
  critRate: number
  /** 暴擊傷害倍率。 */
  critDamage: number
  /** 暴擊抗性。 */
  critResist: number
  /** 閃避機率。 */
  dodgeRate: number
  /** 命中機率。 */
  hitRate: number
  /** 影響隨機結果的幸運值。 */
  luck: number
}

/** 角色 API 完整 DTO。 */
export interface CharacterResponse {
  /** 角色唯一識別碼。 */
  id: string
  /** 角色所屬的使用者識別碼。 */
  userId: string
  /** 角色名稱。 */
  name: string
  /** 角色性別。 */
  gender: Gender
  /** 角色靈根屬性。 */
  spiritualRootType: SpiritualRootType
  /** 角色靈根品質。 */
  spiritualRootQuality: SpiritualRootQuality
  /** 角色目前的大境界。 */
  realm: Realm
  /** 角色目前的小境界。 */
  minorRealm: MinorRealm
  /** 角色目前累積修為。 */
  cultivation: number
  /** 角色目前持有靈石。 */
  spiritStones: number
  /** 可用於靈根升級的精華數量。 */
  spiritualRootEssence: number
  /** 突破失敗累積的保底加成。 */
  breakthroughPity: number
  /** 角色未套用裝備等效果的基礎屬性。 */
  baseStats: CharacterStats
  /** 各裝備欄目前穿戴的完整道具模板。 */
  equipment: CharacterEquipment
  /** 目前裝備的功法模板 ID。 */
  equippedCultivationMethodId: string | null
  /** 角色已學會的技能 ID 列表。 */
  learnedSkillIds: string[]
  /** 目前配置的主動技能 ID。 */
  equippedActiveSkillId: string | null
  /** 目前配置的被動技能 ID。 */
  equippedPassiveSkillId: string | null
  /** 角色已解鎖的地圖 ID 列表。 */
  unlockedMapIds: string[]
  /** 角色已首次通關的 Boss ID 列表。 */
  firstClearBossIds: string[]
  /** 上次領取離線修為的時間。 */
  lastCultivationClaimAt: IsoDateString
  /** 開始休養的時間，未休養時為 null。 */
  restingSince: IsoDateString | null
  /** 角色建立時間。 */
  createdAt: IsoDateString
  /** 角色資料最後更新時間。 */
  updatedAt: IsoDateString
}

/** `POST /characters` request body。 */
export interface CreateCharacterParams {
  /** 要建立的角色名稱。 */
  name: string
  /** 要建立的角色性別。 */
  gender: Gender
  /** 玩家選擇的靈根屬性。 */
  spiritualRootType: SpiritualRootType
}

/** 取得目前角色 API 的資料內容。 */
export interface GetMyCharacterData {
  /** 目前登入使用者的角色，尚未建立角色時為 null。 */
  character: CharacterResponse | null
}

/** 建立角色 API 的資料內容。 */
export interface CreateCharacterData {
  /** 後端完成初始化後的新角色資料。 */
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
