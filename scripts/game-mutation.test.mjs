import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createOperationIntentFingerprint,
  createOperationIntentLifecycle,
} from '../src/views/gameShell/game-mutation.ts'

test('首次資源異動會建立新的冪等鍵', () => {
  const lifecycle = createOperationIntentLifecycle(
    'explore',
    () => 'new-key',
  )

  assert.equal(lifecycle.acquire({ mapId: 'map-1' }).idempotencyKey, 'new-key')
})

test('網路失敗後重試會沿用原本的冪等鍵', () => {
  let createCount = 0
  const lifecycle = createOperationIntentLifecycle('explore', () => {
    createCount += 1
    return `key-${createCount}`
  })
  const first = lifecycle.acquire({ mapId: 'map-1' })
  const retry = lifecycle.acquire({ mapId: 'map-1' })

  assert.equal(retry.idempotencyKey, first.idempotencyKey)
  assert.equal(createCount, 1)
})

test('參數改變、成功或取消後會建立新冪等鍵', () => {
  let createCount = 0
  const lifecycle = createOperationIntentLifecycle('equip', () => {
    createCount += 1
    return `key-${createCount}`
  })

  const first = lifecycle.acquire({ instanceId: 'equipment-1' })
  const changed = lifecycle.acquire({ instanceId: 'equipment-2' })
  lifecycle.complete({ instanceId: 'equipment-2' })
  const afterSuccess = lifecycle.acquire({
    instanceId: 'equipment-2',
  })
  lifecycle.cancel()
  const afterCancel = lifecycle.acquire({
    instanceId: 'equipment-2',
  })

  assert.notEqual(changed.idempotencyKey, first.idempotencyKey)
  assert.notEqual(afterSuccess.idempotencyKey, changed.idempotencyKey)
  assert.notEqual(afterCancel.idempotencyKey, afterSuccess.idempotencyKey)
})

test('物件欄位順序不影響操作意圖指紋', () => {
  assert.equal(
    createOperationIntentFingerprint('skills', {
      active: 'a',
      passive: 'p',
    }),
    createOperationIntentFingerprint('skills', {
      passive: 'p',
      active: 'a',
    }),
  )
})
