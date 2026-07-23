import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveRouteAccess } from '../src/router/route-access.ts'

const routeCases = [
  {
    name: '未登入進入遊戲時導向登入並保留來源',
    input: {
      pathname: '/game/explore',
      sessionStatus: 'anonymous',
    },
    expected: {
      kind: 'redirect',
      to: '/login',
      preserveFrom: true,
    },
  },
  {
    name: '未登入可停留登入頁',
    input: { pathname: '/login', sessionStatus: 'anonymous' },
    expected: { kind: 'allow' },
  },
  {
    name: '無角色進入遊戲時導向角色建立',
    input: {
      pathname: '/game/cultivation',
      sessionStatus: 'noCharacter',
    },
    expected: {
      kind: 'redirect',
      to: '/character/create',
      preserveFrom: false,
    },
  },
  {
    name: '無角色可停留角色建立頁',
    input: {
      pathname: '/character/create',
      sessionStatus: 'noCharacter',
    },
    expected: { kind: 'allow' },
  },
  {
    name: '有角色進入角色建立頁時導向遊戲',
    input: {
      pathname: '/character/create',
      sessionStatus: 'ready',
    },
    expected: {
      kind: 'redirect',
      to: '/game/cultivation',
      preserveFrom: false,
    },
  },
  {
    name: '有角色可停留遊戲子路由',
    input: {
      pathname: '/game/loadout',
      sessionStatus: 'ready',
    },
    expected: { kind: 'allow' },
  },
  {
    name: '未登入根路徑導向登入',
    input: { pathname: '/', sessionStatus: 'anonymous' },
    expected: {
      kind: 'redirect',
      to: '/login',
      preserveFrom: false,
    },
  },
  {
    name: '無角色根路徑導向角色建立',
    input: { pathname: '/', sessionStatus: 'noCharacter' },
    expected: {
      kind: 'redirect',
      to: '/character/create',
      preserveFrom: false,
    },
  },
  {
    name: '有角色根路徑導向預設遊戲頁',
    input: { pathname: '/', sessionStatus: 'ready' },
    expected: {
      kind: 'redirect',
      to: '/game/cultivation',
      preserveFrom: false,
    },
  },
  {
    name: '舊的 game 根路徑只導向一次預設頁',
    input: { pathname: '/game', sessionStatus: 'ready' },
    expected: {
      kind: 'redirect',
      to: '/game/cultivation',
      preserveFrom: false,
    },
  },
  {
    name: '啟動檢查期間顯示載入狀態',
    input: {
      pathname: '/game/cultivation',
      sessionStatus: 'checking',
    },
    expected: { kind: 'loading' },
  },
  {
    name: '啟動錯誤時顯示可重試錯誤狀態',
    input: {
      pathname: '/game/cultivation',
      sessionStatus: 'error',
    },
    expected: { kind: 'error' },
  },
  {
    name: 'Foundation 不等待登入狀態',
    input: {
      pathname: '/foundation',
      sessionStatus: 'hydrating',
    },
    expected: { kind: 'allow' },
  },
  {
    name: '未知路徑回到狀態入口',
    input: { pathname: '/unknown', sessionStatus: 'ready' },
    expected: {
      kind: 'redirect',
      to: '/',
      preserveFrom: false,
    },
  },
  {
    name: '未知遊戲子路徑不會顯示空白頁',
    input: { pathname: '/game/unknown', sessionStatus: 'ready' },
    expected: {
      kind: 'redirect',
      to: '/',
      preserveFrom: false,
    },
  },
]

for (const routeCase of routeCases) {
  test(routeCase.name, () => {
    assert.deepEqual(
      resolveRouteAccess(routeCase.input),
      routeCase.expected,
    )
  })
}
