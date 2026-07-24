import { apiClient } from '@/lib/axios'
import type { CharacterStats, MinorRealm, Realm } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'
import type { ItemEffect } from './itemCatalog.repo'

/** 戰鬥過程中的單筆行動紀錄。 */
export interface BattleLogEntry {
  /** 發生此行動的戰鬥回合。 */
  round: number
  /** 發動行動者的 ID。 */
  actorId: string
  /** 發動行動者的顯示名稱。 */
  actorName: string
  /** 行動目標的 ID。 */
  targetId: string
  /** 行動目標的顯示名稱。 */
  targetName: string
  /** 本次執行的行動類型。 */
  action: 'attack'
  /** 本次攻擊是否命中。 */
  hit: boolean
  /** 本次攻擊是否為暴擊。 */
  critical: boolean
  /** 本次攻擊造成的傷害。 */
  damage: number
  /** 承受行動後目標剩餘的生命值。 */
  targetHp: number
  /** 可直接呈現在戰鬥紀錄的說明文字。 */
  message: string
}

/** 探索事件產生的單筆獎勵。 */
export interface ExplorationReward {
  /** 獎勵資源或道具的類型。 */
  type: 'cultivation' | 'spirit_stones' | 'spiritual_root_essence' | 'item'
  /** 本次獲得的資源或道具數量。 */
  amount: number
  /** 道具獎勵對應的模板 ID，非道具獎勵時省略。 */
  templateId?: string
}

/** 探索時建立的新裝備 instance 摘要。 */
export interface CreatedEquipmentResult {
  /** 新裝備 instance 的唯一識別碼。 */
  instanceId: string
  /** 新裝備對應的模板 ID。 */
  templateId: string
  /** 新裝備建立時產生的隨機詞條。 */
  rolledAffixes: ItemEffect[]
}

/** 探索結算完成後的角色狀態摘要。 */
export interface ExplorationCharacterAfter {
  /** 探索後的大境界。 */
  realm: Realm
  /** 探索後的小境界。 */
  minorRealm: MinorRealm
  /** 探索後的累積修為。 */
  cultivation: number
  /** 探索後持有的靈石。 */
  spiritStones: number
  /** 探索後持有的靈根精華。 */
  spiritualRootEssence: number
  /** 探索後的最終角色屬性。 */
  stats: CharacterStats
}

/** 發起探索需要的 request body。 */
export interface ExploreParams {
  /** 要進行探索的地圖 ID。 */
  mapId: string
}

/** 單次探索事件的完整結算資料。 */
export interface ExplorationData {
  /** 可追溯本次後端隨機結果的 seed 參考值。 */
  seedReference: string
  /** 本次探索抽中的事件類型。 */
  eventType: 'battle' | 'resource' | 'item' | 'encounter' | 'empty'
  /** 本次探索或戰鬥的最終結果。 */
  result: 'win' | 'loss' | 'none'
  /** 戰鬥事件的逐回合紀錄，非戰鬥事件時省略。 */
  battleLog?: BattleLogEntry[]
  /** 本次探索獲得的所有獎勵。 */
  rewards: ExplorationReward[]
  /** 本次探索建立的裝備 instances。 */
  createdEquipment: CreatedEquipmentResult[]
  /** 完成所有結算後的角色狀態。 */
  characterAfter: ExplorationCharacterAfter
}

export type ExploreRes = ApiSuccess<ExplorationData>

/** 進行一次指定地圖的探索。 */
export const explore = async (
  params: ExploreParams,
  options: MutationOptions,
): Promise<ExploreRes> => {
  const { data } = await apiClient.post<ExploreRes>(
    apiEndpoints.explore.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
