import { Button, Modal, Panel, ProgressBar, StatusBadge } from '@/components'
import { bind } from '@/utils'
import { useCultivationViewModel, type ICultivationViewModel } from './cultivation.view-model'

/** 呈現修煉、突破與靈根成長畫面。 */
export function cultivationViewController({
  character,
  cultivationState,
  breakthroughPills,
  modal,
  lastBreakthroughResult,
  claimError,
  breakthroughNotice,
  breakthroughPreviewError,
  selectedPillId,
  rootUpgradeNotice,
  rootUpgradeError,
  chancePresentation,
  spiritStoneCost,
  missingBreakthroughRequirements,
  isFoundationComplete,
  canBreakthrough,
  canClaim,
  canUpgradeRoot,
  isClaimPending,
  isBreakthroughPending,
  isRootUpgradePending,
  idleDurationLabel,
  handleCloseModal,
  handleOpenBreakthroughConfirm,
  handleOpenRootConfirm,
  handleSelectPill,
  handleClaim,
  handleConfirmBreakthrough,
  handleConfirmRootUpgrade,
}: ICultivationViewModel) {
  return (
    <>
      <div className='grid gap-4'>
        <Panel eyebrow='IDLE CULTIVATION' title='放置修煉'>
          <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end'>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <StatusBadge tone='jade'>累積 {idleDurationLabel}</StatusBadge>
                <StatusBadge tone='neutral'>上限 {cultivationState.idleCapMinutes / 60} 小時</StatusBadge>
              </div>

              <p className='mt-5 text-xs text-neutral-500'>可領取修為</p>
              <p className='mt-1 break-words font-serif text-3xl tabular-nums text-gold-100'>
                {cultivationState.claimableCultivation.toLocaleString()}
              </p>
              <p className='mt-2 text-xs leading-6 text-neutral-500'>
                基礎每小時 {cultivationState.baseCultivationPerHour.toLocaleString()}・
                {cultivationState.equippedMethodName
                  ? `${cultivationState.equippedMethodName} × ${cultivationState.methodMultiplier}`
                  : '未裝備功法 × 1'}
              </p>
              {claimError ? (
                <p className='mt-3 text-sm text-cinnabar-100' role='alert'>
                  {claimError}
                </p>
              ) : null}
            </div>

            <Button className='w-full sm:w-auto' disabled={!canClaim} isLoading={isClaimPending} onClick={handleClaim}>
              領取修為
            </Button>
          </div>
        </Panel>

        <Panel eyebrow='REALM PROGRESS' title='境界與突破'>
          <div className='grid gap-5'>
            <ProgressBar
              label={`${character.realm}・${character.minorRealm}`}
              max={character.cultivationTarget}
              tone='gold'
              value={character.cultivation}
            />

            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {chancePresentation.rows.map((row) => (
                <div className='min-w-0 rounded-md border border-white/10 bg-black/15 p-3' key={row.id}>
                  <p className='truncate text-xs text-neutral-600'>{row.label}</p>
                  <p className='mt-1 tabular-nums text-neutral-200'>{row.formattedValue}</p>
                </div>
              ))}
            </div>

            <div className='flex flex-col gap-3 rounded-md border border-gold-400/20 bg-gold-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-xs text-neutral-500'>最終成功率</p>
                <p className='mt-1 font-serif text-3xl tabular-nums text-gold-100'>{chancePresentation.final}%</p>
                {chancePresentation.limitMessage ? (
                  <p className='mt-1 text-xs text-gold-100'>{chancePresentation.limitMessage}</p>
                ) : null}
                <p className='mt-1 text-xs text-neutral-600'>
                  費用 {spiritStoneCost.toLocaleString()} 靈石・保底第 {cultivationState.pity} 次
                </p>
                <label className='mt-3 block text-xs text-neutral-500'>
                  突破丹藥
                  <select
                    className='mt-1 min-h-10 w-full rounded-md border border-white/12 bg-ink-950 px-3 text-sm text-neutral-200 focus-visible:outline-2 focus-visible:outline-jade-300'
                    disabled={isBreakthroughPending}
                    onChange={(event) => handleSelectPill(event.target.value)}
                    value={selectedPillId}
                  >
                    <option value=''>不使用丹藥</option>
                    {breakthroughPills.map((pill) => (
                      <option key={pill.templateId} value={pill.templateId}>
                        {pill.name}（{pill.quantity}）
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Button
                className='w-full sm:w-auto'
                disabled={!canBreakthrough}
                onClick={handleOpenBreakthroughConfirm}
                variant='secondary'
              >
                {isFoundationComplete ? '金丹內容開發中' : '準備突破'}
              </Button>
            </div>

            {missingBreakthroughRequirements.length > 0 ? (
              <ul className='grid gap-1 text-xs text-cinnabar-100'>
                {missingBreakthroughRequirements.map((requirement) => (
                  <li key={requirement}>・{requirement}</li>
                ))}
              </ul>
            ) : null}
            {breakthroughNotice ? (
              <p className='text-xs text-cinnabar-100' role='alert'>
                {breakthroughNotice}
              </p>
            ) : null}
            {breakthroughPreviewError ? (
              <p className='text-xs text-cinnabar-100' role='alert'>
                {breakthroughPreviewError}
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel eyebrow='SPIRITUAL ROOT' title='靈根成長'>
          <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
            <div className='min-w-0'>
              <p className='text-sm text-neutral-300'>
                {character.spiritualRoot}・<span className='text-gold-100'>{character.spiritualRootQuality}</span>
                {cultivationState.nextRootQuality ? (
                  <>
                    <span className='mx-2 text-neutral-600'>→</span>
                    <span className='text-jade-100'>{cultivationState.nextRootQuality}</span>
                  </>
                ) : null}
              </p>
              <p className='mt-3 text-xs text-neutral-500'>
                靈根精華{' '}
                <span className='tabular-nums text-neutral-200'>
                  {cultivationState.rootEssence.toLocaleString()}／{cultivationState.rootUpgradeCost.toLocaleString()}
                </span>
              </p>
            </div>
            <Button className='w-full sm:w-auto' disabled={!canUpgradeRoot} onClick={handleOpenRootConfirm}>
              {cultivationState.nextRootQuality ? '提升靈根' : '已達天品'}
            </Button>
          </div>
          {rootUpgradeNotice ? (
            <p aria-live='polite' className='mt-3 text-sm text-jade-100' role='status'>
              {rootUpgradeNotice}
            </p>
          ) : null}
          {rootUpgradeError ? (
            <p className='mt-3 text-sm text-cinnabar-100' role='alert'>
              {rootUpgradeError}
            </p>
          ) : null}
          {!cultivationState.canUpgradeRoot && cultivationState.rootUpgradeUnavailableReason ? (
            <p className='mt-3 text-xs text-cinnabar-100'>{cultivationState.rootUpgradeUnavailableReason}</p>
          ) : null}
        </Panel>
      </div>

      <Modal
        isBusy={isRootUpgradePending || isBreakthroughPending}
        isOpen={modal === 'breakthroughConfirm'}
        onClose={handleCloseModal}
        title='確認突破'
      >
        <p>
          將消耗 <strong className='text-gold-100'>{spiritStoneCost.toLocaleString()} 靈石</strong>
          ，以 {chancePresentation.final}% 成功率突破。
        </p>
        <dl className='mt-4 grid grid-cols-2 gap-2'>
          {[
            ['境界', `${character.realm}・${character.minorRealm}`],
            ['保底', `第 ${cultivationState.pity} 次`],
            ['功法', cultivationState.equippedMethodName ?? '未裝備'],
            ['丹藥', selectedPillId || '不使用'],
          ].map(([label, value]) => (
            <div className='min-w-0 rounded border border-white/10 bg-black/20 p-3' key={label}>
              <dt className='text-xs text-neutral-600'>{label}</dt>
              <dd className='mt-1 break-words text-neutral-200'>{value}</dd>
            </div>
          ))}
        </dl>
        <div className='mt-5 grid grid-cols-2 gap-2'>
          <Button disabled={isRootUpgradePending || isBreakthroughPending} onClick={handleCloseModal} variant='ghost'>
            取消
          </Button>
          <Button isLoading={isBreakthroughPending} onClick={handleConfirmBreakthrough} variant='secondary'>
            確認突破
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modal === 'breakthroughResult'}
        onClose={handleCloseModal}
        title={lastBreakthroughResult === 'success' ? '突破成功' : '突破失敗'}
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
        <Button className='mt-5 w-full' onClick={handleCloseModal}>
          返回修煉
        </Button>
      </Modal>

      <Modal
        isBusy={isRootUpgradePending}
        isOpen={modal === 'rootConfirm'}
        onClose={handleCloseModal}
        title='確認提升靈根'
      >
        <p>
          {character.spiritualRootQuality}
          <span className='mx-2 text-neutral-600'>→</span>
          <strong className='text-jade-100'>{cultivationState.nextRootQuality}</strong>
        </p>
        <p className='mt-3 text-neutral-400'>
          將消耗 {cultivationState.rootUpgradeCost.toLocaleString()} 靈根精華，提升後不可復原。
        </p>
        <div className='mt-5 grid grid-cols-2 gap-2'>
          <Button disabled={isRootUpgradePending} onClick={handleCloseModal} variant='ghost'>
            取消
          </Button>
          <Button isLoading={isRootUpgradePending} onClick={handleConfirmRootUpgrade}>
            確認提升
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default bind(cultivationViewController, useCultivationViewModel)
