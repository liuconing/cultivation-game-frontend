import { apiClient } from '@/lib/axios'

export const monsterMapIds = [
  'mortal_forest',
  'spiritual_valley',
  'ancient_cultivator_cave',
  'scarlet_flame_wasteland',
  'nether_ancient_battlefield',
  'ten_thousand_thunder_forbidden_land',
  'void_rift',
  'outer_heaven_immortal_ruins',
  'nine_heavens_thunder_sea',
  'immortal_realm_remnant',
] as const

export const monsterTypes = [
  'beast',
  'demonic_cultivator',
  'ghost',
  'spirit_beast',
  'puppet',
  'ancient_creature',
] as const

export const monsterQualities = [
  'normal',
  'elite',
  'leader',
  'king',
  'ancient',
] as const

export const monsterRealms = [
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

export type MonsterMapId = (typeof monsterMapIds)[number]
export type MonsterType = (typeof monsterTypes)[number]
export type MonsterQuality = (typeof monsterQualities)[number]
export type MonsterRealm = (typeof monsterRealms)[number]

/** 怪物圖鑑共用的屬性數值。 */
export interface MonsterStats {
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

/** 怪物技能資料。 */
export interface MonsterSkill {
  /** 技能 ID。 */
  id: string
  /** 技能名稱。 */
  name: string
  /** 技能描述。 */
  description: string
}

/** 怪物獎勵資料。 */
export interface MonsterRewards {
  /** 基礎修為獎勵。 */
  baseCultivation: number
  /** 基礎靈石獎勵。 */
  baseSpiritStones: number
  /** 修為加成倍率。 */
  cultivationMultiplier: number
  /** 掉落加成倍率。 */
  dropMultiplier: number
}

/** `GET /monsters` 回傳的單筆怪物資料。 */
export interface MonsterCatalogResponse {
  /** 怪物 ID。 */
  id: string
  /** 怪物名稱。 */
  name: string
  /** 所屬地圖 ID。 */
  mapId: MonsterMapId
  /** 地圖顯示名稱。 */
  mapName: string
  /** 解鎖境界。 */
  unlockRealm: MonsterRealm
  /** 怪物境界。 */
  realm: MonsterRealm
  /** 怪物類型。 */
  type: MonsterType
  /** 怪物品質。 */
  quality: MonsterQuality
  /** 是否為 BOSS。 */
  isBoss: boolean
  /** 屬性加成倍率。 */
  attributeMultiplier: number
  /** 掉落加成倍率。 */
  dropMultiplier: number
  /** 修為獎勵倍率。 */
  cultivationRewardMultiplier: number
  /** 怪物基礎屬性。 */
  baseStats: MonsterStats
  /** 怪物技能列表。 */
  skills: MonsterSkill[]
  /** 怪物獎勵。 */
  rewards: MonsterRewards
  /** 資料來源。 */
  source: string
  /** 建立時間（ISO 字串）。 */
  createdAt: string
  /** 更新時間（ISO 字串）。 */
  updatedAt: string
}

/** `GET /monsters` 支援的精確比對查詢參數。 */
export interface GetMonstersParams {
  /** 依地圖 ID 過濾。 */
  mapId?: MonsterMapId
  /** 依境界過濾。 */
  realm?: MonsterRealm
  /** 依品質過濾。 */
  quality?: MonsterQuality
  /** 依類型過濾。 */
  type?: MonsterType
  /** 依是否為 BOSS 過濾。 */
  isBoss?: boolean
}

/** `GET /monsters` 回傳格式。 */
export interface GetMonstersRes {
  /** 固定為 true，代表請求成功。 */
  ok: true
  /** 符合條件的怪物總數。 */
  total: number
  /** 怪物列表。 */
  monsters: MonsterCatalogResponse[]
}

/**
 * 取得怪物圖鑑資料。
 *
 * @param params - 怪物查詢過濾條件。
 * @returns 符合條件的怪物列表。
 */
export const getMonsters = async (
  params: GetMonstersParams = {},
): Promise<GetMonstersRes> => {
  const { data } = await apiClient.get<GetMonstersRes>('/monsters', {
    params,
  })

  return data
}
