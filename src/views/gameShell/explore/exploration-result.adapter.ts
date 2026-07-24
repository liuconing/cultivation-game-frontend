import type { ExplorationData } from '@/domain/repository'
import type { GameViewBattle } from '../game-view-state'

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

const rewardTypeLabels: Record<
  ExplorationData['rewards'][number]['type'],
  string
> = {
  cultivation: '修為',
  spirit_stones: '靈石',
  spiritual_root_essence: '靈根精華',
  item: '物品',
}

/** 將後端獎勵 DTO 轉成既有結果層的顯示文字。 */
const mapRewards = (result: ExplorationData): string[] => {
  return result.rewards.map((reward) => {
    const label = rewardTypeLabels[reward.type] ?? '未知獎勵'
    const template = reward.templateId
      ? `（${reward.templateId}）`
      : ''
    return `${label}${template} × ${reward.amount.toLocaleString()}`
  })
}

/** 將後端探索結算安全轉成全螢幕結果層資料。 */
export const createExplorationResultView = (
  result: ExplorationData,
): ExplorationResultView => {
  const createdEquipmentIds = result.createdEquipment.map(
    (equipment) => equipment.instanceId,
  )
  const isBattle =
    result.eventType === 'battle' &&
    Array.isArray(result.battleLog)

  if (!isBattle) {
    const eventMessages: Partial<
      Record<ExplorationData['eventType'], string>
    > = {
      resource: '你在探索途中發現一處資源，獎勵已結算。',
      item: '你在遺跡中取得物品，已放入背包。',
      encounter: '你遇見一場機緣，所得內容已記錄。',
      empty: '此行風平浪靜，沒有額外收穫。',
    }
    return {
      kind: 'event',
      title: '探索事件',
      battle: null,
      eventMessage:
        eventMessages[result.eventType] ??
        '探索已完成，結果已由後端安全結算。',
      createdEquipmentIds,
      rewardLines: mapRewards(result),
    }
  }

  const log = result.battleLog ?? []
  const rounds = log.reduce(
    (maximum, entry) => Math.max(maximum, entry.round),
    0,
  )
  const victory = result.result === 'win'

  return {
    kind: 'battle',
    title: victory ? '探索勝利' : '探索失利',
    battle: {
      id: result.seedReference,
      result: victory ? 'victory' : 'defeat',
      rounds,
      log: log.map((entry) => ({
        round: entry.round,
        message: entry.message,
        hit: entry.hit,
        critical: entry.critical,
        damage: entry.damage,
        targetHp: entry.targetHp,
      })),
      rewards: mapRewards(result),
      title: victory ? '戰鬥勝利' : '戰鬥失利',
      enemyName: '探索對手',
      firstStrike: log[0]?.message ?? '戰鬥已由後端結算。',
      healthRemaining: result.characterAfter.stats.currentHp,
      spiritRemaining: result.characterAfter.stats.currentMp,
      enemyHealthRemaining:
        log.at(-1)?.targetHp ?? (victory ? 0 : undefined),
      firstKill: result.rewards.some(
        (reward) => reward.type === 'spiritual_root_essence',
      ),
    },
    eventMessage: '',
    createdEquipmentIds,
    rewardLines: mapRewards(result),
  }
}
