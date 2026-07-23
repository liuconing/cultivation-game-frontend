import { create } from '@/lib/zustand'
import {
  getMockGameState,
  type MockGameState,
  type MockScenario,
} from '@/data/gameMock'

type MockGameStore = {
  gameState: MockGameState
  setScenario: (scenario: MockScenario) => void
  claimCultivation: () => void
  resolveBreakthrough: (outcome: 'success' | 'failure') => void
  upgradeSpiritualRoot: () => void
  resolveExploration: () => void
  equipEquipment: (equipmentId: string) => void
  sellEquipment: (equipmentId: string) => void
  equipCultivationMethod: (templateId: string) => void
  equipSkill: (templateId: string) => void
  buyPill: (templateId: string) => void
  usePill: (templateId: string) => void
  completeCaveRecovery: () => void
  reset: () => void
}

/**
 * 管理 UI 展示使用的純記憶體遊戲狀態。
 */
export const useMockGameStore = create<MockGameStore>((set) => ({
  gameState: getMockGameState('default'),
  setScenario: (scenario) => {
    set({ gameState: getMockGameState(scenario) })
  },
  claimCultivation: () => {
    set(({ gameState }) => ({
      gameState: {
        ...gameState,
        scenario: 'success',
        notice: `已領取 ${gameState.cultivationState.claimableCultivation.toLocaleString()} 點修為。`,
        character: {
          ...gameState.character,
          cultivation: Math.min(
            gameState.character.cultivation +
              gameState.cultivationState.claimableCultivation,
            gameState.character.cultivationTarget,
          ),
        },
        cultivationState: {
          ...gameState.cultivationState,
          claimableCultivation: 0,
          idleMinutes: 0,
        },
      },
    }))
  },
  resolveBreakthrough: (outcome) => {
    set(({ gameState }) => {
      const cultivationState = gameState.cultivationState
      const spiritStones = Math.max(
        0,
        gameState.character.spiritStones -
          cultivationState.spiritStoneCost,
      )

      if (outcome === 'success') {
        return {
          gameState: {
            ...gameState,
            scenario: 'success',
            notice: '突破成功，境界提升至築基初期。',
            character: {
              ...gameState.character,
              realm: '築基',
              minorRealm: '初期',
              cultivation: 0,
              cultivationTarget: 18000,
              spiritStones,
            },
            cultivationState: {
              ...cultivationState,
              pity: 0,
              pityBonus: 0,
              finalRate: Math.max(
                1,
                cultivationState.finalRate -
                  cultivationState.pityBonus,
              ),
            },
          },
        }
      }

      return {
        gameState: {
          ...gameState,
          scenario: 'failure',
          notice: '突破失敗，保底增加 5%。',
          character: {
            ...gameState.character,
            spiritStones,
          },
          cultivationState: {
            ...cultivationState,
            pity: cultivationState.pity + 1,
            pityBonus: Math.min(30, cultivationState.pityBonus + 5),
            finalRate: Math.min(95, cultivationState.finalRate + 5),
          },
        },
      }
    })
  },
  upgradeSpiritualRoot: () => {
    set(({ gameState }) => {
      const nextQuality = gameState.cultivationState.nextRootQuality
      if (
        !nextQuality ||
        gameState.cultivationState.rootEssence <
          gameState.cultivationState.rootUpgradeCost
      ) {
        return { gameState }
      }

      return {
        gameState: {
          ...gameState,
          scenario: 'success',
          notice: `靈根品質已提升至${nextQuality}。`,
          character: {
            ...gameState.character,
            spiritualRootQuality: nextQuality,
          },
          cultivationState: {
            ...gameState.cultivationState,
            rootEssence:
              gameState.cultivationState.rootEssence -
              gameState.cultivationState.rootUpgradeCost,
            nextRootQuality: null,
          },
        },
      }
    })
  },
  resolveExploration: () => {
    set(({ gameState }) => {
      const { character, scenario } = gameState

      if (scenario === 'encounter') {
        return {
          gameState: {
            ...gameState,
            notice: '奇遇完成，獲得丹師贈禮與 500 靈石。',
            character: {
              ...character,
              spiritStones: character.spiritStones + 500,
            },
          },
        }
      }

      if (scenario === 'failure') {
        return {
          gameState: {
            ...gameState,
            notice: '探索戰敗，生命降至 0。',
            character: {
              ...character,
              health: 0,
              spiritPower: Math.max(0, character.spiritPower - 240),
            },
          },
        }
      }

      if (scenario === 'turnLimit') {
        return {
          gameState: {
            ...gameState,
            notice: '30 回合結束，未獲得探索獎勵。',
            character: {
              ...character,
              health: Math.min(character.health, 2480),
              spiritPower: 0,
            },
          },
        }
      }

      const isBoss = scenario === 'bossFirstKill'
      return {
        gameState: {
          ...gameState,
          notice: isBoss
            ? 'Boss 首殺獎勵已結算至記憶體狀態。'
            : '探索勝利，獎勵已結算至記憶體狀態。',
          character: {
            ...character,
            health: Math.max(1, character.health - (isBoss ? 1200 : 380)),
            spiritPower: Math.max(
              0,
              character.spiritPower - (isBoss ? 300 : 120),
            ),
            spiritStones:
              character.spiritStones + (isBoss ? 6800 : 1200),
          },
        },
      }
    })
  },
  equipEquipment: (equipmentId) => {
    set(({ gameState }) => {
      const target = gameState.equipment.find(
        (equipment) => equipment.id === equipmentId,
      )
      if (!target) {
        return { gameState }
      }

      return {
        gameState: {
          ...gameState,
          notice: `已穿戴 ${target.name}。`,
          equipment: gameState.equipment.map((equipment) => ({
            ...equipment,
            equipped:
              equipment.id === equipmentId
                ? true
                : equipment.slot === target.slot
                  ? false
                  : equipment.equipped,
          })),
        },
      }
    })
  },
  sellEquipment: (equipmentId) => {
    set(({ gameState }) => {
      const target = gameState.equipment.find(
        (equipment) => equipment.id === equipmentId,
      )
      if (!target || target.equipped) {
        return { gameState }
      }

      const priceByQuality = {
        凡品: 120,
        良品: 360,
        上品: 980,
        極品: 2400,
      } as const
      const price = priceByQuality[target.quality]

      return {
        gameState: {
          ...gameState,
          notice: `已出售 ${target.name}，獲得 ${price.toLocaleString()} 靈石。`,
          character: {
            ...gameState.character,
            spiritStones: gameState.character.spiritStones + price,
          },
          equipment: gameState.equipment.filter(
            (equipment) => equipment.id !== equipmentId,
          ),
        },
      }
    })
  },
  equipCultivationMethod: (templateId) => {
    set(({ gameState }) => {
      const method = gameState.cultivationMethods.find(
        (item) => item.templateId === templateId,
      )
      if (!method || method.minimumRealm === '金丹') {
        return { gameState }
      }

      return {
        gameState: {
          ...gameState,
          notice: `已裝備功法 ${method.name}。`,
          cultivationMethods: gameState.cultivationMethods.map((item) => ({
            ...item,
            equipped: item.templateId === templateId,
          })),
          cultivationState: {
            ...gameState.cultivationState,
            equippedMethodName: method.name,
            methodMultiplier: method.cultivationMultiplier,
          },
        },
      }
    })
  },
  equipSkill: (templateId) => {
    set(({ gameState }) => {
      const skill = gameState.skills.find(
        (item) => item.templateId === templateId,
      )
      if (!skill) {
        return { gameState }
      }

      return {
        gameState: {
          ...gameState,
          notice: `已配置${skill.kind === 'active' ? '主動' : '被動'}技能 ${skill.name}。`,
          skills: gameState.skills.map((item) => ({
            ...item,
            equipped:
              item.templateId === templateId
                ? true
                : item.kind === skill.kind
                  ? false
                  : item.equipped,
          })),
        },
      }
    })
  },
  buyPill: (templateId) => {
    set(({ gameState }) => {
      const pill = gameState.pills.find(
        (item) => item.templateId === templateId,
      )
      if (!pill || gameState.character.spiritStones < pill.price) {
        return {
          gameState: {
            ...gameState,
            notice: '靈石不足，無法購買此丹藥。',
          },
        }
      }

      return {
        gameState: {
          ...gameState,
          notice: `已購買 ${pill.name}。`,
          character: {
            ...gameState.character,
            spiritStones:
              gameState.character.spiritStones - pill.price,
          },
          pills: gameState.pills.map((item) =>
            item.templateId === templateId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        },
      }
    })
  },
  usePill: (templateId) => {
    set(({ gameState }) => {
      const pill = gameState.pills.find(
        (item) => item.templateId === templateId,
      )
      if (
        !pill ||
        pill.quantity <= 0 ||
        templateId === 'pill_breakthrough_01'
      ) {
        return { gameState }
      }

      const character = { ...gameState.character }
      if (templateId === 'pill_heal_01') {
        character.health = Math.min(
          character.maxHealth,
          character.health + Math.ceil(character.maxHealth * 0.25),
        )
      } else if (templateId === 'pill_spirit_01') {
        character.spiritPower = Math.min(
          character.maxSpiritPower,
          character.spiritPower +
            Math.ceil(character.maxSpiritPower * 0.3),
        )
      } else if (templateId === 'pill_cultivation_01') {
        character.cultivation = Math.min(
          character.cultivationTarget,
          character.cultivation + 500,
        )
      }

      return {
        gameState: {
          ...gameState,
          notice: `已使用 ${pill.name}。`,
          character,
          pills: gameState.pills.map((item) =>
            item.templateId === templateId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        },
      }
    })
  },
  completeCaveRecovery: () => {
    set(({ gameState }) => {
      const { character, cave } = gameState
      const isFull =
        character.health >= character.maxHealth &&
        character.spiritPower >= character.maxSpiritPower
      if (isFull || character.spiritStones < cave.finishNowCost) {
        return { gameState }
      }

      return {
        gameState: {
          ...gameState,
          scenario: 'recovered',
          notice: `已消耗 ${cave.finishNowCost.toLocaleString()} 靈石完成休養。`,
          character: {
            ...character,
            health: character.maxHealth,
            spiritPower: character.maxSpiritPower,
            spiritStones:
              character.spiritStones - cave.finishNowCost,
          },
          cave: {
            ...cave,
            minutesToFull: 0,
          },
        },
      }
    })
  },
  reset: () => {
    set({ gameState: getMockGameState('default') })
  },
}))
