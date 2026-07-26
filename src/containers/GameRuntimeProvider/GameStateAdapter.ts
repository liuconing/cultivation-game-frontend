import type { GameStateData, ItemCatalogResponse, RestPreview } from '@/domain/repository'
import {
  getGameViewMapStatus,
  type GameViewState,
  type GameViewCaveState,
  type GameViewInventoryItem,
  type GameViewEquipment,
  type GameViewCultivationMethod,
  type GameViewSkill,
  type GameViewPill,
} from '@/utils'

const genderLabels: Record<string, GameViewState['character']['gender']> = {
  male: '男',
  female: '女',
  none: '不公開',
  unknown: '不公開',
}

const realmLabels: Record<string, string> = {
  qi_condensation: '凝氣境',
  qi_refining: '煉氣境',
  foundation: '築基境',
  golden_core: '金丹境',
  nascent_soul: '元嬰境',
  spirit_transformation: '化神境',
  body_integration: '合體境',
  mahayana: '大乘境',
  tribulation: '渡劫境',
  true_immortal: '真仙境',
}

const realmRanks: Record<string, number> = {
  qi_condensation: 0,
  qi_refining: 1,
  foundation: 2,
  golden_core: 3,
  nascent_soul: 4,
  spirit_transformation: 5,
  body_integration: 6,
  mahayana: 7,
  tribulation: 8,
  true_immortal: 9,
}

const minorRealmLabels: Record<string, string> = {
  early: '初期',
  middle: '中期',
  late: '後期',
  perfect: '圓滿',
}

const spiritualRootLabels: Record<string, string> = {
  metal: '金靈根',
  wood: '木靈根',
  water: '水靈根',
  fire: '火靈根',
  earth: '土靈根',
  thunder: '雷靈根',
  wind: '風靈根',
  ice: '冰靈根',
}

const rootQualityLabels: Record<string, string> = {
  low: '下品',
  middle: '中品',
  high: '上品',
  earth: '地品',
  heaven: '天品',
}

const rootUpgradeUnavailableReasonLabels: Record<string, string> = {
  INSUFFICIENT_SPIRITUAL_ROOT_ESSENCE: '靈根精華不足，無法提升靈根品質。',
  SPIRITUAL_ROOT_MAX_QUALITY: '靈根品質已達天品。',
}

/**
 * 將後端靈根升級原因碼轉成玩家可讀的中文訊息。
 *
 * @param reason - 後端回傳的穩定原因碼。
 * @returns 中文原因；沒有原因時回傳 null。
 */
export const getRootUpgradeUnavailableReasonLabel = (reason: string | null): string | null => {
  if (!reason) {
    return null
  }

  return rootUpgradeUnavailableReasonLabels[reason] ?? '目前無法提升靈根品質。'
}

/**
 * 將後端休養預覽轉成洞府使用的獨立恢復倒數。
 *
 * @param restPreview - 後端權威的生命與靈力恢復預覽。
 * @returns 洞府畫面使用的恢復狀態。
 */
export const createGameViewCaveState = (restPreview: RestPreview): GameViewCaveState => ({
  healthRecoveryPercentPerMinute: restPreview.healthRecoveryPercentPerMinute,
  spiritRecoveryPercentPerMinute: restPreview.spiritRecoveryPercentPerMinute,
  healthSecondsToFull: restPreview.healthSecondsToFull,
  spiritSecondsToFull: restPreview.spiritSecondsToFull,
  healthFullyRestoredAt: restPreview.healthFullyRestoredAt,
  spiritFullyRestoredAt: restPreview.spiritFullyRestoredAt,
  finishNowCost: restPreview.instantCompleteCost,
})

const itemTypeByCategory: Record<ItemCatalogResponse['category'], GameViewInventoryItem['type']> = {
  accessories: 'equipment',
  chest_armor: 'equipment',
  cultivation_methods: 'method',
  headgear: 'equipment',
  pants: 'equipment',
  pills: 'pill',
  shoes: 'equipment',
  weapons: 'equipment',
}

const qualityLabels: Record<ItemCatalogResponse['quality'], GameViewInventoryItem['quality']> = {
  fan: '凡品',
  huang: '良品',
  xuan: '上品',
  di: '極品',
  tian: '極品',
  xian: '極品',
}

const equipmentSlotLabels: Record<NonNullable<ItemCatalogResponse['slot']>, GameViewEquipment['slot']> = {
  accessory: '飾品',
  chest: '胸甲',
  head: '頭冠',
  method: '飾品',
  pants: '褲子',
  shoes: '鞋子',
  weapon: '武器',
}

/** 將後端物品效果轉成既有畫面可閱讀的文字。 */
const getEffectLabels = (item: ItemCatalogResponse): string[] => {
  return item.effects.map((effect) => effect.display)
}

/** 將後端 catalog 建立成以模板 ID 索引的查找表。 */
const createCatalogIndex = (items: ItemCatalogResponse[]): Map<string, ItemCatalogResponse> => {
  return new Map(items.map((item) => [item.id, item]))
}

