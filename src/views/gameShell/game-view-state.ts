/** 正式遊戲頁顯示的角色摘要。 */
export interface GameViewCharacter {
  /** 角色唯一識別碼。 */
  id: string
  /** 角色顯示名稱。 */
  name: string
  /** 角色性別顯示文字。 */
  gender: '男' | '女' | '不公開'
  /** 目前大境界顯示文字。 */
  realm: string
  /** 目前小境界顯示文字。 */
  minorRealm: string
  /** 靈根類型顯示文字。 */
  spiritualRoot: string
  /** 靈根品質顯示文字。 */
  spiritualRootQuality: string
  /** 目前修為。 */
  cultivation: number
  /** 目前境界修為上限。 */
  cultivationTarget: number
  /** 目前生命。 */
  health: number
  /** 派生生命上限。 */
  maxHealth: number
  /** 目前靈力。 */
  spiritPower: number
  /** 派生靈力上限。 */
  maxSpiritPower: number
  /** 目前持有靈石。 */
  spiritStones: number
}

/** 正式探索頁顯示的地圖資料。 */
export interface GameViewMap {
  /** 地圖唯一識別碼。 */
  id: string
  /** 地圖顯示名稱。 */
  name: string
  /** 建議挑戰境界。 */
  recommendedRealm: string
  /** 相對角色狀態。 */
  status: 'unlocked' | 'challenging' | 'locked'
  /** 地圖可能出現的怪物名稱。 */
  monsters: string[]
  /** 地圖可能掉落的物品名稱。 */
  possibleDrops: string[]
  /** 角色與建議境界之間的階級差。 */
  realmDifference: number
  /** 後端計算的挑戰獎勵倍率。 */
  challengeRewardMultiplier: number
  /** 後端計算的掉落倍率。 */
  dropMultiplier: number
}

/** 正式探索結果顯示的單次戰鬥行動。 */
export interface GameViewBattleLogEntry {
  /** 發生行動的回合。 */
  round: number
  /** 發動行動者的顯示名稱。 */
  actorName: string
  /** 承受行動者的顯示名稱。 */
  targetName: string
  /** 後端產生的戰鬥敘述。 */
  message: string
  /** 本次行動是否命中。 */
  hit: boolean
  /** 本次命中是否為暴擊。 */
  critical: boolean
  /** 本次行動造成的傷害。 */
  damage: number
  /** 行動結束後目標剩餘生命。 */
  targetHp: number
}

/** 正式探索結果顯示的戰鬥摘要。 */
export interface GameViewBattle {
  /** 戰鬥結果唯一識別碼。 */
  id: string
  /** 戰鬥結局。 */
  result: 'victory' | 'defeat' | 'turn-limit'
  /** 戰鬥總回合數。 */
  rounds: number
  /** 後端結算的逐次戰鬥行動。 */
  log: GameViewBattleLogEntry[]
  /** 後端獎勵顯示文字。 */
  rewards: string[]
  /** 結果標題。 */
  title?: string
  /** 敵人名稱。 */
  enemyName?: string
  /** 先手說明。 */
  firstStrike?: string
  /** 結算後角色生命。 */
  healthRemaining?: number
  /** 結算後角色靈力。 */
  spiritRemaining?: number
  /** 結算後敵人生命。 */
  enemyHealthRemaining?: number
  /** 是否為 Boss 首次擊殺。 */
  firstKill?: boolean
}

/** 正式背包列表的一筆可堆疊物品。 */
export interface GameViewInventoryItem {
  /** 畫面列表識別碼。 */
  id: string
  /** 後端物品模板 ID。 */
  templateId: string
  /** 物品顯示名稱。 */
  name: string
  /** 畫面物品分類。 */
  type: 'material' | 'pill' | 'equipment' | 'method'
  /** 物品品質顯示文字。 */
  quality: '凡品' | '良品' | '上品' | '極品'
  /** 背包持有數量。 */
  quantity: number
}

/** 正式裝備列表的一件 instance。 */
export interface GameViewEquipment {
  /** 後端裝備 instance ID。 */
  id: string
  /** 裝備顯示名稱。 */
  name: string
  /** 裝備欄位。 */
  slot: '武器' | '頭冠' | '胸甲' | '褲子' | '鞋子' | '飾品'
  /** 裝備品質。 */
  quality: GameViewInventoryItem['quality']
  /** 固定效果與隨機詞條顯示文字。 */
  attributes: string[]
  /** 是否正在穿戴。 */
  equipped: boolean
}

