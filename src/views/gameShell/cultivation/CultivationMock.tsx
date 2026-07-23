import { useCallback, useRef, useState } from 'react'
import {
  Button,
  Modal,
  Panel,
  ProgressBar,
  StatusBadge,
} from '@/components'
import { claimCultivationUsecase } from '@/domain'
import { useMutation } from '@/hook'
import { uuid } from '@/lib/uuid'
import { getOrCreateIdempotencyKey } from '../game-mutation'
import { useGameRuntime } from '../use-game-runtime'

/** 修為領取 mutation 使用的冪等參數。 */
interface ClaimCultivationMutationParams {
  /** 同一次領取與網路重試共用的冪等鍵。 */
  idempotencyKey: string
}

type CultivationModal =
  | 'breakthroughConfirm'
  | 'breakthroughResult'
  | 'rootConfirm'
  | null

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} 小時 ${remainingMinutes} 分`
}

/** UI-05 修煉、突破與靈根成長的純記憶體互動 Mock。 */
export function CultivationMock() {
  const {
    gameState,
    reloadGameState,
    resolveBreakthrough,
    upgradeSpiritualRoot,
  } = useGameRuntime()
  const [modal, setModal] = useState<CultivationModal>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [lastBreakthroughResult, setLastBreakthroughResult] = useState<
    'success' | 'failure' | null
  >(null)
  const [claimNotice, setClaimNotice] = useState<string | null>(null)
  const claimKeyRef = useRef<string | null>(null)
  const { character, cultivationState } = gameState

  const claimMutation = useMutation(
    ({ idempotencyKey }: ClaimCultivationMutationParams) =>
      claimCultivationUsecase({ idempotencyKey }),
    {
      onSuccess: async (response) => {
        claimKeyRef.current = null
        setClaimNotice(
          `已領取 ${response.data.awardedCultivation.toLocaleString()} 修為。`,
        )
        await reloadGameState()
      },
    },
  )

  const isFoundationComplete =
    character.realm === '築基境' && character.minorRealm === '圓滿'
  const isCultivationFull =
    character.cultivation >= character.cultivationTarget
  const hasEnoughStones =
    character.spiritStones >= cultivationState.spiritStoneCost
  const canBreakthrough =
    isCultivationFull && hasEnoughStones && !isFoundationComplete
  const canClaim =
    cultivationState.claimableCultivation > 0 &&
    !gameState.isLoading &&
    !claimMutation.isPending &&
    !isFoundationComplete
  const canUpgradeRoot =
    cultivationState.nextRootQuality !== null &&
    cultivationState.rootEssence >=
      cultivationState.rootUpgradeCost &&
    !isFoundationComplete

  const missingBreakthroughRequirements = [
    !isCultivationFull ? '修為尚未圓滿' : null,
    !hasEnoughStones
      ? `缺少 ${(cultivationState.spiritStoneCost - character.spiritStones).toLocaleString()} 靈石`
      : null,
    isFoundationComplete ? '金丹內容尚未開放' : null,
  ].filter((requirement): requirement is string => Boolean(requirement))

  const closeModal = useCallback(() => {
    if (!isBusy) {
      setModal(null)
    }
  }, [isBusy])

  const handleClaim = () => {
    if (!canClaim || isBusy || claimMutation.isPending) {
      return
    }

    const idempotencyKey = getOrCreateIdempotencyKey(
      claimKeyRef.current,
      uuid,
    )
    claimKeyRef.current = idempotencyKey
    setClaimNotice(null)
    claimMutation.mutate({ idempotencyKey })
  }

  const handleConfirmBreakthrough = () => {
    if (!canBreakthrough || isBusy) {
      return
    }

    const outcome = cultivationState.breakthroughOutcome
    setIsBusy(true)
    window.setTimeout(() => {
      resolveBreakthrough(outcome)
      setLastBreakthroughResult(outcome)
      setIsBusy(false)
      setModal('breakthroughResult')
    }, 550)
  }

  const handleConfirmRootUpgrade = () => {
    if (!canUpgradeRoot || isBusy) {
      return
    }

    setIsBusy(true)
    window.setTimeout(() => {
      upgradeSpiritualRoot()
      setIsBusy(false)
      setModal(null)
    }, 450)
  }

  return (
    <>
      <div className="grid gap-4">
        <Panel eyebrow="UI-05・IDLE CULTIVATION" title="放置修煉">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="jade">
                  累積 {formatDuration(cultivationState.idleMinutes)}
                </StatusBadge>
                <StatusBadge tone="neutral">
                  上限 {cultivationState.idleCapMinutes / 60} 小時
                </StatusBadge>
              </div>

              <p className="mt-5 text-xs text-neutral-500">可領取修為</p>
              <p className="mt-1 break-words font-serif text-3xl tabular-nums text-gold-100">
                {cultivationState.claimableCultivation.toLocaleString()}
              </p>
              <p className="mt-2 text-xs leading-6 text-neutral-500">
                基礎每小時{' '}
                {cultivationState.baseCultivationPerHour.toLocaleString()}・
                {cultivationState.equippedMethodName
                  ? `${cultivationState.equippedMethodName} × ${cultivationState.methodMultiplier}`
                  : '未裝備功法 × 1'}
              </p>
              {claimNotice ? (
                <p
                  aria-live="polite"
                  className="mt-3 text-sm text-jade-100"
                  role="status"
                >
                  {claimNotice}
                </p>
              ) : null}
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={!canClaim}
              isLoading={claimMutation.isPending}
              onClick={handleClaim}
            >
              領取修為
            </Button>
          </div>
        </Panel>

        <Panel eyebrow="REALM PROGRESS" title="境界與突破">
          <div className="grid gap-5">
            <ProgressBar
              label={`${character.realm}・${character.minorRealm}`}
              max={character.cultivationTarget}
              tone="gold"
              value={character.cultivation}
            />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ['基礎', cultivationState.breakthroughBaseRate],
                ['靈根', cultivationState.rootBonus],
                ['氣運', cultivationState.luckBonus],
                ['丹藥', cultivationState.pillBonus],
                ['功法', cultivationState.methodBonus],
                ['保底', cultivationState.pityBonus],
              ].map(([label, value]) => (
                <div
                  className="min-w-0 rounded-md border border-white/10 bg-black/15 p-3"
                  key={label}
                >
                  <p className="truncate text-xs text-neutral-600">{label}</p>
                  <p className="mt-1 tabular-nums text-neutral-200">
                    +{value}%
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-md border border-gold-400/20 bg-gold-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-neutral-500">最終成功率</p>
                <p className="mt-1 font-serif text-3xl tabular-nums text-gold-100">
                  {Math.min(
                    95,
                    Math.max(1, cultivationState.finalRate),
                  )}
                  %
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  費用{' '}
                  {cultivationState.spiritStoneCost.toLocaleString()} 靈石・
                  保底第 {cultivationState.pity} 次
                </p>
              </div>
              <Button
                className="w-full sm:w-auto"
                disabled={!canBreakthrough}
                onClick={() => setModal('breakthroughConfirm')}
                variant="secondary"
              >
                {isFoundationComplete ? '金丹內容開發中' : '準備突破'}
              </Button>
            </div>

            {missingBreakthroughRequirements.length > 0 ? (
              <ul className="grid gap-1 text-xs text-cinnabar-100">
                {missingBreakthroughRequirements.map((requirement) => (
                  <li key={requirement}>・{requirement}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </Panel>

        <Panel eyebrow="SPIRITUAL ROOT" title="靈根成長">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-sm text-neutral-300">
                {character.spiritualRoot}・
                <span className="text-gold-100">
                  {character.spiritualRootQuality}
                </span>
                {cultivationState.nextRootQuality ? (
                  <>
                    <span className="mx-2 text-neutral-600">→</span>
                    <span className="text-jade-100">
                      {cultivationState.nextRootQuality}
                    </span>
                  </>
                ) : null}
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                靈根精華{' '}
                <span className="tabular-nums text-neutral-200">
                  {cultivationState.rootEssence.toLocaleString()}／
                  {cultivationState.rootUpgradeCost.toLocaleString()}
                </span>
              </p>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!canUpgradeRoot}
              onClick={() => setModal('rootConfirm')}
            >
              {cultivationState.nextRootQuality
                ? '提升靈根'
                : '已達天品'}
            </Button>
          </div>
        </Panel>
      </div>

      <Modal
        isBusy={isBusy}
        isOpen={modal === 'breakthroughConfirm'}
        onClose={closeModal}
        title="確認突破"
      >
        <p>
          將消耗{' '}
          <strong className="text-gold-100">
            {cultivationState.spiritStoneCost.toLocaleString()} 靈石
          </strong>
          ，以 {cultivationState.finalRate}% 成功率突破。
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2">
          {[
            ['境界', `${character.realm}・${character.minorRealm}`],
            ['保底', `第 ${cultivationState.pity} 次`],
            ['功法', cultivationState.equippedMethodName ?? '未裝備'],
            ['結果 fixture', cultivationState.breakthroughOutcome === 'success' ? '成功' : '失敗'],
          ].map(([label, value]) => (
            <div
              className="min-w-0 rounded border border-white/10 bg-black/20 p-3"
              key={label}
            >
              <dt className="text-xs text-neutral-600">{label}</dt>
              <dd className="mt-1 break-words text-neutral-200">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button disabled={isBusy} onClick={closeModal} variant="ghost">
            取消
          </Button>
          <Button
            isLoading={isBusy}
            onClick={handleConfirmBreakthrough}
            variant="secondary"
          >
            確認突破
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modal === 'breakthroughResult'}
        onClose={closeModal}
        title={
          lastBreakthroughResult === 'success' ? '突破成功' : '突破失敗'
        }
      >
        <div
          className={`rounded-md border p-4 ${
            lastBreakthroughResult === 'success'
              ? 'border-jade-400/30 bg-jade-400/[0.08] text-jade-100'
              : 'border-cinnabar-400/30 bg-cinnabar-400/[0.08] text-cinnabar-100'
          }`}
        >
          {lastBreakthroughResult === 'success'
            ? '靈臺澄明，已踏入築基初期；保底進度歸零。'
            : '氣機散去，本次突破未成；保底成功率增加 5%。'}
        </div>
        <Button className="mt-5 w-full" onClick={closeModal}>
          返回修煉
        </Button>
      </Modal>

      <Modal
        isBusy={isBusy}
        isOpen={modal === 'rootConfirm'}
        onClose={closeModal}
        title="確認提升靈根"
      >
        <p>
          {character.spiritualRootQuality}
          <span className="mx-2 text-neutral-600">→</span>
          <strong className="text-jade-100">
            {cultivationState.nextRootQuality}
          </strong>
        </p>
        <p className="mt-3 text-neutral-400">
          將消耗 {cultivationState.rootUpgradeCost.toLocaleString()}{' '}
          靈根精華，提升後不可復原。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button disabled={isBusy} onClick={closeModal} variant="ghost">
            取消
          </Button>
          <Button
            isLoading={isBusy}
            onClick={handleConfirmRootUpgrade}
          >
            確認提升
          </Button>
        </div>
      </Modal>
    </>
  )
}
