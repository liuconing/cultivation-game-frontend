import { useState } from 'react'
import {
  mockScenarioOptions,
  type MockScenario,
} from '@/data/gameMock'
import { useMockGameStore } from '@/stores'

type FoundationTab = 'controls' | 'fixtures' | 'states'

export interface IHomeViewModel {
  gameState: ReturnType<typeof useMockGameStore.getState>['gameState']
  scenarioOptions: typeof mockScenarioOptions
  selectedTab: FoundationTab
  isModalOpen: boolean
  isDrawerOpen: boolean
  handleScenarioChange: (scenario: MockScenario) => void
  handleTabChange: (tab: FoundationTab) => void
  handleClaimCultivation: () => void
  handleReset: () => void
  handleOpenModal: () => void
  handleCloseModal: () => void
  handleOpenDrawer: () => void
  handleCloseDrawer: () => void
}

/** 管理 UI-01 foundation showcase 的展示狀態。 */
export function useHomeViewModel(): IHomeViewModel {
  const gameState = useMockGameStore((state) => state.gameState)
  const setScenario = useMockGameStore((state) => state.setScenario)
  const claimCultivation = useMockGameStore(
    (state) => state.claimCultivation,
  )
  const reset = useMockGameStore((state) => state.reset)
  const [selectedTab, setSelectedTab] =
    useState<FoundationTab>('controls')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return {
    gameState,
    scenarioOptions: mockScenarioOptions,
    selectedTab,
    isModalOpen,
    isDrawerOpen,
    handleScenarioChange: setScenario,
    handleTabChange: setSelectedTab,
    handleClaimCultivation: claimCultivation,
    handleReset: reset,
    handleOpenModal: () => {
      setIsModalOpen(true)
    },
    handleCloseModal: () => {
      setIsModalOpen(false)
    },
    handleOpenDrawer: () => {
      setIsDrawerOpen(true)
    },
    handleCloseDrawer: () => {
      setIsDrawerOpen(false)
    },
  }
}
