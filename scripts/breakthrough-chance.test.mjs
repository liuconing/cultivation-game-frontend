import assert from 'node:assert/strict'
import test from 'node:test'
import { createBreakthroughChancePresentation } from '../src/views/gameShell/cultivation/breakthrough-chance.view.ts'

test('突破率封頂時會說明加成合計與實際上限', () => {
  const presentation = createBreakthroughChancePresentation({
    base: 95,
    spiritualRoot: 0,
    luck: 1,
    pill: 0,
    cultivationMethod: 3,
    pity: 0,
    unclamped: 99,
    final: 95,
  })

  assert.equal(presentation.rows[0]?.formattedValue, '95%')
  assert.equal(presentation.rows[2]?.formattedValue, '+1%')
  assert.equal(presentation.final, 95)
  assert.equal(
    presentation.limitMessage,
    '加成合計 99%・成功率上限 95%',
  )
})

test('未封頂時不顯示成功率上限說明', () => {
  const presentation = createBreakthroughChancePresentation({
    base: 85,
    spiritualRoot: 0,
    luck: 1,
    pill: 0,
    cultivationMethod: 3,
    pity: 0,
    unclamped: 89,
    final: 89,
  })

  assert.equal(presentation.final, 89)
  assert.equal(presentation.limitMessage, null)
})
