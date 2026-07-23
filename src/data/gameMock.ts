export type MockScenario =
  | 'default'
  | 'success'
  | 'failure'
  | 'loading'
  | 'empty'
  | 'insufficient'
  | 'foundationComplete'
  | 'longName'
  | 'disconnected'
  | 'sessionExpired'
  | 'noMethod'

export type MockCharacter = {
  id: string
  name: string
  gender: '男' | '女' | '不公開'
  realm: string
  minorRealm: string
  spiritualRoot: string
  spiritualRootQuality: string
  cultivation: number
  cultivationTarget: number
  health: number
  maxHealth: number
  spiritPower: number
  maxSpiritPower: number
  spiritStones: number
}

export type MockMap = {
  id: string
  name: string
  recommendedRealm: string
  status: 'unlocked' | 'challenging' | 'locked'
  monsters: string[]
  possibleDrops: string[]
}

export type MockBattle = {
  id: string
  result: 'victory' | 'defeat' | 'turn-limit'
  rounds: number
  log: string[]
  rewards: string[]
}

export type MockInventoryItem = {
  id: string
  templateId: string
  name: string
  type: 'material' | 'pill' | 'equipment' | 'method'
  quality: '凡品' | '良品' | '上品' | '極品'
  quantity: number
}

export type MockEquipment = {
  id: string
  name: string
  slot: '武器' | '頭冠' | '胸甲' | '褲子' | '鞋子' | '飾品'
  quality: MockInventoryItem['quality']
  attributes: string[]
  equipped: boolean
}

export type MockCultivationMethod = {
  templateId: string
  name: string
  quality: MockInventoryItem['quality']
  minimumRealm: string
  cultivationMultiplier: number
  equipped: boolean
}

export type MockSkill = {
  templateId: string
  name: string
  kind: 'active' | 'passive'
  spiritCost: number
  description: string
  equipped: boolean
}

export type MockPill = {
  templateId: string
  name: string
  effect: string
  price: number
  quantity: number
}

export type MockCaveState = {
  recoveryPercentPerMinute: number
  minutesToFull: number
  finishNowCost: number
}

export type MockCultivationState = {
  idleMinutes: number
  idleCapMinutes: number
  claimableCultivation: number
  baseCultivationPerHour: number
  equippedMethodName: string | null
  methodMultiplier: number
  breakthroughBaseRate: number
  rootBonus: number
  luckBonus: number
  pillBonus: number
  methodBonus: number
  pityBonus: number
  finalRate: number
  spiritStoneCost: number
  pity: number
  rootEssence: number
  rootUpgradeCost: number
  nextRootQuality: string | null
  breakthroughOutcome: 'success' | 'failure'
}

export type MockGameState = {
  scenario: MockScenario
  notice: string | null
  character: MockCharacter
  maps: MockMap[]
  battle: MockBattle | null
  inventory: MockInventoryItem[]
  equipment: MockEquipment[]
  cultivationMethods: MockCultivationMethod[]
  skills: MockSkill[]
  pills: MockPill[]
  cave: MockCaveState
  cultivationState: MockCultivationState
  isLoading: boolean
}

