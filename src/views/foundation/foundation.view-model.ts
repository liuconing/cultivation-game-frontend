import { useState } from 'react'
import {
  mockScenarioOptions,
  type MockScenario,
} from '@/data/gameMock'
import { useMockGameStore } from '@/stores'

/** Foundation Showcase 可切換的展示分類。 */
type FoundationTab = 'controls' | 'fixtures' | 'states'

/** Foundation Showcase 畫面所需的狀態與操作。 */
export interface IFoundationViewModel {
  /** 目前記憶體中的 Mock GameState。 */
  gameState: ReturnType<typeof useMockGameStore.getState>['gameState']
  /** 可供展示板切換的 Mock 情境。 */
  scenarioOptions: typeof mockScenarioOptions
  /** 目前選取的展示分類。 */
  selectedTab: FoundationTab
  /** 共用 Modal 是否開啟。 */
  isModalOpen: boolean
  /** 共用 Drawer 是否開啟。 */
  isDrawerOpen: boolean
  /** 切換 Mock fixture 情境。 */
  handleScenarioChange: (scenario: MockScenario) => void
  /** 切換 Foundation 展示分類。 */
  handleTabChange: (tab: FoundationTab) => void
  /** 在記憶體 fixture 中模擬領取修為。 */
  handleClaimCultivation: () => void
  /** 將記憶體 fixture 還原為預設狀態。 */
  handleReset: () => void
  /** 開啟共用 Modal 範例。 */
  handleOpenModal: () => void
  /** 關閉共用 Modal 範例。 */
  handleCloseModal: () => void
  /** 開啟共用 Drawer 範例。 */
  handleOpenDrawer: () => void
  /** 關閉共用 Drawer 範例。 */
  handleCloseDrawer: () => void
}

/** 管理 UI-01 foundation showcase 的展示狀態。 */
export function useFoundationViewModel(): IFoundationViewModel {
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
