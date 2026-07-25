import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Modal, Panel, StatusBadge } from '@/components'
import { exploreUsecase } from '@/domain'
import type { ExplorationData } from '@/domain/repository'
import { getApiClientError } from '@/lib/axios'
import { useGameMutation } from '../use-game-mutation'
import { useGameRuntime } from '../use-game-runtime'
import { createExplorationResultView } from './exploration-result.adapter'
import { getMapStatusPresentation } from './map-status.ts'
import { useExplorationPlayback } from './use-exploration-playback'

/** 玩家送出的探索操作意圖。 */
interface ExploreIntent {
  /** 玩家選擇的地圖 ID。 */
  mapId: string
}

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
  const {
    visibleBattleLog,
    visibleCount: visibleBattleLogCount,
    phase: battlePlaybackPhase,
    isOutcomeRevealed,
    scrollContainerRef: battleLogRef,
  } = useExplorationPlayback({
    isOpen: isResultOpen,
    battleId: battle?.id ?? null,
    battleLog: battle?.log ?? [],
  })
  const isEncounter = resultView?.kind === 'event'
  const canRevealBattleOutcome =
    isEncounter || isOutcomeRevealed
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
  }, [])

  const handleExplore = () => {
    if (!canExplore) {
      return
    }

    // Mutation pending 會讓按鈕暫時 disabled 並失焦；先保留觸發元素，
    // 讓全螢幕結果關閉時仍能回到原操作位置。
    exploreTriggerRef.current =
      document.activeElement as HTMLElement | null
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
              const status = getMapStatusPresentation(map)
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

      <Modal
        eyebrow="EXPLORATION RESULT"
        headerAccessory={
          <StatusBadge
            tone={
              !canRevealBattleOutcome
                ? 'gold'
                : isEncounter ||
                    battle?.result === 'victory'
                  ? 'jade'
                  : 'cinnabar'
            }
          >
            {!canRevealBattleOutcome
              ? battlePlaybackPhase === 'settling'
                ? '結算中'
                : '推演中'
              : isEncounter
              ? '奇遇'
              : battle?.result === 'victory'
                ? battle.firstKill
                  ? 'Boss 首殺'
                  : '勝利'
                : battle?.result === 'turn-limit'
                  ? '30 回合失敗'
                  : '戰敗'}
          </StatusBadge>
        }
        isOpen={isResultOpen}
        layout="fullscreen"
        onClose={closeResult}
        returnFocusRef={exploreTriggerRef}
        title={
          canRevealBattleOutcome
            ? resultView?.title ?? '探索結果'
            : '戰鬥推演'
        }
      >
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
              <div
                className={`grid min-h-0 flex-1 gap-4 py-5 ${
                  isOutcomeRevealed
                    ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]'
                    : ''
                }`}
              >
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
                        {battlePlaybackPhase === 'revealed'
                          ? `推演完成，共 ${battle?.log.length ?? 0} 次行動`
                          : battlePlaybackPhase === 'settling'
                            ? '戰報已完整顯示，正在結算'
                            : `推演中・${visibleBattleLogCount}／${battle?.log.length ?? 0}`}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        isOutcomeRevealed ? 'jade' : 'gold'
                      }
                    >
                      {isOutcomeRevealed
                        ? '已結算'
                        : battlePlaybackPhase === 'settling'
                          ? '結算中'
                          : '進行中'}
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

                {isOutcomeRevealed ? (
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
                          '戰鬥結束生命',
                          battle?.healthRemaining === undefined
                            ? '—'
                            : battle.healthRemaining.toLocaleString(),
                        ],
                        [
                          '戰鬥結束靈力',
                          battle?.spiritRemaining === undefined
                            ? '—'
                            : battle.spiritRemaining.toLocaleString(),
                        ],
                        [
                          '敵方生命',
                          battle?.enemyHealthRemaining === undefined
                            ? '—'
                            : battle.enemyHealthRemaining.toLocaleString(),
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
                    {!battle?.hasAuthoritativeSummary ? (
                      <p className="mt-3 text-xs leading-5 text-gold-100">
                        舊版回應未提供權威戰鬥摘要，未知數值不進行推算。
                      </p>
                    ) : null}
                    {battle?.settledHealthRemaining !== undefined ||
                    battle?.settledSpiritRemaining !== undefined ? (
                      <div className="mt-3 rounded border border-cinnabar-400/20 bg-cinnabar-400/[0.05] p-3 text-xs leading-5 text-neutral-400">
                        <p className="font-medium text-cinnabar-100">
                          戰敗返回洞府後
                        </p>
                        <p className="mt-1 tabular-nums">
                          生命{' '}
                          {battle.settledHealthRemaining?.toLocaleString() ??
                            '—'}
                          {' ・ '}靈力{' '}
                          {battle.settledSpiritRemaining?.toLocaleString() ??
                            '—'}
                        </p>
                        <p className="mt-1 text-neutral-600">
                          戰敗善後會保留 30% 生命與靈力，此數值不同於戰鬥停止當下。
                        </p>
                      </div>
                    ) : null}
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
                ) : null}
              </div>
            )}

            <footer className="mt-auto grid gap-2 border-t border-white/12 pt-4 sm:grid-cols-2">
              <Button onClick={closeResult} variant="ghost">
                返回探索
              </Button>
              {canRevealBattleOutcome &&
              (resultView?.createdEquipmentIds.length ?? 0) > 0 ? (
                <Button onClick={handleGoToLoadout}>
                  前往整備
                </Button>
              ) : null}
            </footer>
      </Modal>
    </>
  )
}
