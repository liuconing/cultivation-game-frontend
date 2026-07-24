import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router'
import { Button, Panel, StatusBadge } from '@/components'
import { exploreUsecase } from '@/domain'
import type { ExplorationData } from '@/domain/repository'
import { getApiClientError } from '@/lib/axios'
import { useGameMutation } from '../use-game-mutation'
import { useGameRuntime } from '../use-game-runtime'
import { createExplorationResultView } from './exploration-result.adapter'

/** 玩家送出的探索操作意圖。 */
interface ExploreIntent {
  /** 玩家選擇的地圖 ID。 */
  mapId: string
}

const mapStatusCopy = {
  unlocked: {
    label: '同境界',
    tone: 'jade' as const,
    description: '可安全進入',
  },
  challenging: {
    label: '越一境界',
    tone: 'gold' as const,
    description: '境界壓制・掉落加成',
  },
  locked: {
    label: '越兩階',
    tone: 'cinnabar' as const,
    description: '尚未解鎖・不可進入',
  },
}

/** 每筆戰鬥敘述顯示的間隔毫秒數。 */
const battleLogPlaybackIntervalMs = 450

/** 地圖選擇、探索提交與戰鬥結果的正式 API 頁面。 */
export function ExplorePage() {
  const navigate = useNavigate()
  const { gameState } = useGameRuntime()
  const [selectedMapId, setSelectedMapId] = useState(
    gameState.maps[0]?.id ?? '',
  )
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [explorationResult, setExplorationResult] =
    useState<ExplorationData | null>(null)
  const [exploreError, setExploreError] = useState<string | null>(
    null,
  )
  const [visibleBattleLogCount, setVisibleBattleLogCount] =
    useState(0)
  const resultRef = useRef<HTMLDivElement>(null)
  const battleLogRef = useRef<HTMLOListElement>(null)
  const exploreTriggerRef = useRef<HTMLElement>(null)
  const selectedMap =
    gameState.maps.find((map) => map.id === selectedMapId) ??
    gameState.maps[0]
  const resultView = useMemo(
    () =>
      explorationResult
        ? createExplorationResultView(explorationResult)
        : null,
    [explorationResult],
  )
  const battle = resultView?.battle ?? null
  const visibleBattleLog =
    battle?.log.slice(0, visibleBattleLogCount) ?? []
  const isBattlePlaybackComplete =
    visibleBattleLogCount >= (battle?.log.length ?? 0)
  const isEncounter = resultView?.kind === 'event'
  const hasLowResources =
    gameState.character.health / gameState.character.maxHealth < 0.3 ||
    gameState.character.spiritPower /
      gameState.character.maxSpiritPower <
      0.2
  const exploreMutation = useGameMutation<
    ExploreIntent,
    Awaited<ReturnType<typeof exploreUsecase>>
  >({
      operation: 'explore',
      request: ({ mapId }, { idempotencyKey }) =>
        exploreUsecase({ mapId }, { idempotencyKey }),
      enableGlobalError: false,
      onSuccess: (response) => {
        setExploreError(null)
        setExplorationResult(response.data)
        setVisibleBattleLogCount(
          response.data.eventType === 'battle'
            ? Math.min(1, response.data.battleLog?.length ?? 0)
            : 0,
        )
        setIsResultOpen(true)
      },
      onError: (error) => {
        setExploreError(getApiClientError(error).message)
      },
    })
  const canExplore =
    Boolean(selectedMap) &&
    selectedMap?.status !== 'locked' &&
    !exploreMutation.isPending

  const closeResult = useCallback(() => {
    setIsResultOpen(false)
    setVisibleBattleLogCount(0)
  }, [])

  useEffect(() => {
    if (
      !isResultOpen ||
      !battle ||
      visibleBattleLogCount >= battle.log.length
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setVisibleBattleLogCount((currentCount) =>
        Math.min(currentCount + 1, battle.log.length),
      )
    }, battleLogPlaybackIntervalMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [battle, isResultOpen, visibleBattleLogCount])

  useEffect(() => {
    if (!isResultOpen || !battleLogRef.current) {
      return
    }

    battleLogRef.current.scrollTo({
      behavior: 'smooth',
      top: battleLogRef.current.scrollHeight,
    })
  }, [isResultOpen, visibleBattleLogCount])

  useEffect(() => {
    if (!isResultOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    resultRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeResult()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = Array.from(
        resultRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        resultRef.current?.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          document.activeElement === resultRef.current)
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      exploreTriggerRef.current?.focus()
    }
  }, [closeResult, isResultOpen])

  const handleExplore = () => {
    if (!canExplore) {
      return
    }

    exploreTriggerRef.current = document.activeElement as HTMLElement | null
    setExploreError(null)
    exploreMutation.execute({
      mapId: selectedMap.id,
    })
  }

  const handleGoToLoadout = () => {
    setIsResultOpen(false)
    navigate('/game/loadout')
  }

  return (
    <>
      <div className="grid gap-4">
        <Panel eyebrow="EXPLORE" title="探索地圖">
          <div className="grid gap-3">
            {gameState.maps.map((map) => {
              const status = mapStatusCopy[map.status]
              const isSelected = map.id === selectedMap?.id

              return (
                <button
                  aria-pressed={isSelected}
                  className={`min-w-0 rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-300 ${
                    isSelected
                      ? 'border-gold-400/35 bg-gold-400/[0.07]'
                      : 'border-white/10 bg-black/15 hover:bg-white/[0.035]'
                  } ${
                    map.status === 'locked'
                      ? 'cursor-not-allowed opacity-55'
                      : ''
                  }`}
                  disabled={map.status === 'locked'}
                  key={map.id}
                  onClick={() => setSelectedMapId(map.id)}
                  type="button"
                >
                  <span className="flex min-w-0 items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-lg text-neutral-100">
                        {map.name}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        建議境界・{map.recommendedRealm}
                      </span>
                    </span>
                    <StatusBadge tone={status.tone}>
                      {status.label}
                    </StatusBadge>
                  </span>

                  <span className="mt-3 block text-xs text-neutral-500">
                    {status.description}
                  </span>
                  <span className="mt-3 grid gap-1 text-xs leading-5 text-neutral-600 sm:grid-cols-2">
                    <span className="min-w-0 break-words">
                      挑戰獎勵：×
                      {map.challengeRewardMultiplier.toFixed(2)}
                    </span>
                    <span className="min-w-0 break-words">
                      掉落倍率：×{map.dropMultiplier.toFixed(2)}
                    </span>
                  </span>
                </button>
              )
            })}
            {gameState.maps.length === 0 ? (
              <p className="rounded-md border border-dashed border-white/12 px-4 py-12 text-center text-sm text-neutral-500">
                目前沒有可探索的 V1 地圖。
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel eyebrow="EXPEDITION READY" title="出發準備">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <p className="font-serif text-xl text-neutral-100">
                {selectedMap?.name ?? '尚未選擇地圖'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone="cinnabar">
                  生命{' '}
                  {gameState.character.health.toLocaleString()}／
                  {gameState.character.maxHealth.toLocaleString()}
                </StatusBadge>
                <StatusBadge tone="jade">
                  靈力{' '}
                  {gameState.character.spiritPower.toLocaleString()}／
                  {gameState.character.maxSpiritPower.toLocaleString()}
                </StatusBadge>
              </div>
              {selectedMap?.status === 'challenging' ? (
                <p className="mt-3 text-xs leading-6 text-gold-100">
                  越階探索將受到境界壓制，但稀有掉落機率提高。
                </p>
              ) : null}
              {hasLowResources ? (
                <p
                  className="mt-3 text-xs leading-6 text-cinnabar-100"
                  role="alert"
                >
                  目前生命或靈力偏低；探索仍可提交，戰鬥與獎勵由
                  後端結算。
                </p>
              ) : null}
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={!canExplore}
              isLoading={exploreMutation.isPending}
              onClick={handleExplore}
            >
              {selectedMap?.status === 'locked' ? '尚未解鎖' : '開始探索'}
            </Button>
          </div>
          {exploreError ? (
            <p className="mt-4 text-sm text-cinnabar-100" role="alert">
              {exploreError}
            </p>
          ) : null}
        </Panel>
      </div>

      {isResultOpen ? (
        <div
          aria-labelledby="exploration-result-title"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/98 p-3 backdrop-blur-xl sm:p-5 lg:overflow-hidden"
          role="dialog"
        >
          <div
            className="mx-auto flex min-h-full w-full max-w-5xl flex-col outline-none lg:h-full lg:min-h-0"
            ref={resultRef}
            tabIndex={-1}
          >
            <header className="flex min-w-0 items-start justify-between gap-3 border-b border-white/12 pb-4">
              <div className="min-w-0">
                <p className="text-xs tracking-[0.2em] text-gold-200/65">
                  EXPLORATION RESULT
                </p>
                <h2
                  className="mt-1 break-words font-serif text-2xl text-neutral-100"
                  id="exploration-result-title"
                >
                  {resultView?.title ?? '探索結果'}
                </h2>
              </div>
              <StatusBadge
                tone={
                  isEncounter || battle?.result === 'victory'
                    ? 'jade'
                    : 'cinnabar'
                }
              >
                {isEncounter
                  ? '奇遇'
                  : battle?.result === 'victory'
                    ? battle.firstKill
                      ? 'Boss 首殺'
                      : '勝利'
                    : battle?.result === 'turn-limit'
                      ? '30 回合失敗'
                      : '戰敗'}
              </StatusBadge>
            </header>

            {isEncounter ? (
              <div className="my-5 grid flex-1 place-items-center rounded-lg border border-jade-400/20 bg-jade-400/[0.05] p-6 text-center">
                <div>
                  <p
                    aria-hidden="true"
                    className="font-serif text-6xl text-jade-100"
                  >
                    緣
                  </p>
                  <p className="mt-5 text-lg text-neutral-200">
                    {resultView?.eventMessage}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    {resultView?.createdEquipmentIds.length
                      ? `已取得 ${resultView.createdEquipmentIds.length} 件裝備。`
                      : '本次沒有裝備 instance。'}
                  </p>
                  {resultView?.rewardLines.length ? (
                    <ul className="mt-4 grid gap-1 text-sm text-gold-100">
                      {resultView.rewardLines.map((reward) => (
                        <li key={reward}>・{reward}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 gap-4 py-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
                <section className="flex min-h-0 min-w-0 flex-col rounded-lg border border-white/12 bg-ink-900/70 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg text-neutral-100">
                        戰鬥推演
                      </h3>
                      <p
                        aria-live="polite"
                        className="mt-1 text-xs text-neutral-500"
                        role="status"
                      >
                        {isBattlePlaybackComplete
                          ? `推演完成，共 ${battle?.log.length ?? 0} 次行動`
                          : `推演中・${visibleBattleLogCount}／${battle?.log.length ?? 0}`}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        isBattlePlaybackComplete ? 'jade' : 'gold'
                      }
                    >
                      {isBattlePlaybackComplete ? '已結算' : '進行中'}
                    </StatusBadge>
                  </div>
                  <ol
                    aria-live="polite"
                    aria-label={`${battle?.rounds ?? 0} 回合戰鬥紀錄`}
                    aria-relevant="additions"
                    className="ink-scrollbar mt-4 h-[calc(100dvh-18rem)] min-h-72 space-y-2 overflow-y-auto overscroll-contain pr-2 text-sm leading-6 lg:h-auto lg:min-h-0 lg:flex-1"
                    ref={battleLogRef}
                    role="log"
                  >
                    {visibleBattleLog.map((entry, index) => (
                      <li
                        className="break-words rounded border border-white/[0.07] bg-black/15 px-3 py-2 text-neutral-400"
                        key={`${battle?.id ?? 'battle'}-${index}`}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-gold-100">
                            第 {entry.round} 回合
                          </span>
                          <span
                            className={
                              entry.hit
                                ? 'text-jade-100'
                                : 'text-neutral-500'
                            }
                          >
                            {entry.hit ? '命中' : '閃避'}
                          </span>
                          {entry.critical ? (
                            <span className="text-cinnabar-100">
                              暴擊
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-neutral-300">
                          {entry.message}
                        </p>
                        <p className="mt-1 text-xs tabular-nums text-neutral-600">
                          {entry.hit
                            ? `造成 ${entry.damage.toLocaleString()} 點傷害`
                            : '本次未造成傷害'}
                          <span aria-hidden="true"> ・ </span>
                          <span className="font-semibold text-gold-100">
                            {entry.targetName}
                          </span>{' '}
                          剩餘生命{' '}
                          <strong className="font-semibold text-cinnabar-100">
                            {entry.targetHp.toLocaleString()}
                          </strong>
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>

                <aside className="grid min-w-0 content-start gap-4">
                  <section className="rounded-lg border border-white/12 bg-ink-900/70 p-4">
                    <h3 className="font-serif text-lg text-neutral-100">
                      結算狀態
                    </h3>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {[
                        ['敵人', battle?.enemyName ?? '未知'],
                        ['回合', `${battle?.rounds ?? 0}`],
                        [
                          '剩餘生命',
                          `${battle?.healthRemaining ?? 0}`,
                        ],
                        [
                          '剩餘靈力',
                          `${battle?.spiritRemaining ?? 0}`,
                        ],
                        [
                          '敵方生命',
                          `${battle?.enemyHealthRemaining ?? 0}`,
                        ],
                        [
                          '狀態',
                          battle?.result === 'victory'
                            ? '完成'
                            : '未完成',
                        ],
                      ].map(([label, value]) => (
                        <div
                          className="min-w-0 rounded border border-white/10 bg-black/20 p-2.5"
                          key={label}
                        >
                          <dt className="truncate text-neutral-600">
                            {label}
                          </dt>
                          <dd className="mt-1 break-words tabular-nums text-neutral-200">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  <section className="rounded-lg border border-gold-400/20 bg-gold-400/[0.05] p-4">
                    <h3 className="font-serif text-lg text-neutral-100">
                      獎勵摘要
                    </h3>
                    {battle?.rewards.length ? (
                      <ul className="mt-3 grid gap-2 text-sm text-gold-100">
                        {battle.rewards.map((reward) => (
                          <li className="break-words" key={reward}>
                            ・{reward}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-600">
                        本次探索沒有獎勵。
                      </p>
                    )}
                  </section>
                </aside>
              </div>
            )}

            <footer className="mt-auto grid gap-2 border-t border-white/12 pt-4 sm:grid-cols-2">
              <Button onClick={closeResult} variant="ghost">
                返回探索
              </Button>
              <Button onClick={handleGoToLoadout}>
                前往整備
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}
