import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Modal,
  Panel,
  ProgressBar,
  StatusBadge,
} from '@/components'
import { useMockGameStore } from '@/stores'

type CaveModal = 'confirm' | 'success' | null

/** UI-08 洞府休養、本地計時預覽與立即完成 Mock。 */
export function CaveMock() {
  const gameState = useMockGameStore((state) => state.gameState)
  const completeCaveRecovery = useMockGameStore(
    (state) => state.completeCaveRecovery,
  )
  const { character, cave } = gameState
  const previewSource = `${gameState.scenario}:${character.health}:${character.spiritPower}`
  const [preview, setPreview] = useState({
    source: previewSource,
    health: character.health,
    spirit: character.spiritPower,
    minutes: 0,
  })
  const [modal, setModal] = useState<CaveModal>(null)
  const [isBusy, setIsBusy] = useState(false)

  if (preview.source !== previewSource) {
    setPreview({
      source: previewSource,
      health: character.health,
      spirit: character.spiritPower,
      minutes: 0,
    })
  }

  const previewHealth = preview.health
  const previewSpirit = preview.spirit
  const previewMinutes = preview.minutes

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPreview((current) => ({
        ...current,
        health: Math.min(
          character.maxHealth,
          current.health +
            Math.ceil(
              character.maxHealth *
                (cave.recoveryPercentPerMinute / 100),
            ),
        ),
        spirit: Math.min(
          character.maxSpiritPower,
          current.spirit +
            Math.ceil(
              character.maxSpiritPower *
                (cave.recoveryPercentPerMinute / 100),
            ),
        ),
        minutes: Math.min(cave.minutesToFull, current.minutes + 1),
      }))
    }, 1200)

    return () => window.clearInterval(timer)
  }, [
    cave.recoveryPercentPerMinute,
    cave.minutesToFull,
    character.health,
    character.maxHealth,
    character.maxSpiritPower,
    character.spiritPower,
  ])

  const estimatedMinutesToFull = useMemo(() => {
    const healthPercentMissing =
      ((character.maxHealth - previewHealth) / character.maxHealth) *
      100
    const spiritPercentMissing =
      ((character.maxSpiritPower - previewSpirit) /
        character.maxSpiritPower) *
      100
    return Math.max(
      0,
      Math.ceil(
        Math.max(healthPercentMissing, spiritPercentMissing) /
          cave.recoveryPercentPerMinute,
      ),
    )
  }, [
    cave.recoveryPercentPerMinute,
    character.maxHealth,
    character.maxSpiritPower,
    previewHealth,
    previewSpirit,
  ])

  const isFull =
    previewHealth >= character.maxHealth &&
    previewSpirit >= character.maxSpiritPower
  const hasEnoughStones =
    character.spiritStones >= cave.finishNowCost
  const canFinishNow = !isFull && hasEnoughStones

  const closeModal = useCallback(() => {
    if (!isBusy) {
      setModal(null)
    }
  }, [isBusy])

  const handleConfirmFinish = () => {
    if (!canFinishNow || isBusy) {
      return
    }

    setIsBusy(true)
    window.setTimeout(() => {
      completeCaveRecovery()
      setIsBusy(false)
      setModal('success')
    }, 500)
  }

  return (
    <>
      <div className="grid gap-4">
        <Panel eyebrow="UI-08・CAVE RECOVERY" title="洞府休養">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="jade">
              每分鐘恢復最大值 {cave.recoveryPercentPerMinute}%
            </StatusBadge>
            <StatusBadge tone="neutral">
              Mock 預覽第 {previewMinutes} 分鐘
            </StatusBadge>
          </div>

          <div className="mt-6 grid gap-6">
            <ProgressBar
              label="生命"
              max={character.maxHealth}
              tone="cinnabar"
              value={previewHealth}
            />
            <ProgressBar
              label="靈力"
              max={character.maxSpiritPower}
              tone="jade"
              value={previewSpirit}
            />
          </div>

          <p
            aria-live="polite"
            className="mt-5 rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm text-neutral-400"
            role="status"
          >
            {isFull
              ? '生命與靈力皆已回滿。'
              : `預估再 ${estimatedMinutesToFull} 分鐘完全恢復。`}
          </p>

          <p className="mt-3 text-xs leading-6 text-neutral-600">
            畫面每 1.2 秒模擬一分鐘，僅供 UI 預覽；正式結算仍以後端時間為準。
          </p>
        </Panel>

        <Panel eyebrow="FINISH NOW" title="立即完成">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">所需費用</p>
              <p className="mt-1 font-serif text-3xl tabular-nums text-gold-100">
                {cave.finishNowCost.toLocaleString()}
                <span className="ml-2 text-sm text-neutral-500">靈石</span>
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                目前持有 {character.spiritStones.toLocaleString()} 靈石
              </p>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!canFinishNow}
              onClick={() => setModal('confirm')}
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
        isBusy={isBusy}
        isOpen={modal === 'confirm'}
        onClose={closeModal}
        title="確認立即完成"
      >
        <p>
          消耗{' '}
          <strong className="text-gold-100">
            {cave.finishNowCost.toLocaleString()} 靈石
          </strong>
          ，立即將生命與靈力恢復至上限。
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded border border-white/10 bg-black/20 p-3">
            <dt className="text-xs text-neutral-600">生命</dt>
            <dd className="mt-1 tabular-nums text-neutral-200">
              {previewHealth.toLocaleString()} →{' '}
              {character.maxHealth.toLocaleString()}
            </dd>
          </div>
          <div className="rounded border border-white/10 bg-black/20 p-3">
            <dt className="text-xs text-neutral-600">靈力</dt>
            <dd className="mt-1 tabular-nums text-neutral-200">
              {previewSpirit.toLocaleString()} →{' '}
              {character.maxSpiritPower.toLocaleString()}
            </dd>
          </div>
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button disabled={isBusy} onClick={closeModal} variant="ghost">
            取消
          </Button>
          <Button
            isLoading={isBusy}
            onClick={handleConfirmFinish}
            variant="secondary"
          >
            確認支付
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modal === 'success'}
        onClose={closeModal}
        title="休養完成"
      >
        <div className="rounded-md border border-jade-400/25 bg-jade-400/[0.08] p-4 text-jade-100">
          洞府靈氣流轉，生命與靈力已恢復至上限。
        </div>
        <Button className="mt-5 w-full" onClick={closeModal}>
          返回洞府
        </Button>
      </Modal>
    </>
  )
}
