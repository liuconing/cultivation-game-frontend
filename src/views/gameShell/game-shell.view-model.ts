import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useLocation } from 'react-router'
import {
  mockScenarioOptions,
  type MockGameState,
  type MockScenario,
} from '@/data/gameMock'
import { useSession } from '@/session'
import { useMockGameStore } from '@/stores'

export type GameRoute =
  | '/game/cultivation'
  | '/game/explore'
  | '/game/loadout'
  | '/game/cave'

export type GameNavigationItem = {
  path: GameRoute
  label: string
  shortLabel: string
  glyph: string
  description: string
  nextTask: string
}

export type GlobalIndicator = {
  id: string
  label: string
  tone: 'jade' | 'cinnabar' | 'gold'
}

export const gameNavigationItems: GameNavigationItem[] = [
  {
    path: '/game/cultivation',
    label: '修煉',
    shortLabel: '修煉',
    glyph: '修',
    description: '放置修為、境界進度、突破與靈根成長。',
    nextTask: 'UI-05',
  },
  {
    path: '/game/explore',
    label: '探索',
    shortLabel: '探索',
    glyph: '遊',
    description: '選擇地圖並查看探索、事件與戰鬥結果。',
    nextTask: 'UI-06',
  },
  {
    path: '/game/loadout',
    label: '整備',
    shortLabel: '整備',
    glyph: '備',
    description: '管理背包、裝備、功法、技能與丹藥。',
    nextTask: 'UI-07',
  },
  {
    path: '/game/cave',
    label: '洞府',
    shortLabel: '洞府',
    glyph: '府',
    description: '查看生命與靈力休養進度。',
    nextTask: 'UI-08',
  },
]

const isGameRoute = (path: string): path is GameRoute => {
  return gameNavigationItems.some((item) => item.path === path)
}

const getGlobalIndicators = (
  gameState: MockGameState,
): GlobalIndicator[] => {
  const { character, scenario } = gameState
  const indicators: GlobalIndicator[] = []

  if (character.cultivation >= character.cultivationTarget) {
    indicators.push({
      id: 'breakthrough',
      label: '可突破',
      tone: 'gold',
    })
  } else {
    indicators.push({
      id: 'claim',
      label: '可領取修為',
      tone: 'jade',
    })
  }

  if (character.health / character.maxHealth < 0.3) {
    indicators.push({
      id: 'health',
      label: '生命不足',
      tone: 'cinnabar',
    })
  }

  if (character.spiritPower / character.maxSpiritPower < 0.2) {
    indicators.push({
      id: 'spirit',
      label: '靈力不足',
      tone: 'cinnabar',
    })
  }

  if (scenario === 'disconnected') {
    indicators.push({
      id: 'disconnected',
      label: '連線中斷',
      tone: 'cinnabar',
    })
  }

  if (scenario === 'sessionExpired') {
    indicators.push({
      id: 'session',
      label: 'Session 已失效',
      tone: 'cinnabar',
    })
  }

  return indicators
}

export type IGameShellViewModel = {
  gameState: MockGameState
  activeItem: GameNavigationItem
  navigationItems: GameNavigationItem[]
  scenarioOptions: typeof mockScenarioOptions
  indicators: GlobalIndicator[]
  isCharacterDrawerOpen: boolean
  isAccountMenuOpen: boolean
  shellNotice: string | null
  /** 帳號選單顯示的登入 Email。 */
  accountLabel: string
  accountButtonRef: RefObject<HTMLButtonElement | null>
  accountMenuRef: RefObject<HTMLDivElement | null>
  accountFirstItemRef: RefObject<HTMLButtonElement | null>
  handleScenarioChange: (scenario: MockScenario) => void
  handleOpenCharacterDrawer: () => void
  handleCloseCharacterDrawer: () => void
  handleToggleAccountMenu: () => void
  handleCloseAccountMenu: (restoreFocus?: boolean) => void
  handleReloadState: () => void
  handleLogout: () => void
  handleReturnToLogin: () => void
}

export function useGameShellViewModel(): IGameShellViewModel {
  const location = useLocation()
  const { user, reloadSession, logout } = useSession()
  const gameState = useMockGameStore((state) => state.gameState)
  const setScenario = useMockGameStore((state) => state.setScenario)
  const reset = useMockGameStore((state) => state.reset)
  const [isCharacterDrawerOpen, setIsCharacterDrawerOpen] =
    useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [shellNotice, setShellNotice] = useState<string | null>(null)
  const accountButtonRef = useRef<HTMLButtonElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const accountFirstItemRef = useRef<HTMLButtonElement>(null)

  const activePath = isGameRoute(location.pathname)
    ? location.pathname
    : '/game/cultivation'
  const activeItem =
    gameNavigationItems.find((item) => item.path === activePath) ??
    gameNavigationItems[0]

  const handleCloseAccountMenu = useCallback(
    (restoreFocus = true) => {
      setIsAccountMenuOpen(false)
      if (restoreFocus) {
        requestAnimationFrame(() => accountButtonRef.current?.focus())
      }
    },
    [],
  )

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return
    }

    requestAnimationFrame(() => accountFirstItemRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseAccountMenu()
      }
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (
        target instanceof Node &&
        !accountMenuRef.current?.contains(target) &&
        !accountButtonRef.current?.contains(target)
      ) {
        handleCloseAccountMenu(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [handleCloseAccountMenu, isAccountMenuOpen])

  const handleScenarioChange = (scenario: MockScenario) => {
    setScenario(scenario)
    setShellNotice(null)
    setIsAccountMenuOpen(false)
    setIsCharacterDrawerOpen(false)
  }

  const handleOpenCharacterDrawer = () => {
    setIsCharacterDrawerOpen(true)
  }

  const handleCloseCharacterDrawer = useCallback(() => {
    setIsCharacterDrawerOpen(false)
  }, [])

  const handleToggleAccountMenu = () => {
    if (isAccountMenuOpen) {
      handleCloseAccountMenu()
      return
    }

    setIsAccountMenuOpen(true)
  }

  /** 重新向後端檢查角色與 GameState 啟動資料。 */
  const handleReloadState = (): void => {
    setShellNotice('正在重新載入帳號與遊戲狀態……')
    handleCloseAccountMenu()
    void reloadSession().then(() => {
      setShellNotice('帳號與遊戲狀態已重新載入。')
    })
  }

  /** 清除正式登入狀態及目前畫面的 Mock 狀態。 */
  const handleLogout = (): void => {
    reset()
    setIsAccountMenuOpen(false)
    logout()
  }

  /** 從失效提示清除 session 並返回登入流程。 */
  const handleReturnToLogin = (): void => {
    reset()
    logout()
  }

  return {
    gameState,
    activeItem,
    navigationItems: gameNavigationItems,
    scenarioOptions: mockScenarioOptions,
    indicators: getGlobalIndicators(gameState),
    isCharacterDrawerOpen,
    isAccountMenuOpen,
    shellNotice,
    accountLabel: user?.email ?? '已登入帳號',
    accountButtonRef,
    accountMenuRef,
    accountFirstItemRef,
    handleScenarioChange,
    handleOpenCharacterDrawer,
    handleCloseCharacterDrawer,
    handleToggleAccountMenu,
    handleCloseAccountMenu,
    handleReloadState,
    handleLogout,
    handleReturnToLogin,
  }
}
