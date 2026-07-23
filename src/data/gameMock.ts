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
  | 'turnLimit'
  | 'encounter'
  | 'bossFirstKill'
  | 'recovered'
  | 'largeInventory'

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
  title?: string
  enemyName?: string
  firstStrike?: string
  healthRemaining?: number
  spiritRemaining?: number
  enemyHealthRemaining?: number
  firstKill?: boolean
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
  effectTiming: 'instant' | 'battle_buff' | 'breakthrough'
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
  /** 後端 GameState 判定目前是否可升級靈根。 */
  canUpgradeRoot: boolean
  /** 後端回傳的靈根不可升級原因。 */
  rootUpgradeUnavailableReason: string | null
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
    title: '山林伏妖',
    enemyName: '青鱗蟒',
    firstStrike: '你以較高速度取得先手。',
    healthRemaining: 7310,
    spiritRemaining: 664,
    enemyHealthRemaining: 0,
    log: [
      '第 1 回合・流雲劍訣命中，造成 318 點傷害。',
      '第 2 回合・青鱗蟒毒牙落空。',
      '第 3 回合・觸發暴擊，造成 602 點傷害。',
      '第 4 回合・中毒狀態造成 48 點傷害。',
      '第 5 回合・凝神訣恢復 32 點靈力。',
      '第 6 回合・青鱗蟒倒下。',
    ],
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
    {
      id: 'item-003',
      templateId: 'material_spirit_ore',
      name: '玄鐵靈礦',
      type: 'material',
      quality: '上品',
      quantity: 48,
    },
    {
      id: 'item-004',
      templateId: 'method_mist_01',
      name: '煙霞吐納篇',
      type: 'method',
      quality: '良品',
      quantity: 1,
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
    {
      id: 'equipment-003',
      name: '秋水長劍',
      slot: '武器',
      quality: '上品',
      attributes: ['攻擊 +154', '命中率 +6.8%', '靈力 +90'],
      equipped: false,
    },
    {
      id: 'equipment-004',
      name: '踏雲履',
      slot: '鞋子',
      quality: '極品',
      attributes: ['速度 +72', '閃避率 +5.1%'],
      equipped: false,
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
    {
      templateId: 'method_mist_01',
      name: '煙霞吐納篇',
      quality: '良品',
      minimumRealm: '練氣',
      cultivationMultiplier: 1.18,
      equipped: false,
    },
    {
      templateId: 'method_future_01',
      name: '九轉金丹錄',
      quality: '極品',
      minimumRealm: '金丹',
      cultivationMultiplier: 1.88,
      equipped: false,
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
    {
      templateId: 'skill_thunder_01',
      name: '驚雷指',
      kind: 'active',
      spiritCost: 58,
      description: '造成高額雷屬性傷害，冷卻 3 回合。',
      equipped: false,
    },
    {
      templateId: 'skill_guard_01',
      name: '玄門護體',
      kind: 'passive',
      spiritCost: 0,
      description: '生命低於 30% 時提高防禦。',
      equipped: false,
    },
  ],
  pills: [
    {
      templateId: 'pill_heal_01',
      name: '小還丹',
      effect: '恢復 25% 最大生命',
      effectTiming: 'instant',
      price: 320,
      quantity: 6,
    },
    {
      templateId: 'pill_breakthrough_01',
      name: '凝元丹',
      effect: '本次突破成功率 +8%',
      effectTiming: 'breakthrough',
      price: 1800,
      quantity: 1,
    },
    {
      templateId: 'pill_spirit_01',
      name: '回靈丹',
      effect: '恢復 30% 最大靈力',
      effectTiming: 'instant',
      price: 420,
      quantity: 3,
    },
    {
      templateId: 'pill_cultivation_01',
      name: '聚氣丹',
      effect: '立即獲得 500 點修為',
      effectTiming: 'instant',
      price: 960,
      quantity: 2,
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
    canUpgradeRoot: true,
    rootUpgradeUnavailableReason: null,
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
      title: '山谷敗退',
      enemyName: '裂風妖狼',
      firstStrike: '裂風妖狼取得先手，境界壓制生效。',
      healthRemaining: 0,
      spiritRemaining: 18,
      enemyHealthRemaining: 1320,
      log: [
        '第 1 回合・裂風爪命中，造成 412 點傷害。',
        '第 4 回合・你的靈氣斬落空。',
        '第 9 回合・流血狀態疊加至 3 層。',
        '第 14 回合・生命歸零，探索失敗。',
      ],
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
  turnLimit: createScenarioFixture('turnLimit', {
    notice: '雙方鏖戰 30 回合，探索依規則判定失敗。',
    battle: {
      id: 'battle-turn-limit',
      result: 'turn-limit',
      rounds: 30,
      title: '三十回合鏖戰',
      enemyName: '石甲玄龜',
      firstStrike: '石甲玄龜展開護甲，你取得先手。',
      healthRemaining: 2480,
      spiritRemaining: 0,
      enemyHealthRemaining: 860,
      log: Array.from({ length: 30 }, (_, index) => {
        const round = index + 1
        if (round % 7 === 0) {
          return `第 ${round} 回合・靈氣斬暴擊，石甲狀態抵銷部分傷害。`
        }
        if (round % 5 === 0) {
          return `第 ${round} 回合・你的攻擊落空，靈力剩餘 ${Math.max(0, 180 - round * 6)}。`
        }
        if (round % 3 === 0) {
          return `第 ${round} 回合・石甲玄龜命中，造成 ${90 + round * 3} 點傷害。`
        }
        return `第 ${round} 回合・流雲劍訣命中，造成 ${120 + round * 4} 點傷害。`
      }),
      rewards: [],
    },
  }),
  encounter: createScenarioFixture('encounter', {
    notice: '偶遇雲遊丹師，未觸發戰鬥。',
    battle: null,
  }),
  bossFirstKill: createScenarioFixture('bossFirstKill', {
    notice: 'Boss 首殺成功，額外獎勵已加入摘要。',
    battle: {
      id: 'battle-boss-first-kill',
      result: 'victory',
      rounds: 12,
      title: '山谷之主',
      enemyName: '赤角妖王',
      firstStrike: '赤角妖王咆哮震懾，你仍搶得先手。',
      healthRemaining: 4210,
      spiritRemaining: 206,
      enemyHealthRemaining: 0,
      firstKill: true,
      log: [
        '第 1 回合・靈氣斬命中，造成 488 點傷害。',
        '第 3 回合・赤角衝撞暴擊，造成 826 點傷害。',
        '第 5 回合・你進入破甲狀態，防禦降低 12%。',
        '第 8 回合・凝神訣觸發，恢復 40 點靈力。',
        '第 11 回合・流雲劍訣暴擊，造成 1,204 點傷害。',
        '第 12 回合・赤角妖王倒下，完成首殺。',
      ],
      rewards: [
        '修為 2,400',
        '靈石 6,800',
        '靈根精華 x12',
        '赤角王冠 x1',
        'Boss 首殺寶匣 x1',
      ],
    },
  }),
  recovered: createScenarioFixture('recovered', {
    notice: '生命與靈力皆已回滿，無需支付靈石。',
    character: {
      ...baseGameState.character,
      health: baseGameState.character.maxHealth,
      spiritPower: baseGameState.character.maxSpiritPower,
    },
    cave: {
      ...baseGameState.cave,
      minutesToFull: 0,
    },
  }),
  largeInventory: createScenarioFixture('largeInventory', {
    notice: '大量背包情境，共 48 組物品堆疊。',
    inventory: Array.from({ length: 48 }, (_, index) => ({
      id: `bulk-item-${String(index + 1).padStart(2, '0')}`,
      templateId: `bulk_template_${String(index + 1).padStart(2, '0')}`,
      name: `雲海秘境採集物・第 ${index + 1} 組長名稱`,
      type: (
        ['material', 'pill', 'method'] as const
      )[index % 3],
      quality: (
        ['凡品', '良品', '上品', '極品'] as const
      )[index % 4],
      quantity: (index + 1) * 1280,
    })),
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
  { value: 'turnLimit', label: '30 回合失敗', tone: 'cinnabar' },
  { value: 'encounter', label: '奇遇事件', tone: 'jade' },
  { value: 'bossFirstKill', label: 'Boss 首殺', tone: 'gold' },
  { value: 'recovered', label: '休養已回滿', tone: 'jade' },
  { value: 'largeInventory', label: '大量背包', tone: 'gold' },
]

export const getMockGameState = (scenario: MockScenario): MockGameState => {
  return structuredClone(mockGameStateFixtures[scenario])
}
