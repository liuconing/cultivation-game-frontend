import { useCallback, useRef, useState } from 'react'
import {
  Button,
  Modal,
  Panel,
  ProgressBar,
  StatusBadge,
} from '@/components'
import {
  breakthroughUsecase,
  claimCultivationUsecase,
  getBreakthroughPreviewUsecase,
  upgradeSpiritualRootUsecase,
} from '@/domain'
import type { BreakthroughParams } from '@/domain/repository'
import { useGlobalErrorHandler } from '@/error'
import { useFetch, useMutation } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import { uuid } from '@/lib/uuid'
import { getOrCreateIdempotencyKey } from '../game-mutation'
import { useGameRuntime } from '../use-game-runtime'

/** 修為領取 mutation 使用的冪等參數。 */
interface ClaimCultivationMutationParams {
  /** 同一次領取與網路重試共用的冪等鍵。 */
  idempotencyKey: string
}

/** 突破 mutation 使用的參數。 */
interface BreakthroughMutationParams {
  /** 玩家選用的突破丹藥。 */
  values: BreakthroughParams
  /** 同一次突破與網路重試共用的冪等鍵。 */
  idempotencyKey: string
}

/** 靈根升級 mutation 使用的參數。 */
interface RootUpgradeMutationParams {
  /** 同一次升級與網路重試共用的冪等鍵。 */
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

/** 修煉、突破與靈根成長的正式 API 頁面。 */
export function CultivationPage() {
  const { gameState, reloadGameState } = useGameRuntime()
  const [modal, setModal] = useState<CultivationModal>(null)
  const [lastBreakthroughResult, setLastBreakthroughResult] = useState<
    'success' | 'failure' | null
  >(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [breakthroughNotice, setBreakthroughNotice] = useState<
    string | null
  >(null)
  const [selectedPillId, setSelectedPillId] = useState('')
  const [breakthroughIdempotencyKey, setBreakthroughIdempotencyKey] =
    useState<string | null>(null)
  const [rootUpgradeNotice, setRootUpgradeNotice] = useState<
    string | null
  >(null)
  const [rootUpgradeError, setRootUpgradeError] = useState<
    string | null
  >(null)
  const claimKeyRef = useRef<string | null>(null)
  const rootUpgradeKeyRef = useRef<string | null>(null)
  const { notifySuccess } = useGlobalErrorHandler()
  const { character, cultivationState } = gameState

  const breakthroughPreviewQuery = useFetch(
    getBreakthroughPreviewUsecase,
    {
      ...(selectedPillId
        ? { pillTemplateId: selectedPillId }
        : {}),
    },
    {
      queryKey: ['breakthrough-preview', selectedPillId],
      retry: 1,
      enableGlobalError: false,
    },
  )

  const claimMutation = useMutation(
    ({ idempotencyKey }: ClaimCultivationMutationParams) =>
      claimCultivationUsecase({ idempotencyKey }),
    {
      enableGlobalError: false,
      onSuccess: async (response) => {
        claimKeyRef.current = null
        setClaimError(null)
        notifySuccess(
          `已領取 ${response.data.awardedCultivation.toLocaleString()} 修為。`,
          {
            title: '修為領取成功',
          },
        )
        await reloadGameState()
      },
      onError: (error) => {
        setClaimError(getApiClientError(error).message)
      },
    },
  )
  const breakthroughMutation = useMutation(
    ({ values, idempotencyKey }: BreakthroughMutationParams) =>
      breakthroughUsecase(values, { idempotencyKey }),
    {
      enableGlobalError: false,
      onSuccess: async (response) => {
        setBreakthroughIdempotencyKey(null)
        setLastBreakthroughResult(
          response.data.succeeded ? 'success' : 'failure',
        )
        await reloadGameState()
        setModal('breakthroughResult')
      },
      onError: (error) => {
        setBreakthroughNotice(getApiClientError(error).message)
      },
    },
  )
  const rootUpgradeMutation = useMutation(
    ({ idempotencyKey }: RootUpgradeMutationParams) =>
      upgradeSpiritualRootUsecase({ idempotencyKey }),
    {
      enableGlobalError: false,
      onSuccess: async (response) => {
        rootUpgradeKeyRef.current = null
        setRootUpgradeError(null)
        setRootUpgradeNotice(
          `靈根已由 ${response.data.beforeQuality} 提升至 ${response.data.afterQuality}，消耗 ${response.data.consumedEssence.toLocaleString()} 靈根精華。`,
        )
        await Promise.all([
          reloadGameState(),
          breakthroughPreviewQuery.refetch(),
        ])
        setModal(null)
      },
      onError: (error) => {
        setRootUpgradeError(getApiClientError(error).message)
      },
    },
  )

  const preview = breakthroughPreviewQuery.data?.data
  const breakthroughPreviewError = breakthroughPreviewQuery.error
    ? getApiClientError(breakthroughPreviewQuery.error).message
    : null
  const isFoundationComplete =
    preview?.unavailableReasons.includes('V1_REALM_CAP_REACHED') ??
    false
  const canBreakthrough =
    preview?.canAttempt === true &&
    !breakthroughMutation.isPending
  const canClaim =
    cultivationState.claimableCultivation > 0 &&
    !gameState.isLoading &&
    !claimMutation.isPending &&
    !isFoundationComplete
  const canUpgradeRoot =
    cultivationState.canUpgradeRoot &&
    !rootUpgradeMutation.isPending

  const breakthroughReasonLabels: Record<string, string> = {
    BREAKTHROUGH_NOT_READY: '修為尚未圓滿',
    INSUFFICIENT_SPIRIT_STONES: '靈石不足',
    ITEM_NOT_OWNED: '未持有選用丹藥',
    V1_REALM_CAP_REACHED: '金丹內容尚未開放',
  }
  const missingBreakthroughRequirements =
    preview?.unavailableReasons.map(
      (reason) => breakthroughReasonLabels[reason] ?? reason,
    ) ?? []

  const closeModal = useCallback(() => {
    if (
      !rootUpgradeMutation.isPending &&
      !breakthroughMutation.isPending
    ) {
      setModal(null)
    }
  }, [
    breakthroughMutation.isPending,
    rootUpgradeMutation.isPending,
  ])

  const handleClaim = () => {
    if (
      !canClaim ||
      rootUpgradeMutation.isPending ||
      claimMutation.isPending
    ) {
      return
    }

    const idempotencyKey = getOrCreateIdempotencyKey(
      claimKeyRef.current,
      uuid,
    )
    claimKeyRef.current = idempotencyKey
    setClaimError(null)
    claimMutation.mutate({ idempotencyKey })
  }

  const handleConfirmBreakthrough = () => {
    if (
      !canBreakthrough ||
      rootUpgradeMutation.isPending ||
      breakthroughMutation.isPending
    ) {
      return
    }

    const idempotencyKey = getOrCreateIdempotencyKey(
      breakthroughIdempotencyKey,
      uuid,
    )
    setBreakthroughIdempotencyKey(idempotencyKey)
    setBreakthroughNotice(null)
    breakthroughMutation.mutate({
      values: selectedPillId
        ? { pillTemplateId: selectedPillId }
        : {},
      idempotencyKey,
    })
  }

  const handleConfirmRootUpgrade = () => {
    if (!canUpgradeRoot || rootUpgradeMutation.isPending) {
      return
    }

    const idempotencyKey = getOrCreateIdempotencyKey(
      rootUpgradeKeyRef.current,
      uuid,
    )
    rootUpgradeKeyRef.current = idempotencyKey
    setRootUpgradeNotice(null)
    setRootUpgradeError(null)
    rootUpgradeMutation.mutate({ idempotencyKey })
  }

  return (
    <>
      <div className="grid gap-4">
        <Panel eyebrow="IDLE CULTIVATION" title="放置修煉">
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
              {claimError ? (
                <p
                  className="mt-3 text-sm text-cinnabar-100"
                  role="alert"
                >
                  {claimError}
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
                ['基礎', preview?.chance?.base ?? 0],
                ['靈根', preview?.chance?.spiritualRoot ?? 0],
                ['氣運', preview?.chance?.luck ?? 0],
                ['丹藥', preview?.chance?.pill ?? 0],
                ['功法', preview?.chance?.cultivationMethod ?? 0],
                ['保底', preview?.chance?.pity ?? 0],
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
                  {preview?.chance?.final ?? 0}
                  %
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  費用{' '}
                  {(preview?.spiritStoneCost ?? 0).toLocaleString()} 靈石・
                  保底第 {cultivationState.pity} 次
                </p>
                <label className="mt-3 block text-xs text-neutral-500">
                  突破丹藥
                  <select
                    className="mt-1 min-h-10 w-full rounded-md border border-white/12 bg-ink-950 px-3 text-sm text-neutral-200 focus-visible:outline-2 focus-visible:outline-jade-300"
                    disabled={breakthroughMutation.isPending}
                    onChange={(event) =>
                      setSelectedPillId(event.target.value)
                    }
                    value={selectedPillId}
                  >
                    <option value="">不使用丹藥</option>
                    {gameState.pills
                      .filter((pill) =>
                        pill.templateId.includes('breakthrough'),
                      )
                      .map((pill) => (
                        <option
                          key={pill.templateId}
                          value={pill.templateId}
                        >
                          {pill.name}（{pill.quantity}）
                        </option>
                      ))}
                  </select>
                </label>
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
            {breakthroughNotice ? (
              <p className="text-xs text-cinnabar-100" role="alert">
                {breakthroughNotice}
              </p>
            ) : null}
            {breakthroughPreviewError ? (
              <p className="text-xs text-cinnabar-100" role="alert">
                {breakthroughPreviewError}
              </p>
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
          {rootUpgradeNotice ? (
            <p
              aria-live="polite"
              className="mt-3 text-sm text-jade-100"
              role="status"
            >
              {rootUpgradeNotice}
            </p>
          ) : null}
          {rootUpgradeError ? (
            <p className="mt-3 text-sm text-cinnabar-100" role="alert">
              {rootUpgradeError}
            </p>
          ) : null}
          {!cultivationState.canUpgradeRoot &&
          cultivationState.rootUpgradeUnavailableReason ? (
            <p className="mt-3 text-xs text-cinnabar-100">
              {cultivationState.rootUpgradeUnavailableReason}
            </p>
          ) : null}
        </Panel>
      </div>

      <Modal
        isBusy={
          rootUpgradeMutation.isPending ||
          breakthroughMutation.isPending
        }
        isOpen={modal === 'breakthroughConfirm'}
        onClose={closeModal}
        title="確認突破"
      >
        <p>
          將消耗{' '}
          <strong className="text-gold-100">
            {(preview?.spiritStoneCost ?? 0).toLocaleString()} 靈石
          </strong>
          ，以 {preview?.chance?.final ?? 0}% 成功率突破。
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2">
          {[
            ['境界', `${character.realm}・${character.minorRealm}`],
            ['保底', `第 ${cultivationState.pity} 次`],
            ['功法', cultivationState.equippedMethodName ?? '未裝備'],
            ['丹藥', selectedPillId || '不使用'],
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
          <Button
            disabled={
              rootUpgradeMutation.isPending ||
              breakthroughMutation.isPending
            }
            onClick={closeModal}
            variant="ghost"
          >
            取消
          </Button>
          <Button
            isLoading={breakthroughMutation.isPending}
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
        isBusy={rootUpgradeMutation.isPending}
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
          <Button
            disabled={rootUpgradeMutation.isPending}
            onClick={closeModal}
            variant="ghost"
          >
            取消
          </Button>
          <Button
            isLoading={rootUpgradeMutation.isPending}
            onClick={handleConfirmRootUpgrade}
          >
            確認提升
          </Button>
        </div>
      </Modal>
    </>
  )
}