const baseGameState: MockGameState = {
  scenario: 'default',
  notice: null,
  character: {
    id: 'character-001',
    name: '沈望舒・承天應命玄霄道君',
    gender: '不公開',
    realm: '練氣',
    minorRealm: '後期',
    spiritualRoot: '水木雙靈根',
    spiritualRootQuality: '地品',
    cultivation: 9420,
    cultivationTarget: 12000,
    health: 8420,
    maxHealth: 9800,
    spiritPower: 820,
    maxSpiritPower: 1000,
    spiritStones: 128640,
  },
  maps: [
    {
      id: 'mortal-forest',
      name: '凡俗山林',
      recommendedRealm: '凝氣',
      status: 'unlocked',
      monsters: ['赤眼山狼', '採藥盜匪'],
      possibleDrops: ['靈石', '止血草', '凡品裝備'],
    },
    {
      id: 'spirit-valley',
      name: '靈氣山谷',
      recommendedRealm: '練氣',
      status: 'challenging',
      monsters: ['青鱗蟒', '山谷守靈'],
      possibleDrops: ['靈石', '聚靈丹', '良品裝備'],
    },
    {
      id: 'ancient-cave',
      name: '古修洞府',
      recommendedRealm: '築基',
      status: 'locked',
      monsters: ['洞府傀儡', '古修殘念'],
      possibleDrops: ['靈根精華', '上品裝備', '古修功法'],
    },
  ],
  battle: {
    id: 'battle-001',
    result: 'victory',
    rounds: 6,
    log: ['你取得先手。', '流雲劍訣命中，造成 318 點傷害。', '青鱗蟒倒下。'],
    rewards: ['修為 240', '靈石 1,200', '青鱗 x2'],
  },
  inventory: [
    {
      id: 'item-001',
      templateId: 'material_spirit_herb',
      name: '凝露靈草',
      type: 'material',
      quality: '良品',
      quantity: 18,
    },
    {
      id: 'item-002',
      templateId: 'pill_heal_01',
      name: '小還丹',
      type: 'pill',
      quality: '凡品',
      quantity: 6,
    },
  ],
  equipment: [
    {
      id: 'equipment-001',
      name: '秋水長劍',
      slot: '武器',
      quality: '上品',
      attributes: ['攻擊 +180', '暴擊率 +3.2%'],
      equipped: true,
    },
    {
      id: 'equipment-002',
      name: '玄紋法袍',
      slot: '胸甲',
      quality: '良品',
      attributes: ['生命 +420', '防禦 +55'],
      equipped: true,
    },
  ],
  cultivationMethods: [
    {
      templateId: 'method_cloud_01',
      name: '太虛引氣篇',
      quality: '上品',
      minimumRealm: '凝氣',
      cultivationMultiplier: 1.42,
      equipped: true,
    },
  ],
  skills: [
    {
      templateId: 'skill_sword_01',
      name: '流雲劍訣',
      kind: 'active',
      spiritCost: 36,
      description: '對單一敵人造成靈力傷害。',
      equipped: true,
    },
    {
      templateId: 'skill_breath_01',
      name: '綿息',
      kind: 'passive',
      spiritCost: 0,
      description: '提升最大靈力與回復效率。',
      equipped: true,
    },
  ],
  pills: [
    {
      templateId: 'pill_heal_01',
      name: '小還丹',
      effect: '恢復 25% 最大生命',
      price: 320,
      quantity: 6,
    },
    {
      templateId: 'pill_breakthrough_01',
      name: '凝元丹',
      effect: '本次突破成功率 +8%',
      price: 1800,
      quantity: 1,
    },
  ],
  cave: {
    recoveryPercentPerMinute: 5,
    minutesToFull: 12,
    finishNowCost: 480,
  },
  cultivationState: {
    idleMinutes: 367,
    idleCapMinutes: 480,
    claimableCultivation: 1280,
    baseCultivationPerHour: 100,
    equippedMethodName: '太虛引氣訣',
    methodMultiplier: 1.42,
    breakthroughBaseRate: 45,
    rootBonus: 18,
    luckBonus: 4,
    pillBonus: 8,
    methodBonus: 6,
    pityBonus: 5,
    finalRate: 86,
    spiritStoneCost: 2000,
    pity: 1,
    rootEssence: 86,
    rootUpgradeCost: 60,
    nextRootQuality: '天品',
    breakthroughOutcome: 'success',
  },
  isLoading: false,
}

const createScenarioFixture = (
  scenario: MockScenario,
  overrides: Partial<MockGameState>,
): MockGameState => {
  return {
    ...structuredClone(baseGameState),
    scenario,
    ...overrides,
  }
}

