import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useLocation } from 'react-router'
import { getApiClientError } from '@/lib/axios'
import { useSession } from '@/session'
import type { GameViewState } from './game-view-state'
import { useGameRuntime } from './use-game-runtime'

export type GameRoute =
  | '/game/cultivation'
  | '/game/explore'
  | '/game/loadout'
  | '/game/cave'

export interface GameNavigationItem {
  path: GameRoute
  label: string
  shortLabel: string
  glyph: string
  description: string
}

export interface GlobalIndicator {
  id: string
  label: string
  tone: 'jade' | 'cinnabar' | 'gold'
}

export const gameNavigationItems: GameNavigationItem[] = [
  {
    path: '/game/cultivation',
    label: '修煉',
    shortLabel: '修煉',
    glyph: '煉',
    description: '領取離線修為、突破境界並提升靈根品質。',
  },
  {
    path: '/game/explore',
    label: '探索',
    shortLabel: '探索',
    glyph: '探',
    description: '選擇已解鎖地圖，進行探索並查看戰鬥結果。',
  },
  {
    path: '/game/loadout',
    label: '整備',
    shortLabel: '整備',
    glyph: '裝',
    description: '管理背包、裝備、功法、技能與丹藥。',
  },
  {
    path: '/game/cave',
    label: '洞府',
    shortLabel: '洞府',
    glyph: '府',
    description: '查看自然恢復進度，或使用靈石立即完成休養。',
  },
]

/** 判斷目前路徑是否為遊戲分頁。 */
const isGameRoute = (path: string): path is GameRoute => {
  return gameNavigationItems.some((item) => item.path === path)
}

/** 依正式 GameState 建立頂部全域狀態提示。 */
const getGlobalIndicators = (
  gameState: GameViewState,
): GlobalIndicator[] => {
  const { character } = gameState
  const indicators: GlobalIndicator[] = []

  if (character.cultivation >= character.cultivationTarget) {
    indicators.push({
      id: 'breakthrough',
      label: '可突破',
      tone: 'gold',
    })
  } else if (gameState.cultivationState.claimableCultivation > 0) {
    indicators.push({
      id: 'claim',
      label: '可領取修為',
      tone: 'jade',
    })
  }

  if (character.health / character.maxHealth < 0.3) {
    indicators.push({
      id: 'health',
      label: '生命偏低',
      tone: 'cinnabar',
    })
  }

  if (character.spiritPower / character.maxSpiritPower < 0.2) {
    indicators.push({
      id: 'spirit',
      label: '靈力偏低',
      tone: 'cinnabar',
    })
  }

  return indicators
}

export interface IGameShellViewModel {
  gameState: GameViewState
  activeItem: GameNavigationItem
  navigationItems: GameNavigationItem[]
  indicators: GlobalIndicator[]
  isCharacterDrawerOpen: boolean
  isAccountMenuOpen: boolean
  /** 是否正在向後端撤銷目前 token。 */
  isLoggingOut: boolean
  shellNotice: string | null
  /** 框架層手動同步失敗時的局部錯誤。 */
  shellError: string | null
  /** V1 物品 catalog 是否載入失敗。 */
  hasCatalogError: boolean
  /** 目前登入帳號的 Email。 */
  accountLabel: string
  accountButtonRef: RefObject<HTMLButtonElement | null>
  accountMenuRef: RefObject<HTMLDivElement | null>
  accountFirstItemRef: RefObject<HTMLButtonElement | null>
  handleOpenCharacterDrawer: () => void
  handleCloseCharacterDrawer: () => void
  handleToggleAccountMenu: () => void
  handleCloseAccountMenu: (restoreFocus?: boolean) => void
  handleReloadState: () => void
  /** 重新載入物品 catalog。 */
  handleReloadCatalog: () => void
  handleLogout: () => void
}

/** 提供 Game Shell 導覽、帳號選單與正式遊戲資料。 */
export function useGameShellViewModel(): IGameShellViewModel {
  const location = useLocation()
  const { user, logout, isLoggingOut } = useSession()
  const {
    gameState,
    catalogError,
    reloadCatalog,
    reloadGameState,
  } = useGameRuntime()
  const [isCharacterDrawerOpen, setIsCharacterDrawerOpen] =
    useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [shellNotice, setShellNotice] = useState<string | null>(null)
  const [shellError, setShellError] = useState<string | null>(null)
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

  /** 開啟角色資訊抽屜。 */
  const handleOpenCharacterDrawer = (): void => {
    setIsCharacterDrawerOpen(true)
  }

  /** 關閉角色資訊抽屜。 */
  const handleCloseCharacterDrawer = useCallback((): void => {
    setIsCharacterDrawerOpen(false)
  }, [])

  /** 切換帳號操作選單。 */
  const handleToggleAccountMenu = (): void => {
    if (isAccountMenuOpen) {
      handleCloseAccountMenu()
      return
    }
    setIsAccountMenuOpen(true)
  }

  /** 重新向後端同步角色與 GameState。 */
  const handleReloadState = (): void => {
    setShellNotice('正在重新同步遊戲狀態…')
    setShellError(null)
    handleCloseAccountMenu()
    void Promise.all([reloadGameState(), reloadCatalog()])
      .then(() => {
        setShellNotice('遊戲狀態已同步。')
      })
      .catch((error: unknown) => {
        setShellNotice(null)
        setShellError(getApiClientError(error).message)
      })
  }

  /** 從 catalog 區塊重新載入 V1 靜態資料。 */
  const handleReloadCatalog = (): void => {
    setShellError(null)
    void reloadCatalog().catch((error: unknown) => {
      setShellError(getApiClientError(error).message)
    })
  }

  /** 撤銷目前 token，成功後由路由守衛返回登入頁。 */
  const handleLogout = (): void => {
    if (isLoggingOut) {
      return
    }

    setShellError(null)
    setShellNotice('正在安全登出…')
    void logout().catch((error: unknown) => {
      setShellNotice(null)
      setShellError(
        `${getApiClientError(error).message} 登出尚未完成，請重試。`,
      )
    })
  }

  return {
    gameState,
    activeItem,
    navigationItems: gameNavigationItems,
    indicators: getGlobalIndicators(gameState),
    isCharacterDrawerOpen,
    isAccountMenuOpen,
    isLoggingOut,
    shellNotice,
    shellError,
    hasCatalogError: Boolean(catalogError),
    accountLabel: user?.email ?? '未登入帳號',
    accountButtonRef,
    accountMenuRef,
    accountFirstItemRef,
    handleOpenCharacterDrawer,
    handleCloseCharacterDrawer,
    handleToggleAccountMenu,
    handleCloseAccountMenu,
    handleReloadState,
    handleReloadCatalog,
    handleLogout,
  }
}
