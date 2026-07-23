import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const sourcePath = new URL(
  '../src/views/login/auth-submit-flow.ts',
  import.meta.url,
)
const source = await readFile(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
const { submitAuthFlow } = await import(moduleUrl)

test('註冊完成後才執行自動登入', async () => {
  const calls = []
  const result = await submitAuthFlow(
    'register',
    { email: 'user@example.com', password: 'password123' },
    {
      register: async () => {
        calls.push('register')
      },
      login: async () => {
        calls.push('login')
        return 'session'
      },
    },
  )

  assert.deepEqual(calls, ['register', 'login'])
  assert.equal(result, 'session')
})

test('註冊失敗時不會提前送出登入', async () => {
  const calls = []

  await assert.rejects(
    submitAuthFlow(
      'register',
      { email: 'user@example.com', password: 'password123' },
      {
        register: async () => {
          calls.push('register')
          throw new Error('register failed')
        },
        login: async () => {
          calls.push('login')
          return 'session'
        },
      },
    ),
  )

  assert.deepEqual(calls, ['register'])
})