export const mockGameStateFixtures: Record<MockScenario, MockGameState> = {
  default: createScenarioFixture('default', {}),
  success: createScenarioFixture('success', {
    notice: '修為已達圓滿，可展示突破成功結果。',
    character: {
      ...baseGameState.character,
      cultivation: baseGameState.character.cultivationTarget,
    },
  }),
  failure: createScenarioFixture('failure', {
    notice: '突破失敗，保底進度已提升。',
    character: {
      ...baseGameState.character,
      cultivation: baseGameState.character.cultivationTarget,
    },
    cultivationState: {
      ...baseGameState.cultivationState,
      breakthroughOutcome: 'failure',
      pity: 2,
      pityBonus: 10,
      finalRate: 91,
    },
    battle: {
      id: 'battle-002',
      result: 'defeat',
      rounds: 14,
      log: ['境界壓制使你的傷害降低。', '靈力耗盡，無法施放技能。'],
      rewards: [],
    },
  }),
  loading: createScenarioFixture('loading', {
    notice: '正在載入遊戲狀態……',
    isLoading: true,
  }),
  empty: createScenarioFixture('empty', {
    notice: '目前沒有可顯示的物品。',
    inventory: [],
    equipment: [],
    battle: null,
  }),
  insufficient: createScenarioFixture('insufficient', {
    notice: '靈石不足，無法完成此操作。',
    character: {
      ...baseGameState.character,
      spiritStones: 80,
      health: 2200,
      spiritPower: 12,
    },
  }),
  foundationComplete: createScenarioFixture('foundationComplete', {
    notice: '築基圓滿，金丹內容開發中。',
    character: {
      ...baseGameState.character,
      realm: '築基',
      minorRealm: '圓滿',
      cultivation: 36000,
      cultivationTarget: 36000,
    },
    cultivationState: {
      ...baseGameState.cultivationState,
      claimableCultivation: 0,
      nextRootQuality: null,
    },
  }),
  longName: createScenarioFixture('longName', {
    notice: '長名稱與大數值情境，用於檢查角色列與導覽穩定性。',
    character: {
      ...baseGameState.character,
      name: '雲海彼端觀星問道的無名劍修前輩',
      cultivation: 987654321,
      cultivationTarget: 1200000000,
      health: 84200000,
      maxHealth: 98000000,
      spiritPower: 8200000,
      maxSpiritPower: 10000000,
      spiritStones: 1286400000,
    },
  }),
  disconnected: createScenarioFixture('disconnected', {
    notice: '連線中斷，畫面保留最後一次成功載入的記憶體資料。',
  }),
  sessionExpired: createScenarioFixture('sessionExpired', {
    notice: '登入狀態已失效，請返回登入頁重新驗證。',
  }),
  noMethod: createScenarioFixture('noMethod', {
    notice: '目前未裝備功法，修煉倍率以 1 倍計算。',
    cultivationState: {
      ...baseGameState.cultivationState,
      equippedMethodName: null,
      methodMultiplier: 1,
      methodBonus: 0,
      finalRate: 80,
    },
  }),
}

export const mockScenarioOptions: Array<{
  value: MockScenario
  label: string
  tone: 'neutral' | 'jade' | 'cinnabar' | 'gold'
}> = [
  { value: 'default', label: '預設', tone: 'neutral' },
  { value: 'success', label: '成功', tone: 'jade' },
  { value: 'failure', label: '失敗', tone: 'cinnabar' },
  { value: 'loading', label: '載入', tone: 'gold' },
  { value: 'empty', label: '空資料', tone: 'neutral' },
  { value: 'insufficient', label: '資源不足', tone: 'cinnabar' },
  { value: 'foundationComplete', label: '築基圓滿', tone: 'gold' },
  { value: 'longName', label: '長名稱與大數值', tone: 'gold' },
  { value: 'disconnected', label: '連線中斷', tone: 'cinnabar' },
  { value: 'sessionExpired', label: 'Session 失效', tone: 'cinnabar' },
  { value: 'noMethod', label: '未裝備功法', tone: 'neutral' },
]

export const getMockGameState = (scenario: MockScenario): MockGameState => {
  return structuredClone(mockGameStateFixtures[scenario])
}
