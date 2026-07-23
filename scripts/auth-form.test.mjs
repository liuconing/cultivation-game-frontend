import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createInitialAuthFormValues,
  validateAuthForm,
} from '../src/data/auth.ts'

test('登入空白表單回傳 Email 與密碼錯誤', () => {
  assert.deepEqual(
    validateAuthForm('login', createInitialAuthFormValues()),
    {
      account: '請輸入 Email。',
      password: '請輸入密碼。',
    },
  )
})

test('登入拒絕錯誤 Email 與不足八字元密碼', () => {
  assert.deepEqual(
    validateAuthForm('login', {
      account: 'invalid-email',
      password: 'short',
      confirmPassword: '',
    }),
    {
      account: '請輸入有效的 Email 格式。',
      password: '密碼至少需要 8 個字元。',
    },
  )
})

test('註冊拒絕不一致的確認密碼', () => {
  assert.deepEqual(
    validateAuthForm('register', {
      account: 'new@example.com',
      password: 'password-a',
      confirmPassword: 'password-b',
    }),
    {
      confirmPassword: '兩次輸入的密碼不一致。',
    },
  )
})

test('合法登入與註冊欄位均通過驗證', () => {
  assert.deepEqual(
    validateAuthForm('login', {
      account: 'user@example.com',
      password: 'password',
      confirmPassword: '',
    }),
    {},
  )
  assert.deepEqual(
    validateAuthForm('register', {
      account: 'user@example.com',
      password: 'password',
      confirmPassword: 'password',
    }),
    {},
  )
})
