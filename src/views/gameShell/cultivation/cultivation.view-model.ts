import { useCallback, useState } from 'react'
import {
  breakthroughUsecase,
  claimCultivationUsecase,
  getBreakthroughPreviewUsecase,
  upgradeSpiritualRootUsecase,
} from '@/domain'
import type { BreakthroughParamsDto, BreakthroughChanceBreakdownDto } from '@/domain'
import { useGlobalErrorHandler } from '@/error'
import { useFetch, useGameMutation } from '@/hook'
import { useGameRuntime } from '@/containers'
import { getApiClientError } from '@/lib/axios'

/** 不需要額外 request body 的遊戲操作意圖。 */
type EmptyGameIntent = Record<string, never>

type CultivationModal = 'breakthroughConfirm' | 'breakthroughResult' | 'rootConfirm' | null

/** 突破率明細在畫面上的單一欄位。 */
export interface BreakthroughChanceRow {
  /** 穩定的畫面列表識別碼。 */
  id: keyof Omit<BreakthroughChanceBreakdownDto, 'unclamped' | 'final'>
  /** 成功率來源的中文名稱。 */
  label: string
  /** 後端回傳的原始百分點。 */
  value: number
  /** 基礎率不加正號、額外加成加正號的顯示文字。 */
  formattedValue: string
}

