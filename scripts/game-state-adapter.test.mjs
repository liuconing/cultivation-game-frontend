import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createGameViewCaveState,
  getRootUpgradeUnavailableReasonLabel,
} from '../src/views/gameShell/game-state.adapter.ts'

test('靈根精華不足原因會轉成中文', () => {
  assert.equal(
    getRootUpgradeUnavailableReasonLabel(
      'INSUFFICIENT_SPIRITUAL_ROOT_ESSENCE',
    ),
    '靈根精華不足，無法提升靈根品質。',
  )
})

test('未知靈根原因不會直接顯示後端錯誤碼', () => {
  assert.equal(
    getRootUpgradeUnavailableReasonLabel('UNKNOWN_REASON'),
    '目前無法提升靈根品質。',
  )
  assert.equal(getRootUpgradeUnavailableReasonLabel(null), null)
})

test('洞府會保留生命與靈力的獨立恢復時間', () => {
  const cave = createGameViewCaveState({
    healthRecoveryPercentPerMinute: 10,
    spiritRecoveryPercentPerMinute: 10,
    currentHp: 50,
    currentMp: 80,
    maxHp: 100,
    maxMp: 100,
    isFullyRestored: false,
    healthSecondsToFull: 300,
    spiritSecondsToFull: 120,
    healthFullyRestoredAt: '2026-01-01T00:05:00.000Z',
    spiritFullyRestoredAt: '2026-01-01T00:02:00.000Z',
    secondsToFull: 300,
    fullyRestoredAt: '2026-01-01T00:05:00.000Z',
    instantCompleteCost: 35,
  })

  assert.equal(cave.healthSecondsToFull, 300)
  assert.equal(cave.spiritSecondsToFull, 120)
  assert.equal(cave.healthRecoveryPercentPerMinute, 10)
  assert.equal(cave.spiritRecoveryPercentPerMinute, 10)
  assert.equal(cave.finishNowCost, 35)
})
