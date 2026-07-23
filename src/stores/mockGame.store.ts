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
  reset: () => {
    set({ gameState: getMockGameState('default') })
  },
}))
