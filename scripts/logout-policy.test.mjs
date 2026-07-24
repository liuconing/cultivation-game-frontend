import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldFinalizeLogoutAfterError } from '../src/session/logout-policy.ts'

test('登出成功前只有 401 可以視為 token 已失效', () => {
  assert.equal(shouldFinalizeLogoutAfterError(401), true)
  assert.equal(shouldFinalizeLogoutAfterError(500), false)
  assert.equal(shouldFinalizeLogoutAfterError(null), false)
})