/** 突破率區塊使用的完整顯示模型。 */
export interface BreakthroughChancePresentation {
  /** 基礎率與五項額外加成的顯示資料。 */
  rows: BreakthroughChanceRow[]
  /** 後端套用上下限後實際使用的成功率。 */
  final: number
  /** 發生上限封頂時的說明；沒有封頂時為 null。 */
  limitMessage: string | null
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} 小時 ${remainingMinutes} 分`
}

const breakthroughReasonLabels: Record<string, string> = {
  BREAKTHROUGH_NOT_READY: '修為尚未圓滿',
  INSUFFICIENT_SPIRIT_STONES: '靈石不足',
  ITEM_NOT_OWNED: '未持有選用丹藥',
  V1_REALM_CAP_REACHED: '金丹內容尚未開放',
}

/** 突破率欄位的固定中文標籤。 */
const chanceLabels: Record<BreakthroughChanceRow['id'], string> = {
  base: '基礎',
  spiritualRoot: '靈根',
  luck: '氣運',
  pill: '丹藥',
  cultivationMethod: '功法',
  pity: '保底',
}

/**
 * 將後端突破率明細轉成不會誤解封頂規則的畫面模型。
 *
 * @param chance - 後端權威的成功率組成；尚未載入時可為空。
 * @returns 基礎率、額外加成、最終率與選用的封頂說明。
 *
 * 後端仍是成功率權威；前端只區分「基礎」與「加成」符號，
 * 並在 unclamped 大於 final 時揭露 95% 等規則上限。
 */
const createBreakthroughChancePresentation = (
  chance?: BreakthroughChanceBreakdownDto | null,
): BreakthroughChancePresentation => {
  const values = chance ?? {
    base: 0,
    spiritualRoot: 0,
    luck: 0,
    pill: 0,
    cultivationMethod: 0,
    pity: 0,
    unclamped: 0,
    final: 0,
  }
  const ids: BreakthroughChanceRow['id'][] = ['base', 'spiritualRoot', 'luck', 'pill', 'cultivationMethod', 'pity']

  return {
    rows: ids.map((id) => ({
      id,
      label: chanceLabels[id],
      value: values[id],
      formattedValue: id === 'base' ? `${values[id]}%` : `+${values[id]}%`,
    })),
    final: values.final,
    limitMessage: values.unclamped > values.final ? `加成合計 ${values.unclamped}%・成功率上限 ${values.final}%` : null,
  }
}

/** 管理修煉領取、突破預覽與靈根升級。 */
export function useCultivationViewModel() {
  const { gameState } = useGameRuntime()
  const [modal, setModal] = useState<CultivationModal>(null)
  const [lastBreakthroughResult, setLastBreakthroughResult] = useState<'success' | 'failure' | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [breakthroughNotice, setBreakthroughNotice] = useState<string | null>(null)
  const [selectedPillId, setSelectedPillId] = useState('')
  const [rootUpgradeNotice, setRootUpgradeNotice] = useState<string | null>(null)
  const [rootUpgradeError, setRootUpgradeError] = useState<string | null>(null)
  const { notifySuccess } = useGlobalErrorHandler()
  const { character, cultivationState } = gameState

  const breakthroughPreviewQuery = useFetch(
    getBreakthroughPreviewUsecase,
    {
      ...(selectedPillId ? { pillTemplateId: selectedPillId } : {}),
    },
    {
      queryKey: ['breakthrough-preview', selectedPillId],
      retry: 1,
      enableGlobalError: false,
    },
  )

  const claimMutation = useGameMutation<EmptyGameIntent, Awaited<ReturnType<typeof claimCultivationUsecase>>>({
    operation: 'claim-cultivation',
    request: (_intent, { idempotencyKey }) => claimCultivationUsecase({ idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setClaimError(null)
      notifySuccess(`已領取 ${response.data.awardedCultivation.toLocaleString()} 修為。`, {
        title: '修為領取成功',
      })
    },
    onError: (error) => {
      setClaimError(getApiClientError(error).message)
    },
  })
  const breakthroughMutation = useGameMutation<BreakthroughParamsDto, Awaited<ReturnType<typeof breakthroughUsecase>>>({
    operation: 'breakthrough',
    request: (intent, { idempotencyKey }) => breakthroughUsecase(intent, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setLastBreakthroughResult(response.data.succeeded ? 'success' : 'failure')
      setModal('breakthroughResult')
    },
    onError: (error) => {
      setBreakthroughNotice(getApiClientError(error).message)
    },
  })
  const rootUpgradeMutation = useGameMutation<EmptyGameIntent, Awaited<ReturnType<typeof upgradeSpiritualRootUsecase>>>(
    {
      operation: 'upgrade-spiritual-root',
      request: (_intent, { idempotencyKey }) => upgradeSpiritualRootUsecase({ idempotencyKey }),
      enableGlobalError: false,
      onSuccess: (response) => {
        setRootUpgradeError(null)
        setRootUpgradeNotice(
          `靈根已由 ${response.data.beforeQuality} 提升至 ${response.data.afterQuality}，消耗 ${response.data.consumedEssence.toLocaleString()} 靈根精華。`,
        )
        setModal(null)
      },
      synchronize: async () => {
        await breakthroughPreviewQuery.refetch()
      },
      onError: (error) => {
        setRootUpgradeError(getApiClientError(error).message)
      },
    },
  )

  const preview = breakthroughPreviewQuery.data?.data
  const chancePresentation = createBreakthroughChancePresentation(preview?.chance)
  const breakthroughPreviewError = breakthroughPreviewQuery.error
    ? getApiClientError(breakthroughPreviewQuery.error).message
    : null
  const isFoundationComplete = preview?.unavailableReasons.includes('V1_REALM_CAP_REACHED') ?? false
  const canBreakthrough = preview?.canAttempt === true && !breakthroughMutation.isPending
  const canClaim =
    cultivationState.claimableCultivation > 0 &&
    !gameState.isLoading &&
    !claimMutation.isPending &&
    !isFoundationComplete
  const canUpgradeRoot = cultivationState.canUpgradeRoot && !rootUpgradeMutation.isPending

  const missingBreakthroughRequirements =
    preview?.unavailableReasons.map((reason) => breakthroughReasonLabels[reason] ?? reason) ?? []

  const handleCloseModal = useCallback(() => {
    if (!rootUpgradeMutation.isPending && !breakthroughMutation.isPending) {
      setModal(null)
      breakthroughMutation.cancelIntent()
      rootUpgradeMutation.cancelIntent()
    }
  }, [breakthroughMutation, rootUpgradeMutation])

  const handleClaim = () => {
    if (!canClaim || rootUpgradeMutation.isPending || claimMutation.isPending) {
      return
    }

    setClaimError(null)
    claimMutation.execute({})
  }

  const handleConfirmBreakthrough = () => {
    if (!canBreakthrough || rootUpgradeMutation.isPending || breakthroughMutation.isPending) {
      return
    }

    setBreakthroughNotice(null)
    breakthroughMutation.execute(selectedPillId ? { pillTemplateId: selectedPillId } : {})
  }

  const handleConfirmRootUpgrade = () => {
    if (!canUpgradeRoot || rootUpgradeMutation.isPending) {
      return
    }

    setRootUpgradeNotice(null)
    setRootUpgradeError(null)
    rootUpgradeMutation.execute({})
  }

  return {
    /** 角色摘要 */
    character,
    /** 修煉狀態 */
    cultivationState,
    /** 可選突破丹藥 */
    breakthroughPills: gameState.pills.filter((pill) => pill.templateId.includes('breakthrough')),
    /** 目前開啟的 Modal*/
    modal,
    /** 最近一次突破結果 */
    lastBreakthroughResult,
    /** 領取修為錯誤 */
    claimError,
    /** 突破錯誤 */
    breakthroughNotice,
    /** 突破預覽載入錯誤 */
    breakthroughPreviewError,
    /** 選用的突破丹藥模板 ID*/
    selectedPillId,
    /** 靈根升級成功提示 */
    rootUpgradeNotice,
    /** 靈根升級錯誤 */
    rootUpgradeError,
    /** 突破成功率顯示模型 */
    chancePresentation,
    /** 突破靈石費用 */
    spiritStoneCost: preview?.spiritStoneCost ?? 0,
    /** 缺少的突破條件說明 */
    missingBreakthroughRequirements,
    /** 是否已達 V1 */
    isFoundationComplete,
    /** 是否可突破 */
    canBreakthrough,
    /** 是否可領取修為 */
    canClaim,
    /** 是否可提升靈根 */
    canUpgradeRoot,
    /** 領取修為請求是否進行中 */
    isClaimPending: claimMutation.isPending,
    /** 突破請求是否進行中 */
    isBreakthroughPending: breakthroughMutation.isPending,
    /** 靈根升級請求是否進行中 */
    isRootUpgradePending: rootUpgradeMutation.isPending,
    /** 放置累積時間顯示文字 */
    idleDurationLabel: formatDuration(cultivationState.idleMinutes),
    /** 關閉 Modal*/
    handleCloseModal,
    /** 開啟突破確認 */
    handleOpenBreakthroughConfirm: () => setModal('breakthroughConfirm'),
    /** 開啟靈根升級確認 */
    handleOpenRootConfirm: () => setModal('rootConfirm'),
    /** 更新選用丹藥 */
    handleSelectPill: setSelectedPillId,
    /** 領取修為 */
    handleClaim,
    /** 確認突破 */
    handleConfirmBreakthrough,
    /** 確認靈根升級 */
    handleConfirmRootUpgrade,
  }
}

export type ICultivationViewModel = ReturnType<typeof useCultivationViewModel>
