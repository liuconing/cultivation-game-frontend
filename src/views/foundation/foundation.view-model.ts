import { useState } from 'react'
import { mockScenarioOptions } from '@/data/gameMock'
import { useMockGameStore } from '@/stores'

/** Foundation Showcase 可切換的展示分類。 */
export type FoundationTab = 'controls' | 'fixtures' | 'states'

/** 管理 UI-01 foundation showcase 的展示狀態。 */
export function useFoundationViewModel() {
  const gameState = useMockGameStore((state) => state.gameState)
  const setScenario = useMockGameStore((state) => state.setScenario)
  const claimCultivation = useMockGameStore((state) => state.claimCultivation)
  const reset = useMockGameStore((state) => state.reset)
  const [selectedTab, setSelectedTab] = useState<FoundationTab>('controls')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return {
    /** 目前記憶體中的 Mock GameState。 */
    gameState,
    /** 可供展示板切換的 Mock 情境。 */
    scenarioOptions: mockScenarioOptions,
    /** 目前選取的展示分類。 */
    selectedTab,
    /** 共用 Modal 是否開啟。 */
    isModalOpen,
    /** 共用 Drawer 是否開啟。 */
    isDrawerOpen,
    /** 切換 Mock fixture 情境。 */
    handleScenarioChange: setScenario,
    /** 切換 Foundation 展示分類。 */
    handleTabChange: setSelectedTab,
    /** 在記憶體 fixture 中模擬領取修為。 */
    handleClaimCultivation: claimCultivation,
    /** 將記憶體 fixture 還原為預設狀態。 */
    handleReset: reset,
    /** 開啟共用 Modal 範例。 */
    handleOpenModal: () => {
      setIsModalOpen(true)
    },
    /** 關閉共用 Modal 範例。 */
    handleCloseModal: () => {
      setIsModalOpen(false)
    },
    /** 開啟共用 Drawer 範例。 */
    handleOpenDrawer: () => {
      setIsDrawerOpen(true)
    },
    /** 關閉共用 Drawer 範例。 */
    handleCloseDrawer: () => {
      setIsDrawerOpen(false)
    },
  }
}

export type IFoundationViewModel = ReturnType<typeof useFoundationViewModel>