/** 正式功法列表的一筆持有資料。 */
export interface GameViewCultivationMethod {
  /** 功法模板 ID。 */
  templateId: string
  /** 功法顯示名稱。 */
  name: string
  /** 功法品質。 */
  quality: GameViewInventoryItem['quality']
  /** 最低可用境界。 */
  minimumRealm: string
  /** 背包持有數量。 */
  quantity: number
  /** 目前角色境界是否符合。 */
  realmEligible: boolean
  /** 修煉速度倍率。 */
  cultivationMultiplier: number
  /** 突破成功率加成百分點。 */
  breakthroughBonus: number
  /** 是否為目前裝備功法。 */
  equipped: boolean
}

/** 正式技能配置的一筆技能資料。 */
export interface GameViewSkill {
  /** 技能模板 ID。 */
  templateId: string
  /** 技能顯示名稱。 */
  name: string
  /** 技能槽位類型。 */
  kind: 'active' | 'passive'
  /** 主動技能靈力消耗。 */
  spiritCost: number
  /** 技能效果說明。 */
  description: string
  /** 是否已配置。 */
  equipped: boolean
}

/** 正式背包顯示的一筆丹藥資料。 */
export interface GameViewPill {
  /** 丹藥模板 ID。 */
  templateId: string
  /** 丹藥顯示名稱。 */
  name: string
  /** 丹藥效果顯示文字。 */
  effect: string
  /** 丹藥使用時機。 */
  effectTiming: 'instant' | 'battle_buff' | 'breakthrough'
  /** 正式商店價格；背包投影時為零。 */
  price: number
  /** 背包持有數量。 */
  quantity: number
}

/** 正式洞府休養畫面資料。 */
export interface GameViewCaveState {
  /** 生命每分鐘恢復百分比。 */
  healthRecoveryPercentPerMinute: number
  /** 靈力每分鐘恢復百分比。 */
  spiritRecoveryPercentPerMinute: number
  /** 後端預估生命完全恢復秒數。 */
  healthSecondsToFull: number
  /** 後端預估靈力完全恢復秒數。 */
  spiritSecondsToFull: number
  /** 預計生命完全恢復時間，用於辨識新的倒數。 */
  healthFullyRestoredAt: string | null
  /** 預計靈力完全恢復時間，用於辨識新的倒數。 */
  spiritFullyRestoredAt: string | null
  /** 靈石立即完成費用。 */
  finishNowCost: number
}

/** 正式修煉、突破與靈根畫面資料。 */
export interface GameViewCultivationState {
  /** 已累積的有效離線分鐘數。 */
  idleMinutes: number
  /** 離線收益分鐘上限。 */
  idleCapMinutes: number
  /** 目前可領取修為。 */
  claimableCultivation: number
  /** 後端結算的每小時修煉速度。 */
  baseCultivationPerHour: number
  /** 目前裝備功法名稱。 */
  equippedMethodName: string | null
  /** 目前功法修煉倍率。 */
  methodMultiplier: number
  /** 目前突破保底次數。 */
  pity: number
  /** 目前靈根精華。 */
  rootEssence: number
  /** 下一品質升級所需精華。 */
  rootUpgradeCost: number
  /** 下一靈根品質。 */
  nextRootQuality: string | null
  /** 後端判定目前是否可升級靈根。 */
  canUpgradeRoot: boolean
  /** 後端回傳的不可升級原因。 */
  rootUpgradeUnavailableReason: string | null
}

/** 四個正式遊戲分頁共用的完整畫面模型。 */
export interface GameViewState {
  /** 角色摘要。 */
  character: GameViewCharacter
  /** 正式地圖列表。 */
  maps: GameViewMap[]
  /** 正式背包列表。 */
  inventory: GameViewInventoryItem[]
  /** 正式裝備 instance 列表。 */
  equipment: GameViewEquipment[]
  /** 正式功法列表。 */
  cultivationMethods: GameViewCultivationMethod[]
  /** 正式技能列表。 */
  skills: GameViewSkill[]
  /** 正式丹藥背包列表。 */
  pills: GameViewPill[]
  /** 洞府休養資料。 */
  cave: GameViewCaveState
  /** 修煉與靈根資料。 */
  cultivationState: GameViewCultivationState
  /** 物品 catalog 是否仍在載入。 */
  isLoading: boolean
}
