import { apiEndpoints } from '../src/domain/repository/endpoints.ts'

/**
 * 取得 CLI 可直接連線的絕對後端網址。
 *
 * @returns API smoke 使用且不含結尾斜線的 base URL。
 */
const resolveBaseUrl = () => {
  const viteBaseUrl = process.env.VITE_API_BASE_URL
  const absoluteViteBaseUrl =
    viteBaseUrl?.startsWith('http://') ||
    viteBaseUrl?.startsWith('https://')
      ? viteBaseUrl
      : undefined

  return (
    process.env.API_SMOKE_BASE_URL ??
    process.env.API_PROXY_TARGET ??
    absoluteViteBaseUrl ??
    'http://localhost:3001'
  ).replace(/\/+$/, '')
}

const baseUrl = resolveBaseUrl()

const expectedResponses = {
  success: { status: 200, ok: true },
  validation: { status: 400, ok: false, code: 'VALIDATION_ERROR' },
  unauthorized: { status: 401, ok: false, code: 'UNAUTHORIZED' },
}

/** 對單一 endpoint 發出不會異動資料的連線驗證。 */
const verifyEndpoint = async (name, endpoint) => {
  const path = endpoint.path('smoke-instance')
  const request = {
    method: endpoint.method,
    headers: { Accept: 'application/json' },
  }

  if (endpoint.method === 'POST') {
    request.headers['Content-Type'] = 'application/json'
    request.body = JSON.stringify(endpoint.smokeBody ?? {})
  }

  const response = await fetch(`${baseUrl}${path}`, request)
  const text = await response.text()
  let body

  try {
    body = JSON.parse(text)
  } catch {
    throw new Error(`${name} 回傳非 JSON 內容：${text.slice(0, 120)}`)
  }

  const expected = expectedResponses[endpoint.smokeExpectation]

  if (response.status !== expected.status) {
    throw new Error(
      `${name} 預期 HTTP ${expected.status}，實際為 ${response.status}`,
    )
  }

  if (body?.ok !== expected.ok) {
    throw new Error(`${name} 回傳的 API envelope 不正確`)
  }

  if ('code' in expected && body?.code !== expected.code) {
    throw new Error(
      `${name} 預期錯誤碼 ${expected.code}，實際為 ${String(body?.code)}`,
    )
  }

  if (expected.ok && !('data' in body)) {
    throw new Error(`${name} 成功回應缺少 data`)
  }

  console.log(`PASS ${endpoint.method} ${path}`)
}

/** 驗證合法格式但不存在的帳密會回傳穩定錯誤碼。 */
const verifyInvalidCredentials = async () => {
  const response = await fetch(
    `${baseUrl}${apiEndpoints.login.path()}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'fe-01-missing-account@example.invalid',
        password: 'not-a-real-password',
      }),
    },
  )
  const body = await response.json()

  if (
    response.status !== 401 ||
    body?.ok !== false ||
    body?.code !== 'INVALID_CREDENTIALS'
  ) {
    throw new Error(
      '登入錯誤帳密未回傳 401 INVALID_CREDENTIALS',
    )
  }

  console.log('PASS POST /auth/login INVALID_CREDENTIALS')
}

if (Object.keys(apiEndpoints).length !== 21) {
  throw new Error(
    `endpoint registry 應有 21 筆，實際為 ${Object.keys(apiEndpoints).length}`,
  )
}

console.log(`API smoke base URL: ${baseUrl}`)

try {
  for (const [name, endpoint] of Object.entries(apiEndpoints)) {
    await verifyEndpoint(name, endpoint)
  }
  await verifyInvalidCredentials()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`API smoke 失敗：${message}`)
  process.exitCode = 1
}