/** 將正式 GameState 與 V1 catalog 轉成遊戲頁共用的畫面模型。 */
export const createGameViewState = (gameState: GameStateData, items: ItemCatalogResponse[]): GameViewState => {
  const catalog = createCatalogIndex(items)
  const equippedInstanceIds = new Set(
    Object.values(gameState.equipment).filter((instanceId): instanceId is string => instanceId !== null),
  )
  const inventory: GameViewInventoryItem[] = gameState.inventory.map((entry) => {
    const item = catalog.get(entry.templateId)
    return {
      id: entry.templateId,
      templateId: entry.templateId,
      name: item?.name ?? entry.templateId,
      type: item ? itemTypeByCategory[item.category] : 'material',
      quality: item ? qualityLabels[item.quality] : '凡品',
      quantity: entry.quantity,
    }
  })
  const equipment: GameViewEquipment[] = gameState.equipmentInstances.map((instance) => {
    const item = catalog.get(instance.templateId)
    return {
      id: instance.instanceId,
      name: item?.name ?? instance.templateId,
      slot: item?.slot && item.slot !== 'method' ? equipmentSlotLabels[item.slot] : '飾品',
      quality: item ? qualityLabels[item.quality] : '凡品',
      attributes: [...(item ? getEffectLabels(item) : []), ...instance.rolledAffixes.map((effect) => effect.display)],
      equipped: equippedInstanceIds.has(instance.instanceId),
    }
  })
  const cultivationMethods: GameViewCultivationMethod[] = gameState.inventory.flatMap((entry) => {
    const item = catalog.get(entry.templateId)
    if (!item || item.category !== 'cultivation_methods') {
      return []
    }
    const rateEffect = item.effects.find((effect) => effect.stat === 'cultivationRate')
    const breakthroughEffect = item.effects.find((effect) => effect.stat === 'breakthroughRate')
    return [
      {
        templateId: item.id,
        name: item.name,
        quality: qualityLabels[item.quality],
        minimumRealm: realmLabels[item.usableRealm] ?? item.usableRealmName,
        quantity: entry.quantity,
        realmEligible:
          (realmRanks[gameState.character.realm] ?? -1) >= (realmRanks[item.usableRealm] ?? Number.POSITIVE_INFINITY),
        cultivationMultiplier: rateEffect ? 1 + rateEffect.value / 100 : 1,
        breakthroughBonus: breakthroughEffect?.value ?? 0,
        equipped: gameState.equippedCultivationMethodId === item.id,
      },
    ]
  })
  const skills: GameViewSkill[] = gameState.skills
    .filter((skill) => skill.learned)
    .map((skill) => ({
      templateId: skill.id,
      name: skill.name,
      kind: skill.type,
      spiritCost: skill.mpCost ?? 0,
      description: skill.description,
      equipped: skill.equipped,
    }))
  const pills: GameViewPill[] = gameState.inventory.flatMap((entry) => {
    const item = catalog.get(entry.templateId)
    if (!item || item.category !== 'pills') {
      return []
    }
    return [
      {
        templateId: item.id,
        name: item.name,
        effect: getEffectLabels(item).join('、'),
        effectTiming: item.effectTiming ?? 'instant',
        price: 0,
        quantity: entry.quantity,
      },
    ]
  })

  return {
    character: {
      id: gameState.character.id,
      name: gameState.character.name,
      gender: genderLabels[gameState.character.gender] ?? genderLabels.unknown,
      realm: realmLabels[gameState.character.realm] ?? gameState.character.realm,
      minorRealm: minorRealmLabels[gameState.character.minorRealm] ?? gameState.character.minorRealm,
      spiritualRoot:
        spiritualRootLabels[gameState.character.spiritualRootType] ?? gameState.character.spiritualRootType,
      spiritualRootQuality:
        rootQualityLabels[gameState.character.spiritualRootQuality] ?? gameState.character.spiritualRootQuality,
      cultivation: gameState.character.cultivation,
      cultivationTarget: gameState.cultivationPreview.cultivationCap,
      health: gameState.restPreview.currentHp,
      maxHealth: gameState.derivedStats.maxHp,
      spiritPower: gameState.restPreview.currentMp,
      maxSpiritPower: gameState.derivedStats.maxMp,
      spiritStones: gameState.character.spiritStones,
    },
    maps: gameState.maps.map((map) => ({
      id: map.id,
      name: map.name,
      recommendedRealm: realmLabels[map.recommendedRealm] ?? map.recommendedRealm,
      status: getGameViewMapStatus(map.unlocked, map.realmDifference),
      monsters: [],
      possibleDrops: [],
      realmDifference: map.realmDifference,
      challengeRewardMultiplier: map.challengeRewardMultiplier,
      dropMultiplier: map.dropMultiplier,
    })),
    inventory,
    equipment,
    cultivationMethods,
    skills,
    pills,
    cave: createGameViewCaveState(gameState.restPreview),
    cultivationState: {
      idleMinutes: Math.floor(gameState.cultivationPreview.claimableSeconds / 60),
      idleCapMinutes: Math.floor(gameState.cultivationPreview.idleCapSeconds / 60),
      claimableCultivation: gameState.cultivationPreview.claimableCultivation,
      baseCultivationPerHour: gameState.cultivationPreview.cultivationPerHour,
      equippedMethodName: cultivationMethods.find((method) => method.equipped)?.name ?? null,
      methodMultiplier: cultivationMethods.find((method) => method.equipped)?.cultivationMultiplier ?? 1,
      pity: gameState.character.breakthroughPity,
      rootEssence: gameState.character.spiritualRootEssence,
      rootUpgradeCost: gameState.spiritualRootUpgradePreview.requiredEssence,
      nextRootQuality:
        gameState.spiritualRootUpgradePreview.nextQuality === null
          ? null
          : (rootQualityLabels[gameState.spiritualRootUpgradePreview.nextQuality] ??
            gameState.spiritualRootUpgradePreview.nextQuality),
      canUpgradeRoot: gameState.spiritualRootUpgradePreview.canUpgrade,
      rootUpgradeUnavailableReason: getRootUpgradeUnavailableReasonLabel(
        gameState.spiritualRootUpgradePreview.unavailableReason,
      ),
    },
    isLoading: false,
  }
}
