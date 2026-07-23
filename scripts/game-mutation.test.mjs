import assert from 'node:assert/strict'
import test from 'node:test'
import { getOrCreateIdempotencyKey } from '../src/views/gameShell/game-mutation.ts'

test('首次資源異動會建立新的冪等鍵', () => {
  assert.equal(
    getOrCreateIdempotencyKey(null, () => 'new-key'),
    'new-key',
  )
})

test('網路失敗後重試會沿用原本的冪等鍵', () => {
  let createCount = 0
  const key = getOrCreateIdempotencyKey('same-key', () => {
    createCount += 1
    return 'different-key'
  })

  assert.equal(key, 'same-key')
  assert.equal(createCount, 0)
})
