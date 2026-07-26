import type { ExplorationDataDtp } from '@/domain'
import type { GameViewBattle } from '@/utils'

/** 探索結果層可辨識的正式畫面模型。 */
export interface ExplorationResultView {
  /** 結果是戰鬥或非戰鬥事件。 */
  kind: 'battle' | 'event'
  /** 結果頁標題。 */
  title: string
  /** 戰鬥事件的畫面資料；非戰鬥事件為 null。 */
  battle: GameViewBattle | null
  /** 非戰鬥事件或未知事件的安全說明。 */
  eventMessage: string
  /** 後端建立的裝備 instance ID。 */
  createdEquipmentIds: string[]
  /** 後端結算的獎勵顯示文字。 */
  rewardLines: string[]
}

const rewardTypeLabels: Record<ExplorationDataDtp['rewards'][number]['type'], string> = {
  cultivation: '修為',
  spirit_stones: '靈石',
  spiritual_root_essence: '靈根精華',
  item: '物品',
}

/** 將後端獎勵 DTO 轉成既有結果層的顯示文字。 */
const mapRewards = (result: ExplorationDataDtp): string[] => {
  return result.rewards.map((reward) => {
    const label = rewardTypeLabels[reward.type] ?? '未知獎勵'
    const template = reward.templateId ? `（${reward.templateId}）` : ''
    return `${label}${template} × ${reward.amount.toLocaleString()}`
  })
}

/** 將後端探索結算安全轉成全螢幕結果層資料。 */
export const createExplorationResultView = (result: ExplorationDataDtp): ExplorationResultView => {
  const createdEquipmentIds = result.createdEquipment.map((equipment) => equipment.instanceId)
  const isBattle = result.eventType === 'battle' && Array.isArray(result.battleLog)

  if (!isBattle) {
    const eventMessages: Partial<Record<ExplorationDataDtp['eventType'], string>> = {
      resource: '你在探索途中發現一處資源，獎勵已結算。',
      item: '你在遺跡中取得物品，已放入背包。',
      encounter: '你遇見一場機緣，所得內容已記錄。',
      empty: '此行風平浪靜，沒有額外收穫。',
    }
    return {
      kind: 'event',
      title: '探索事件',
      battle: null,
      eventMessage: eventMessages[result.eventType] ?? '探索已完成，結果已由後端安全結算。',
      createdEquipmentIds,
      rewardLines: mapRewards(result),
    }
  }

  const log = result.battleLog ?? []
  const summary = result.battleSummary
  const rounds = summary?.rounds ?? log.reduce((maximum, entry) => Math.max(maximum, entry.round), 0)
  const battleResult =
    summary?.reason === 'turn_limit'
      ? 'turn-limit'
      : (summary?.result ?? result.result) === 'win'
        ? 'victory'
        : 'defeat'
  const title = battleResult === 'victory' ? '探索勝利' : battleResult === 'turn-limit' ? '回合上限' : '探索失利'
  const battleHealth = summary?.player.after.currentHp
  const battleSpirit = summary?.player.after.currentMp
  const settledHealth = result.characterAfter.stats.currentHp
  const settledSpirit = result.characterAfter.stats.currentMp
  const hasSettlementAdjustment =
    summary !== undefined && (battleHealth !== settledHealth || battleSpirit !== settledSpirit)

  return {
    kind: 'battle',
    title,
    battle: {
      id: result.seedReference,
      result: battleResult,
      rounds,
      log: log.map((entry) => ({
        round: entry.round,
        actorName: entry.actorName,
        targetName: entry.targetName,
        message: entry.message,
        hit: entry.hit,
        critical: entry.critical,
        damage: entry.damage,
        targetHp: entry.targetHp,
      })),
      rewards: mapRewards(result),
      title,
      enemyName: summary?.enemy.name ?? '戰鬥摘要未提供',
      firstStrike: log[0]?.message ?? '戰鬥已由後端結算。',
      healthRemaining: battleHealth,
      spiritRemaining: battleSpirit,
      enemyHealthRemaining: summary?.enemy.after.currentHp,
      settledHealthRemaining: hasSettlementAdjustment ? settledHealth : undefined,
      settledSpiritRemaining: hasSettlementAdjustment ? settledSpirit : undefined,
      hasAuthoritativeSummary: summary !== undefined,
      firstKill: result.rewards.some((reward) => reward.type === 'spiritual_root_essence'),
    },
    eventMessage: '',
    createdEquipmentIds,
    rewardLines: mapRewards(result),
  }
}
