import assert from 'node:assert/strict'
import test from 'node:test'
import { getRootUpgradeUnavailableReasonLabel } from '../src/views/gameShell/game-state.adapter.ts'

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
