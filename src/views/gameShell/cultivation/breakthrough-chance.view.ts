import type { BreakthroughChanceBreakdown } from '@/domain/repository'

/** 突破率明細在畫面上的單一欄位。 */
export interface BreakthroughChanceRow {
  /** 穩定的畫面列表識別碼。 */
  id: keyof Omit<
    BreakthroughChanceBreakdown,
    'unclamped' | 'final'
  >
  /** 成功率來源的中文名稱。 */
  label: string
  /** 後端回傳的原始百分點。 */
  value: number
  /** 基礎率不加正號、額外加成加正號的顯示文字。 */
  formattedValue: string
}

/** 突破率區塊使用的完整顯示模型。 */
export interface BreakthroughChancePresentation {
  /** 基礎率與五項額外加成的顯示資料。 */
  rows: BreakthroughChanceRow[]
  /** 後端套用上下限後實際使用的成功率。 */
  final: number
  /** 發生上限封頂時的說明；沒有封頂時為 null。 */
  limitMessage: string | null
}

/** 突破率欄位的固定中文標籤。 */
const chanceLabels: Record<BreakthroughChanceRow['id'], string> = {
  base: '基礎',
  spiritualRoot: '靈根',
  luck: '氣運',
  pill: '丹藥',
  cultivationMethod: '功法',
  pity: '保底',
}

/**
 * 將後端突破率明細轉成不會誤解封頂規則的畫面模型。
 *
 * @param chance - 後端權威的成功率組成；尚未載入時可為空。
 * @returns 基礎率、額外加成、最終率與選用的封頂說明。
 *
 * 後端仍是成功率權威；前端只區分「基礎」與「加成」符號，
 * 並在 unclamped 大於 final 時揭露 95% 等規則上限。
 */
export const createBreakthroughChancePresentation = (
  chance?: BreakthroughChanceBreakdown | null,
): BreakthroughChancePresentation => {
  const values: BreakthroughChanceBreakdown = chance ?? {
    base: 0,
    spiritualRoot: 0,
    luck: 0,
    pill: 0,
    cultivationMethod: 0,
    pity: 0,
    unclamped: 0,
    final: 0,
  }
  const ids: BreakthroughChanceRow['id'][] = [
    'base',
    'spiritualRoot',
    'luck',
    'pill',
    'cultivationMethod',
    'pity',
  ]

  return {
    rows: ids.map((id) => ({
      id,
      label: chanceLabels[id],
      value: values[id],
      formattedValue:
        id === 'base' ? `${values[id]}%` : `+${values[id]}%`,
    })),
    final: values.final,
    limitMessage:
      values.unclamped > values.final
        ? `加成合計 ${values.unclamped}%・成功率上限 ${values.final}%`
        : null,
  }
}
