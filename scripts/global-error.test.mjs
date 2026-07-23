import assert from 'node:assert/strict'
import test from 'node:test'
import { createGlobalErrorNotice } from '../src/error/global-error.ts'

test('網路錯誤轉為連線失敗通知', () => {
  assert.deepEqual(
    createGlobalErrorNotice({
      status: null,
      code: null,
      message: 'network error',
    }),
    {
      title: '連線失敗',
      message: '無法連線至伺服器，請確認網路後再試。',
      code: null,
      status: null,
    },
  )
})

test('403 轉為權限錯誤通知', () => {
  assert.deepEqual(
    createGlobalErrorNotice({
      status: 403,
      code: 'FORBIDDEN',
      message: 'forbidden',
    }),
    {
      title: '沒有操作權限',
      message: '目前帳號無法執行此操作。',
      code: 'FORBIDDEN',
      status: 403,
    },
  )
})

test('429 轉為頻率限制通知', () => {
  assert.deepEqual(
    createGlobalErrorNotice({
      status: 429,
      code: 'RATE_LIMITED',
      message: 'too many requests',
    }),
    {
      title: '請求過於頻繁',
      message: '操作次數過多，請稍候再試。',
      code: 'RATE_LIMITED',
      status: 429,
    },
  )
})

test('5xx 轉為系統異常通知', () => {
  assert.deepEqual(
    createGlobalErrorNotice({
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      message: 'service unavailable',
    }),
    {
      title: '系統暫時無法使用',
      message: '服務目前發生異常，請稍後再試。',
      code: 'SERVICE_UNAVAILABLE',
      status: 503,
    },
  )
})

test('未知業務錯誤使用共通操作失敗通知', () => {
  assert.deepEqual(
    createGlobalErrorNotice({
      status: 400,
      code: 'UNKNOWN_BUSINESS_ERROR',
      message: 'unknown error',
    }),
    {
      title: '操作未完成',
      message: '目前無法完成此操作，請檢查內容後再試。',
      code: 'UNKNOWN_BUSINESS_ERROR',
      status: 400,
    },
  )
})

test('401 交由 session 處理而不建立全域通知', () => {
  assert.equal(
    createGlobalErrorNotice({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'unauthorized',
    }),
    null,
  )
})
