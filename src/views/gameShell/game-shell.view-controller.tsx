import {
  Button,
  Drawer,
  Panel,
  ProgressBar,
  StatusBadge,
} from '@/components'
import type { MockScenario } from '@/data/gameMock'
import { bind } from '@/utils'
import {
  useGameShellViewModel,
  type IGameShellViewModel,
} from './game-shell.view-model'
import {
  DesktopNavigation,
  MobileNavigation,
} from './game-shell.navigation'
import { CultivationMock } from './cultivation/CultivationMock'
import { ExploreMock } from './explore/ExploreMock'
import { LoadoutMock } from './loadout/LoadoutMock'
import { CaveMock } from './cave/CaveMock'

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
  scenarioOptions,
  indicators,
  isCharacterDrawerOpen,
  isAccountMenuOpen,
  shellNotice,
  accountLabel,
  accountButtonRef,
  accountMenuRef,
  accountFirstItemRef,
  handleScenarioChange,
  handleOpenCharacterDrawer,
  handleCloseCharacterDrawer,
  handleToggleAccountMenu,
  handleReloadState,
  handleLogout,
  handleReturnToLogin,
}: IGameShellViewModel) {
  const { character } = gameState
  const isSessionExpired = gameState.scenario === 'sessionExpired'
  const isDisconnected = gameState.scenario === 'disconnected'

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
                      className="min-h-10 w-full rounded px-3 text-left text-sm text-cinnabar-100 hover:bg-cinnabar-400/10 focus-visible:outline-2 focus-visible:outline-jade-300"
                      onClick={handleLogout}
                      role="menuitem"
                      type="button"
                    >
                      登出
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-[1.35fr_1fr_1fr] gap-1.5 sm:gap-2">
              <div className="min-w-0 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5">
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
                <span className="block truncate text-neutral-500">靈力・靈石</span>
                <span className="block truncate tabular-nums text-jade-100">
                  {formatCompactNumber(character.spiritPower)}・
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
                UI-04・XIA-39
              </p>
              <p className="truncate font-serif text-lg text-neutral-100">
                {activeItem.label}主框架
              </p>
            </div>
            <label className="min-w-0 text-xs text-neutral-500 sm:w-56">
              <span className="sr-only">Mock 情境</span>
              <select
                aria-label="切換遊戲框架 Mock 情境"
                className="min-h-10 w-full rounded-md border border-white/14 bg-ink-950 px-3 text-sm text-neutral-200 focus-visible:outline-2 focus-visible:outline-jade-300"
                onChange={(event) => {
                  handleScenarioChange(
                    event.target.value as MockScenario,
                  )
                }}
                value={gameState.scenario}
              >
                {scenarioOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
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

          {gameState.notice ? (
            <div
              aria-live={isSessionExpired ? 'assertive' : 'polite'}
              className={`mb-4 flex flex-col gap-3 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
                isSessionExpired || isDisconnected
                  ? 'border-cinnabar-400/30 bg-cinnabar-400/[0.08] text-cinnabar-100'
                  : 'border-gold-400/25 bg-gold-400/[0.07] text-gold-100'
              }`}
              role={isSessionExpired ? 'alert' : 'status'}
            >
              <span className="min-w-0 break-words">{gameState.notice}</span>
              {isSessionExpired ? (
                <Button
                  className="w-full shrink-0 sm:w-auto"
                  onClick={handleReturnToLogin}
                  variant="danger"
                >
                  返回登入
                </Button>
              ) : null}
              {isDisconnected ? (
                <Button
                  className="w-full shrink-0 sm:w-auto"
                  onClick={handleReloadState}
                  variant="secondary"
                >
                  重試載入
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.8fr)]">
            {activeItem.path === '/game/cultivation' &&
            !gameState.isLoading ? (
              <CultivationMock />
            ) : activeItem.path === '/game/explore' &&
              !gameState.isLoading ? (
              <ExploreMock />
            ) : activeItem.path === '/game/loadout' &&
              !gameState.isLoading ? (
              <LoadoutMock />
            ) : activeItem.path === '/game/cave' &&
              !gameState.isLoading ? (
              <CaveMock />
            ) : (
              <Panel
                eyebrow={`${activeItem.nextTask} PLACEHOLDER`}
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
                      載入 GameState Mock
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
                        {activeItem.label}頁面內容預留區
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-400">
                        {activeItem.description}
                      </p>
                      <p className="mt-5 text-xs leading-6 text-neutral-600">
                        本張 task 只建立穩定的共用框架；正式互動將由
                        {activeItem.nextTask} 分批完成。
                      </p>
                    </div>
                  </div>
                </div>
                )}
              </Panel>
            )}

            <Panel eyebrow="PERSISTENT STATE" title="框架狀態">
              <dl className="grid gap-3 text-sm">
                <div className="rounded-md border border-white/10 bg-black/15 p-3">
                  <dt className="text-xs text-neutral-600">目前路由</dt>
                  <dd className="mt-1 truncate font-mono text-neutral-300">
                    {activeItem.path}
                  </dd>
                </div>
                <div className="rounded-md border border-white/10 bg-black/15 p-3">
                  <dt className="text-xs text-neutral-600">Mock 情境</dt>
                  <dd className="mt-1 truncate text-neutral-300">
                    {scenarioOptions.find(
                      (option) => option.value === gameState.scenario,
                    )?.label ?? gameState.scenario}
                  </dd>
                </div>
                <div className="rounded-md border border-white/10 bg-black/15 p-3">
                  <dt className="text-xs text-neutral-600">資料來源</dt>
                  <dd className="mt-1 text-neutral-300">
                    Zustand 記憶體 store
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

        <div className="mt-6 rounded-md border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs tracking-[0.16em] text-gold-200/60">
            UI-04 MOCK
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            完整衍生屬性、突破保底與靈根精華會在後續頁面任務加入。
          </p>
        </div>
      </Drawer>
    </div>
  )
}

export default bind(gameShellViewController, useGameShellViewModel)
