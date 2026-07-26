import {
  Button,
  Modal,
  Panel,
  ProgressBar,
  StatusBadge,
} from '@/components'
import { bind } from '@/utils'
import { useCaveViewModel, type ICaveViewModel } from './cave.view-model'

/** 呈現洞府自然休養與立即完成畫面。 */
export function caveViewController({
  character,
  cave,
  isConfirmOpen,
  notice,
  errorNotice,
  isHealthFull,
  isSpiritFull,
  isFull,
  hasEnoughStones,
  canFinishNow,
  isCompletePending,
  healthRemainingMinutes,
  spiritRemainingMinutes,
  handleOpenConfirm,
  handleCloseConfirm,
  handleConfirmFinish,
}: ICaveViewModel) {
  return (
    <>
      <div className="grid gap-4">
        <Panel eyebrow="CAVE RECOVERY" title="洞府休養">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={isFull ? 'jade' : 'neutral'}>
              {isFull ? '生命與靈力已回滿' : '自然恢復中'}
            </StatusBadge>
          </div>

          <div className="mt-6 grid gap-6">
            <div className="grid gap-2">
              <ProgressBar
                label="生命"
                max={character.maxHealth}
                tone="cinnabar"
                value={character.health}
              />
              <p className="flex flex-wrap justify-between gap-2 text-xs">
                <span className="text-neutral-500">
                  每分鐘恢復{' '}
                  {cave.healthRecoveryPercentPerMinute.toLocaleString()}%
                </span>
                <strong className="font-medium text-cinnabar-100">
                  {isHealthFull
                    ? '生命已回滿'
                    : `剩餘 ${healthRemainingMinutes} 分鐘`}
                </strong>
              </p>
            </div>
            <div className="grid gap-2">
              <ProgressBar
                label="靈力"
                max={character.maxSpiritPower}
                tone="jade"
                value={character.spiritPower}
              />
              <p className="flex flex-wrap justify-between gap-2 text-xs">
                <span className="text-neutral-500">
                  每分鐘恢復{' '}
                  {cave.spiritRecoveryPercentPerMinute.toLocaleString()}%
                </span>
                <strong className="font-medium text-jade-100">
                  {isSpiritFull
                    ? '靈力已回滿'
                    : `剩餘 ${spiritRemainingMinutes} 分鐘`}
                </strong>
              </p>
            </div>
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
                <p className="mt-3 text-sm text-cinnabar-100" role="alert">
                  {errorNotice}
                </p>
              ) : null}
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!canFinishNow}
              onClick={handleOpenConfirm}
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
        isBusy={isCompletePending}
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
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
            disabled={isCompletePending}
            onClick={handleCloseConfirm}
            variant="ghost"
          >
            取消
          </Button>
          <Button
            isLoading={isCompletePending}
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

export default bind(caveViewController, useCaveViewModel)
