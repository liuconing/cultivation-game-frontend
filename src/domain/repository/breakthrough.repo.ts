import { apiClient } from '@/lib/axios'
import type { MinorRealm, Realm } from './character.repo'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

/** 發起突破時可選擇的 request body。 */
export interface BreakthroughParams {
  /** 要消耗的突破丹藥模板 ID，不使用丹藥時省略。 */
  pillTemplateId?: string
}

/** 突破成功率各項加成的計算明細。 */
export interface BreakthroughChanceBreakdown {
  /** 目前境界的基礎突破率。 */
  base: number
  /** 靈根品質提供的突破率加成。 */
  spiritualRoot: number
  /** 幸運值提供的突破率加成。 */
  luck: number
  /** 突破丹藥提供的突破率加成。 */
  pill: number
  /** 已裝備功法提供的突破率加成。 */
  cultivationMethod: number
  /** 歷次突破失敗累積的保底加成。 */
  pity: number
  /** 尚未套用上下限前的突破率。 */
  unclamped: number
  /** 套用上下限後實際使用的突破率。 */
  final: number
}

/** 單次突破的機率、消耗與角色狀態結算。 */
export interface BreakthroughData {
  /** 本次突破是否成功。 */
  succeeded: boolean
  /** 可追溯本次隨機結果的 seed 參考值。 */
  seedReference: string
  /** 後端本次抽出的突破點數。 */
  roll: number
  /** 本次突破成功率的完整計算明細。 */
  chance: BreakthroughChanceBreakdown
  /** 本次突破實際消耗的資源。 */
  consumption: {
    /** 本次消耗的靈石。 */
    spiritStones: number
    /** 本次消耗的丹藥模板 ID，未使用時為 null。 */
    pillTemplateId: string | null
    /** 本次消耗的丹藥數量。 */
    pillQuantity: number
  }
  /** 突破前的境界與修為摘要。 */
  before: {
    /** 突破前的大境界。 */
    realm: Realm
    /** 突破前的累積修為。 */
    cultivation: number
  }
  /** 突破完成後的角色狀態摘要。 */
  after: {
    /** 結算後的大境界。 */
    realm: Realm
    /** 結算後的小境界。 */
    minorRealm: MinorRealm
    /** 結算後的累積修為。 */
    cultivation: number
    /** 結算後境界的修為上限。 */
    cultivationCap: number
    /** 結算後的當前生命值。 */
    currentHp: number
    /** 結算後的當前靈力值。 */
    currentMp: number
    /** 扣除突破費用後剩餘的靈石。 */
    spiritStones: number
    /** 結算後累積的突破保底加成。 */
    breakthroughPity: number
  }
}

export type BreakthroughRes = ApiSuccess<BreakthroughData>

/** 嘗試突破目前大境界。 */
export const breakthrough = async (
  params: BreakthroughParams,
  options: MutationOptions,
): Promise<BreakthroughRes> => {
  const { data } = await apiClient.post<BreakthroughRes>(
    apiEndpoints.breakthrough.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
