import type {
  GameStateData,
  ItemCatalogResponse,
} from '@/domain/repository'
import type {
  MockCultivationMethod,
  MockEquipment,
  MockGameState,
  MockInventoryItem,
  MockPill,
  MockSkill,
} from '@/data/gameMock'

/** 正式遊戲畫面使用的資料模型，不包含 Mock 情境切換欄位。 */
export type GameViewState = Omit<MockGameState, 'scenario'>

const genderLabels: Record<string, MockGameState['character']['gender']> = {
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

const itemTypeByCategory: Record<
  ItemCatalogResponse['category'],
  MockInventoryItem['type']
> = {
  accessories: 'equipment',
  chest_armor: 'equipment',
  cultivation_methods: 'method',
  headgear: 'equipment',
  pants: 'equipment',
  pills: 'pill',
  shoes: 'equipment',
  weapons: 'equipment',
}

const qualityLabels: Record<
  ItemCatalogResponse['quality'],
  MockInventoryItem['quality']
> = {
  fan: '凡品',
  huang: '良品',
  xuan: '上品',
  di: '極品',
  tian: '極品',
  xian: '極品',
}

const equipmentSlotLabels: Record<
  NonNullable<ItemCatalogResponse['slot']>,
  MockEquipment['slot']
> = {
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
const createCatalogIndex = (
  items: ItemCatalogResponse[],
): Map<string, ItemCatalogResponse> => {
  return new Map(items.map((item) => [item.id, item]))
}

/** 將正式 GameState 與 V1 catalog 轉成遊戲頁共用的畫面模型。 */
export const createGameViewState = (
  gameState: GameStateData,
  items: ItemCatalogResponse[],
): GameViewState => {
  const catalog = createCatalogIndex(items)
  const equippedInstanceIds = new Set(
    Object.values(gameState.equipment).filter(
      (instanceId): instanceId is string => instanceId !== null,
    ),
  )
  const inventory: MockInventoryItem[] = gameState.inventory.map(
    (entry) => {
      const item = catalog.get(entry.templateId)
      return {
        id: entry.templateId,
        templateId: entry.templateId,
        name: item?.name ?? entry.templateId,
        type: item ? itemTypeByCategory[item.category] : 'material',
        quality: item ? qualityLabels[item.quality] : '凡品',
        quantity: entry.quantity,
      }
    },
  )
  const equipment: MockEquipment[] = gameState.equipmentInstances.map(
    (instance) => {
      const item = catalog.get(instance.templateId)
      return {
        id: instance.instanceId,
        name: item?.name ?? instance.templateId,
        slot:
          item?.slot && item.slot !== 'method'
            ? equipmentSlotLabels[item.slot]
            : '飾品',
        quality: item ? qualityLabels[item.quality] : '凡品',
        attributes: [
          ...(item ? getEffectLabels(item) : []),
          ...instance.rolledAffixes.map((effect) => effect.display),
        ],
        equipped: equippedInstanceIds.has(instance.instanceId),
      }
    },
  )
  const cultivationMethods: MockCultivationMethod[] =
    gameState.inventory.flatMap((entry) => {
      const item = catalog.get(entry.templateId)
      if (!item || item.category !== 'cultivation_methods') {
        return []
      }
      const rateEffect = item.effects.find(
        (effect) => effect.stat === 'cultivationRate',
      )
      return [
        {
          templateId: item.id,
          name: item.name,
          quality: qualityLabels[item.quality],
          minimumRealm:
            realmLabels[item.usableRealm] ?? item.usableRealmName,
          cultivationMultiplier: rateEffect
            ? 1 + rateEffect.value / 100
            : 1,
          equipped:
            gameState.equippedCultivationMethodId === item.id,
        },
      ]
    })
  const skills: MockSkill[] = gameState.skills
    .filter((skill) => skill.learned)
    .map((skill) => ({
      templateId: skill.id,
      name: skill.name,
      kind: skill.type,
      spiritCost: skill.mpCost ?? 0,
      description: skill.description,
      equipped: skill.equipped,
    }))
  const pills: MockPill[] = gameState.inventory.flatMap((entry) => {
    const item = catalog.get(entry.templateId)
    if (!item || item.category !== 'pills') {
      return []
    }
    return [
      {
        templateId: item.id,
        name: item.name,
        effect: getEffectLabels(item).join('、'),
        price: 0,
        quantity: entry.quantity,
      },
    ]
  })

  return {
    notice: null,
    character: {
      id: gameState.character.id,
      name: gameState.character.name,
      gender:
        genderLabels[gameState.character.gender] ??
        genderLabels.unknown,
      realm:
        realmLabels[gameState.character.realm] ??
        gameState.character.realm,
      minorRealm:
        minorRealmLabels[gameState.character.minorRealm] ??
        gameState.character.minorRealm,
      spiritualRoot:
        spiritualRootLabels[gameState.character.spiritualRootType] ??
        gameState.character.spiritualRootType,
      spiritualRootQuality:
        rootQualityLabels[
          gameState.character.spiritualRootQuality
        ] ?? gameState.character.spiritualRootQuality,
      cultivation: gameState.character.cultivation,
      cultivationTarget:
        gameState.cultivationPreview.cultivationCap,
      health: gameState.restPreview.currentHp,
      maxHealth: gameState.derivedStats.maxHp,
      spiritPower: gameState.restPreview.currentMp,
      maxSpiritPower: gameState.derivedStats.maxMp,
      spiritStones: gameState.character.spiritStones,
    },
    maps: gameState.maps.map((map) => ({
      id: map.id,
      name: map.name,
      recommendedRealm:
        realmLabels[map.recommendedRealm] ?? map.recommendedRealm,
      status: map.unlocked
        ? map.realmDifference < 0
          ? 'challenging'
          : 'unlocked'
        : 'locked',
      monsters: [],
      possibleDrops: [],
    })),
    battle: null,
    inventory,
    equipment,
    cultivationMethods,
    skills,
    pills,
    cave: {
      recoveryPercentPerMinute: 5,
      minutesToFull: Math.ceil(
        gameState.restPreview.secondsToFull / 60,
      ),
      finishNowCost: gameState.restPreview.instantCompleteCost,
    },
    cultivationState: {
      idleMinutes: Math.floor(
        gameState.cultivationPreview.claimableSeconds / 60,
      ),
      idleCapMinutes: Math.floor(
        gameState.cultivationPreview.idleCapSeconds / 60,
      ),
      claimableCultivation:
        gameState.cultivationPreview.claimableCultivation,
      baseCultivationPerHour:
        gameState.cultivationPreview.cultivationPerHour,
      equippedMethodName:
        cultivationMethods.find((method) => method.equipped)?.name ??
        null,
      methodMultiplier:
        cultivationMethods.find((method) => method.equipped)
          ?.cultivationMultiplier ?? 1,
      breakthroughBaseRate: 0,
      rootBonus: 0,
      luckBonus: 0,
      pillBonus: 0,
      methodBonus: 0,
      pityBonus: 0,
      finalRate: 0,
      spiritStoneCost: 0,
      pity: gameState.character.breakthroughPity,
      rootEssence: gameState.character.spiritualRootEssence,
      rootUpgradeCost:
        gameState.spiritualRootUpgradePreview.requiredEssence,
      nextRootQuality:
        gameState.spiritualRootUpgradePreview.nextQuality === null
          ? null
          : (rootQualityLabels[
              gameState.spiritualRootUpgradePreview.nextQuality
            ] ??
            gameState.spiritualRootUpgradePreview.nextQuality),
      breakthroughOutcome: 'success',
    },
    isLoading: false,
  }
}
