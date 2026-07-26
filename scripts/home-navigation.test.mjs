import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPostAuthRoute,
  getPreservedRoute,
} from '../src/router/route-state.ts'
import { resolveHomeAction } from '../src/views/home/home-navigation.ts'

const homeActionCases = [
  {
    name: '未登入時顯示登入並保留原始遊戲路徑',
    status: 'anonymous',
    from: '/game/explore?map=forest',
    expected: {
      kind: 'link',
      label: '登入',
      to: '/login',
      from: '/game/explore?map=forest',
    },
  },
  {
    name: '尚無角色時提供建立角色入口',
    status: 'noCharacter',
    from: null,
    expected: {
      kind: 'link',
      label: '建立角色',
      to: '/character/create',
      from: null,
    },
  },
  {
    name: '已有角色時提供遊戲入口',
    status: 'ready',
    from: null,
    expected: {
      kind: 'link',
      label: '進入遊戲',
      to: '/game/cultivation',
      from: null,
    },
  },
  {
    name: 'Session 錯誤時提供重新確認',
    status: 'error',
    from: null,
    expected: {
      kind: 'retry',
      label: '重新確認',
      to: null,
      from: null,
    },
  },
  {
    name: '持久化還原期間停用主要操作',
    status: 'hydrating',
    from: null,
    expected: {
      kind: 'pending',
      label: '確認道籍中',
      to: null,
      from: null,
    },
  },
  {
    name: '角色檢查期間停用主要操作',
    status: 'checking',
    from: null,
    expected: {
      kind: 'pending',
      label: '確認道籍中',
      to: null,
      from: null,
    },
  },
]

for (const homeActionCase of homeActionCases) {
  test(homeActionCase.name, () => {
    assert.deepEqual(
      resolveHomeAction(homeActionCase.status, homeActionCase.from),
      homeActionCase.expected,
    )
  })
}

test('只接受安全的站內受保護來源路徑', () => {
  assert.equal(
    getPreservedRoute({ from: '/game/loadout?tab=equipment' }),
    '/game/loadout?tab=equipment',
  )
  assert.equal(getPreservedRoute({ from: 'https://example.com' }), null)
  assert.equal(getPreservedRoute({ from: '//example.com' }), null)
  assert.equal(getPreservedRoute({ from: '/login' }), null)
  assert.equal(getPreservedRoute({ from: '/' }), null)
})

test('登入成功有來源時返回原路徑，否則交由 game 守衛分流', () => {
  assert.equal(
    getPostAuthRoute({ from: '/game/explore' }),
    '/game/explore',
  )
  assert.equal(getPostAuthRoute(undefined), '/game')
  assert.equal(getPostAuthRoute({ from: '/register' }), '/game')
})
