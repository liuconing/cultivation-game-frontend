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
        notice: '已在記憶體中領取 320 點修為。',
        character: {
          ...gameState.character,
          cultivation: Math.min(
            gameState.character.cultivation + 320,
            gameState.character.cultivationTarget,
          ),
        },
      },
    }))
  },
  reset: () => {
    set({ gameState: getMockGameState('default') })
  },
}))
