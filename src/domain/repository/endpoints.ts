export type ApiEndpointMethod = 'GET' | 'POST'
export type ApiSmokeExpectation = 'success' | 'validation' | 'unauthorized'

/** API route 與無副作用 smoke test 共用的端點描述。 */
export interface ApiEndpointDefinition {
  /** 呼叫端點使用的 HTTP method。 */
  method: ApiEndpointMethod
  /** 依選填路徑參數產生實際 API path。 */
  path: (pathParameter?: string) => string
  /** 無副作用 smoke test 預期取得的回應類型。 */
  smokeExpectation: ApiSmokeExpectation
  /** smoke test 對 POST 端點送出的安全測試 body。 */
  smokeBody?: Record<string, never>
}

/** 建立不含 path parameter 的端點路徑函式。 */
const staticPath = (path: string) => () => path

/** 前端 domain 支援的所有後端公開端點。 */
export const apiEndpoints = {
  health: {
    method: 'GET',
    path: staticPath('/health'),
    smokeExpectation: 'success',
  },
  register: {
    method: 'POST',
    path: staticPath('/auth/register'),
    smokeExpectation: 'validation',
    smokeBody: {},
  },
  login: {
    method: 'POST',
    path: staticPath('/auth/login'),
    smokeExpectation: 'validation',
    smokeBody: {},
  },
  getMyCharacter: {
    method: 'GET',
    path: staticPath('/characters/me'),
    smokeExpectation: 'unauthorized',
  },
  createCharacter: {
    method: 'POST',
    path: staticPath('/characters'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  getGameState: {
    method: 'GET',
    path: staticPath('/game/state'),
    smokeExpectation: 'unauthorized',
  },
  claimCultivation: {
    method: 'POST',
    path: staticPath('/cultivation/claim'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  completeRest: {
    method: 'POST',
    path: staticPath('/rest/complete'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  explore: {
    method: 'POST',
    path: staticPath('/explorations'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  breakthrough: {
    method: 'POST',
    path: staticPath('/breakthrough'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  upgradeSpiritualRoot: {
    method: 'POST',
    path: staticPath('/spiritual-root/upgrade'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  compareEquipment: {
    method: 'GET',
    path: (instanceId = 'smoke-instance') =>
      `/equipment/${encodeURIComponent(instanceId)}/comparison`,
    smokeExpectation: 'unauthorized',
  },
  equipEquipment: {
    method: 'POST',
    path: staticPath('/equipment/equip'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  sellEquipment: {
    method: 'POST',
    path: staticPath('/inventory/sell'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  equipCultivationMethod: {
    method: 'POST',
    path: staticPath('/cultivation-methods/equip'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  equipSkills: {
    method: 'POST',
    path: staticPath('/skills/equip'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  getShopPills: {
    method: 'GET',
    path: staticPath('/shop/pills'),
    smokeExpectation: 'unauthorized',
  },
  purchasePill: {
    method: 'POST',
    path: staticPath('/shop/pills/purchase'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  usePill: {
    method: 'POST',
    path: staticPath('/inventory/pills/use'),
    smokeExpectation: 'unauthorized',
    smokeBody: {},
  },
  getItems: {
    method: 'GET',
    path: staticPath('/items'),
    smokeExpectation: 'success',
  },
  getMonsters: {
    method: 'GET',
    path: staticPath('/monsters'),
    smokeExpectation: 'success',
  },
} as const satisfies Record<string, ApiEndpointDefinition>
