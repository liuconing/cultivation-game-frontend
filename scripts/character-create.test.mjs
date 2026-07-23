import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createCharacterRequest,
  validateCharacterCreation,
} from '../src/data/characterCreationMock.ts'

test('角色建立 request 只包含後端允許欄位', () => {
  assert.deepEqual(
    createCharacterRequest({
      name: '  沈望舒  ',
      gender: 'unknown',
      spiritualRootType: 'water',
    }),
    {
      name: '沈望舒',
      gender: 'unknown',
      spiritualRootType: 'water',
    },
  )
})

test('空白與過長姓名會被拒絕', () => {
  assert.equal(
    validateCharacterCreation({
      name: '   ',
      gender: 'unknown',
      spiritualRootType: 'metal',
    }).name,
    '請輸入角色姓名。',
  )
  assert.equal(
    validateCharacterCreation({
      name: '一二三四五六七八九十一二三',
      gender: 'unknown',
      spiritualRootType: 'metal',
    }).name,
    '角色姓名不可超過 12 字。',
  )
})
