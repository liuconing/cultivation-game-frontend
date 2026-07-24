import {
  Button,
  Drawer,
  Panel,
  ProgressBar,
  StatusBadge,
} from '@/components'
import { bind } from '@/utils'
import {
  useGameShellViewModel,
  type IGameShellViewModel,
} from './game-shell.view-model'
import {
  DesktopNavigation,
  MobileNavigation,
} from './game-shell.navigation'
import { CavePage } from './cave/CavePage'
import { CultivationPage } from './cultivation/CultivationPage'
import { ExplorePage } from './explore/ExplorePage'
import { LoadoutPage } from './loadout/LoadoutPage'

const compactNumberFormatter = new Intl.NumberFormat('zh-TW', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatCompactNumber = (value: number) => {
  return compactNumberFormatter.format(value)
}

/** 四個遊戲分頁共用的角色列、導覽與覆蓋層。 */
export function gameShellViewController({
  gameState,
  activeItem,
  navigationItems,
  indicators,
  isCharacterDrawerOpen,
  isAccountMenuOpen,
  isLoggingOut,
  shellNotice,
  shellError,
  hasCatalogError,
  accountLabel,
  accountButtonRef,
  accountMenuRef,
  accountFirstItemRef,
  handleOpenCharacterDrawer,
  handleCloseCharacterDrawer,
  handleToggleAccountMenu,
  handleReloadState,
  handleReloadCatalog,
  handleLogout,
}: IGameShellViewModel) {
  const { character } = gameState

  return (
    <div className="ink-wash min-h-dvh bg-ink-950 text-neutral-200">
      <DesktopNavigation navigationItems={navigationItems} />

      <div className="min-h-dvh md:pl-56">
        <header className="sticky top-0 z-30 border-b border-white/12 bg-ink-950/94 px-3 py-3 backdrop-blur-xl sm:px-5">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <button
                aria-label={`開啟 ${character.name} 的角色詳情`}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-md border border-transparent p-1.5 text-left transition hover:border-white/10 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-jade-300"
                onClick={handleOpenCharacterDrawer}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-300/30 bg-gold-300/10 font-serif text-gold-100"
                >
                  {character.name.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-serif text-base text-neutral-100 sm:text-lg">
                    {character.name}
                  </span>
                  <span className="block truncate text-[0.7rem] text-neutral-500">
                    {character.realm}・{character.minorRealm} ·{' '}
                    {character.spiritualRoot}・
                    {character.spiritualRootQuality}
                  </span>
                </span>
              </button>

              <div className="relative shrink-0">
                <button
                  aria-controls="game-account-menu"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                  aria-label="開啟帳號選單"
                  className="grid size-11 place-items-center rounded-md border border-white/12 bg-white/[0.035] text-lg text-neutral-300 transition hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-jade-300"
                  onClick={handleToggleAccountMenu}
                  ref={accountButtonRef}
                  type="button"
                >
                  <span aria-hidden="true">⋯</span>
                </button>

                {isAccountMenuOpen ? (
                  <div
                    aria-label="帳號操作"
                    className="absolute right-0 top-12 z-50 w-52 rounded-md border border-white/14 bg-ink-900 p-2 shadow-2xl shadow-black/60"
                    id="game-account-menu"
                    onKeyDown={(event) => {
                      if (
                        event.key !== 'ArrowDown' &&
                        event.key !== 'ArrowUp' &&
                        event.key !== 'Home' &&
                        event.key !== 'End'
                      ) {
                        return
                      }

                      event.preventDefault()
                      const items = Array.from(
                        event.currentTarget.querySelectorAll<HTMLButtonElement>(
                          '[role="menuitem"]',
                        ),
                      )
                      const currentIndex = items.indexOf(
                        document.activeElement as HTMLButtonElement,
                      )
                      const nextIndex =
                        event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? items.length - 1
                            : event.key === 'ArrowDown'
                              ? (currentIndex + 1) % items.length
                              : (currentIndex - 1 + items.length) %
                                items.length
                      items[nextIndex]?.focus()
                    }}
                    ref={accountMenuRef}
                    role="menu"
                  >
                    <p className="px-3 py-2 text-xs text-neutral-600">
                      {accountLabel}
                    </p>
                    <button
                      className="min-h-10 w-full rounded px-3 text-left text-sm text-neutral-300 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-jade-300"
                      onClick={handleReloadState}
                      ref={accountFirstItemRef}
                      role="menuitem"
                      type="button"
                    >
                      重新載入狀態
                    </button>
                    <button
                      aria-busy={isLoggingOut}
                      className="min-h-10 w-full rounded px-3 text-left text-sm text-cinnabar-100 hover:bg-cinnabar-400/10 focus-visible:outline-2 focus-visible:outline-jade-300 disabled:cursor-wait disabled:opacity-55"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      role="menuitem"
                      type="button"
                    >
                      {isLoggingOut ? '登出中…' : '登出'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:grid-cols-[1.35fr_0.75fr_0.75fr_0.75fr] sm:gap-2">
              <div className="col-span-3 min-w-0 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 sm:col-span-1">
                <div className="flex items-center justify-between gap-2 text-[0.65rem]">
                  <span className="truncate text-neutral-500">修為</span>
                  <span className="shrink-0 tabular-nums text-gold-100">
                    {formatCompactNumber(character.cultivation)}／
                    {formatCompactNumber(character.cultivationTarget)}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-200"
                    style={{
                      width: `${Math.min(
                        100,
                        (character.cultivation /
                          character.cultivationTarget) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="min-w-0 rounded-md border border-cinnabar-400/18 bg-cinnabar-400/[0.06] px-2.5 py-1.5 text-[0.65rem]">
                <span className="block truncate text-neutral-500">生命</span>
                <span className="block truncate tabular-nums text-cinnabar-100">
                  {formatCompactNumber(character.health)}／
                  {formatCompactNumber(character.maxHealth)}
                </span>
              </div>

              <div className="min-w-0 rounded-md border border-jade-400/18 bg-jade-400/[0.06] px-2.5 py-1.5 text-[0.65rem]">
                <span className="block truncate text-neutral-500">靈力</span>
                <span className="block truncate tabular-nums text-jade-100">
                  {formatCompactNumber(character.spiritPower)}／
                  {formatCompactNumber(character.maxSpiritPower)}
                </span>
              </div>

              <div className="min-w-0 rounded-md border border-gold-400/18 bg-gold-400/[0.06] px-2.5 py-1.5 text-[0.65rem]">
                <span className="block truncate text-neutral-500">靈石</span>
                <span className="block truncate tabular-nums text-gold-100">
                  {formatCompactNumber(character.spiritStones)}
                </span>
              </div>
            </div>

            <div
              aria-label="全域遊戲提示"
              className="flex min-h-7 min-w-0 items-center gap-1.5 overflow-x-auto"
            >
              {indicators.map((indicator) => (
                <StatusBadge key={indicator.id} tone={indicator.tone}>
                  {indicator.label}
                </StatusBadge>
              ))}
            </div>
          </div>
        </header>

        <main
          aria-busy={gameState.isLoading}
          className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-5 md:pb-8 md:pt-6"
          id="game-content"
        >
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-ink-900/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.68rem] tracking-[0.18em] text-gold-200/65">
                GAME
              </p>
              <p className="truncate font-serif text-lg text-neutral-100">
                {activeItem.label}
              </p>
            </div>
            <StatusBadge tone="jade">後端資料已同步</StatusBadge>
          </div>

          {shellNotice ? (
            <p
              aria-live="polite"
              className="mb-4 rounded-md border border-jade-400/25 bg-jade-400/[0.08] px-4 py-3 text-sm text-jade-100"
              role="status"
            >
              {shellNotice}
            </p>
          ) : null}
          {shellError ? (
            <p
              className="mb-4 rounded-md border border-cinnabar-400/25 bg-cinnabar-400/[0.08] px-4 py-3 text-sm text-cinnabar-100"
              role="alert"
            >
              {shellError}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.8fr)]">
            {hasCatalogError ? (
              <Panel eyebrow="CATALOG ERROR" title="物品資料載入失敗">
                <div className="grid min-h-64 place-items-center rounded-md border border-dashed border-cinnabar-400/25 bg-cinnabar-400/[0.05] p-5 text-center">
                  <div>
                    <p className="text-sm text-cinnabar-100" role="alert">
                      無法載入 V1 物品資料，角色進度仍安全保留。
                    </p>
                    <Button
                      className="mt-4"
                      onClick={handleReloadCatalog}
                      variant="secondary"
                    >
                      重新載入物品資料
                    </Button>
                  </div>
                </div>
              </Panel>
            ) : activeItem.path === '/game/cultivation' &&
            !gameState.isLoading ? (
              <CultivationPage />
            ) : activeItem.path === '/game/explore' &&
              !gameState.isLoading ? (
              <ExplorePage />
            ) : activeItem.path === '/game/loadout' &&
              !gameState.isLoading ? (
              <LoadoutPage />
            ) : activeItem.path === '/game/cave' &&
              !gameState.isLoading ? (
              <CavePage />
            ) : (
              <Panel
                eyebrow="PAGE STATUS"
                title={activeItem.label}
              >
                {gameState.isLoading ? (
                <div
                  aria-label="GameState 載入中"
                  className="grid min-h-64 place-items-center rounded-md border border-dashed border-white/12 bg-black/15"
                  role="status"
                >
                  <div className="text-center">
                    <span
                      aria-hidden="true"
                      className="mx-auto block size-7 animate-spin rounded-full border-2 border-gold-300/60 border-r-transparent"
                    />
                    <p className="mt-3 text-sm text-neutral-500">
                      載入遊戲資料
                    </p>
                  </div>
                </div>
              ) : (
                <div className="min-h-64 rounded-md border border-dashed border-white/12 bg-black/15 p-5 sm:p-7">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-full border border-gold-300/25 bg-gold-300/[0.07] font-serif text-xl text-gold-100"
                    >
                      {activeItem.glyph}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl text-neutral-100">
                        {activeItem.label}資料暫時無法顯示
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-400">
                        {activeItem.description}
                      </p>
                    </div>
                  </div>
                </div>
                )}
              </Panel>
            )}

            <Panel eyebrow="CHARACTER RESOURCES" title="角色資源">
              <dl className="grid gap-3 text-sm">
                <div className="rounded-md border border-white/10 bg-black/15 p-3">
                  <dt className="text-xs text-neutral-600">靈根精華</dt>
                  <dd className="mt-1 tabular-nums text-neutral-300">
                    {gameState.cultivationState.rootEssence.toLocaleString()}
                  </dd>
                </div>
                <div className="rounded-md border border-white/10 bg-black/15 p-3">
                  <dt className="text-xs text-neutral-600">突破保底</dt>
                  <dd className="mt-1 tabular-nums text-neutral-300">
                    第 {gameState.cultivationState.pity} 次
                  </dd>
                </div>
                <div className="rounded-md border border-white/10 bg-black/15 p-3">
                  <dt className="text-xs text-neutral-600">背包項目</dt>
                  <dd className="mt-1 tabular-nums text-neutral-300">
                    {gameState.inventory.length.toLocaleString()} 類
                  </dd>
                </div>
              </dl>
            </Panel>
          </div>
        </main>
      </div>

      <MobileNavigation navigationItems={navigationItems} />

      <Drawer
        isOpen={isCharacterDrawerOpen}
        onClose={handleCloseCharacterDrawer}
        title="角色詳情"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words font-serif text-2xl text-neutral-100">
              {character.name}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {character.realm}・{character.minorRealm}
            </p>
          </div>
          <Button
            aria-label="關閉角色詳情"
            className="min-w-0 shrink-0"
            onClick={handleCloseCharacterDrawer}
            variant="ghost"
          >
            關閉
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {[
            ['靈根', character.spiritualRoot],
            ['品質', character.spiritualRootQuality],
            ['生命', `${character.health.toLocaleString()}／${character.maxHealth.toLocaleString()}`],
            ['靈力', `${character.spiritPower.toLocaleString()}／${character.maxSpiritPower.toLocaleString()}`],
            ['靈石', character.spiritStones.toLocaleString()],
            ['性別', character.gender],
          ].map(([label, value]) => (
            <div
              className="min-w-0 rounded-md border border-white/10 bg-black/20 p-3"
              key={label}
            >
              <p className="text-xs text-neutral-600">{label}</p>
              <p className="mt-1 break-words tabular-nums text-neutral-200">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <ProgressBar
            label="修為進度"
            max={character.cultivationTarget}
            tone="gold"
            value={character.cultivation}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-white/10 bg-white/[0.025] p-4">
            <p className="text-xs text-neutral-600">靈根精華</p>
            <p className="mt-2 tabular-nums text-gold-100">
              {gameState.cultivationState.rootEssence.toLocaleString()}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.025] p-4">
            <p className="text-xs text-neutral-600">突破保底</p>
            <p className="mt-2 tabular-nums text-jade-100">
              第 {gameState.cultivationState.pity} 次
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default bind(gameShellViewController, useGameShellViewModel)
