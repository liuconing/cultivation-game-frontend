import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Modal,
  Panel,
  ProgressBar,
  StatusBadge,
} from '@/components'
import { completeRestUsecase } from '@/domain'
import { useMutation } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import { uuid } from '@/lib/uuid'
import { getOrCreateIdempotencyKey } from '../game-mutation'
import { useGameRuntime } from '../use-game-runtime'

/** 洞府立即完成 mutation 使用的參數。 */
interface CompleteRestMutationParams {
  /** 同一次操作與網路重試共用的冪等鍵。 */
  idempotencyKey: string
}

/** 將剩餘秒數轉成畫面用的分鐘數。 */
const secondsToMinutes = (seconds: number): number =>
  Math.max(0, Math.ceil(seconds / 60))

/** 洞府自然休養與立即完成的正式 API 頁面。 */
export function CavePage() {
  const { gameState, reloadGameState } = useGameRuntime()
  const { character, cave } = gameState
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const countdownSource = cave.minutesToFull
  const [countdown, setCountdown] = useState({
    source: countdownSource,
    seconds: cave.minutesToFull * 60,
  })
  const completeKeyRef = useRef<string | null>(null)

  if (countdown.source !== countdownSource) {
    setCountdown({
      source: countdownSource,
      seconds: cave.minutesToFull * 60,
    })
  }

  const remainingSeconds = countdown.seconds

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => ({
        ...current,
        seconds: Math.max(0, current.seconds - 1),
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [remainingSeconds])

  const completeMutation = useMutation(
    ({ idempotencyKey }: CompleteRestMutationParams) =>
      completeRestUsecase({ idempotencyKey }),
    {
      enableGlobalError: false,
      onSuccess: async (response) => {
        completeKeyRef.current = null
        setIsConfirmOpen(false)
        setErrorNotice(null)
        setNotice(
          `休養完成，已消耗 ${response.data.cost.toLocaleString()} 靈石。`,
        )
        await reloadGameState()
      },
      onError: (error) => {
        setErrorNotice(getApiClientError(error).message)
      },
    },
  )

  const isFull =
    character.health >= character.maxHealth &&
    character.spiritPower >= character.maxSpiritPower
  const hasEnoughStones =
    character.spiritStones >= cave.finishNowCost
  const canFinishNow =
    !isFull && hasEnoughStones && !completeMutation.isPending

  const closeConfirm = useCallback(() => {
    if (!completeMutation.isPending) {
      setIsConfirmOpen(false)
    }
  }, [completeMutation.isPending])

  /** 提交洞府立即完成，重試時沿用相同冪等鍵。 */
  const handleConfirmFinish = (): void => {
    if (!canFinishNow) {
      return
    }
    const idempotencyKey = getOrCreateIdempotencyKey(
      completeKeyRef.current,
      uuid,
    )
    completeKeyRef.current = idempotencyKey
    setNotice(null)
    setErrorNotice(null)
    completeMutation.mutate({ idempotencyKey })
  }

  return (
    <>
      <div className="grid gap-4">
        <Panel eyebrow="CAVE RECOVERY" title="洞府休養">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={isFull ? 'jade' : 'neutral'}>
              {isFull ? '生命與靈力已回滿' : '自然恢復中'}
            </StatusBadge>
            <StatusBadge tone="neutral">
              預計剩餘 {secondsToMinutes(remainingSeconds)} 分鐘
            </StatusBadge>
          </div>

          <div className="mt-6 grid gap-6">
            <ProgressBar
              label="生命"
              max={character.maxHealth}
              tone="cinnabar"
              value={character.health}
            />
            <ProgressBar
              label="靈力"
              max={character.maxSpiritPower}
              tone="jade"
              value={character.spiritPower}
            />
          </div>

          <p className="mt-5 rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm text-neutral-400">
            {isFull
              ? '目前不需要休養。'
              : '生命與靈力以後端狀態為準；倒數僅投影伺服器預估完成時間。'}
          </p>
        </Panel>

        <Panel eyebrow="FINISH NOW" title="立即完成">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">所需靈石</p>
              <p className="mt-1 font-serif text-3xl tabular-nums text-gold-100">
                {cave.finishNowCost.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                目前持有 {character.spiritStones.toLocaleString()} 靈石
              </p>
              {notice ? (
                <p
                  aria-live="polite"
                  className="mt-3 text-sm text-jade-100"
                  role="status"
                >
                  {notice}
                </p>
              ) : null}
              {errorNotice ? (
                <p
                  className="mt-3 text-sm text-cinnabar-100"
                  role="alert"
                >
                  {errorNotice}
                </p>
              ) : null}
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!canFinishNow}
              onClick={() => setIsConfirmOpen(true)}
              variant="secondary"
            >
              {isFull
                ? '已完全恢復'
                : hasEnoughStones
                  ? '立即完成休養'
                  : '靈石不足'}
            </Button>
          </div>
        </Panel>
      </div>

      <Modal
        isBusy={completeMutation.isPending}
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        title="確認立即完成"
      >
        <p>
          將消耗{' '}
          <strong className="text-gold-100">
            {cave.finishNowCost.toLocaleString()} 靈石
          </strong>
          ，生命與靈力由後端結算至上限。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            disabled={completeMutation.isPending}
            onClick={closeConfirm}
            variant="ghost"
          >
            取消
          </Button>
          <Button
            isLoading={completeMutation.isPending}
            onClick={handleConfirmFinish}
            variant="secondary"
          >
            確認完成
          </Button>
        </div>
      </Modal>
    </>
  )
}
