import { useCallback, useEffect, useRef, useState } from 'react'
import { completeRestUsecase } from '@/domain'
import { getApiClientError } from '@/lib/axios'
import { useGameMutation } from '@/hook'
import { useGameRuntime } from '@/containers'

/** 洞府立即完成不需要額外 request body */
type CompleteRestIntent = Record<string, never>

/** 洞府畫面同步遞減的生命與靈力倒數 */
interface RecoveryCountdown {
  /** 用來辨識後端是否回傳新一輪休養預覽 */
  source: string
  /** 生命剩餘恢復秒數 */
  healthSeconds: number
  /** 靈力剩餘恢復秒數 */
  spiritSeconds: number
}

/** 將剩餘秒數轉成畫面用的分鐘數 */
const secondsToMinutes = (seconds: number): number => Math.max(0, Math.ceil(seconds / 60))

/** 管理洞府自然休養倒數與立即完成 API */
export function useCaveViewModel() {
  const { gameState, reloadGameState } = useGameRuntime()
  const { character, cave } = gameState
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const countdownSource = `${cave.healthFullyRestoredAt ?? 'health-full'}|${cave.spiritFullyRestoredAt ?? 'spirit-full'}`
  const [countdown, setCountdown] = useState<RecoveryCountdown>({
    source: countdownSource,
    healthSeconds: cave.healthSecondsToFull,
    spiritSeconds: cave.spiritSecondsToFull,
  })
  const syncedCountdownRef = useRef<string | null>(null)

  if (countdown.source !== countdownSource) {
    setCountdown({
      source: countdownSource,
      healthSeconds: cave.healthSecondsToFull,
      spiritSeconds: cave.spiritSecondsToFull,
    })
  }

  const healthRemainingSeconds = countdown.healthSeconds
  const spiritRemainingSeconds = countdown.spiritSeconds
  const hasRemainingRecovery = healthRemainingSeconds > 0 || spiritRemainingSeconds > 0

  useEffect(() => {
    if (!hasRemainingRecovery) {
      return
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => ({
        ...current,
        healthSeconds: Math.max(0, current.healthSeconds - 1),
        spiritSeconds: Math.max(0, current.spiritSeconds - 1),
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [hasRemainingRecovery])

  useEffect(() => {
    const characterNeedsSync =
      character.health < character.maxHealth || character.spiritPower < character.maxSpiritPower

    if (hasRemainingRecovery || !characterNeedsSync || syncedCountdownRef.current === countdown.source) {
      return
    }

    syncedCountdownRef.current = countdown.source
    void reloadGameState()
  }, [
    character.health,
    character.maxHealth,
    character.maxSpiritPower,
    character.spiritPower,
    countdown.source,
    hasRemainingRecovery,
    reloadGameState,
  ])

  const completeMutation = useGameMutation<CompleteRestIntent, Awaited<ReturnType<typeof completeRestUsecase>>>({
    operation: 'complete-rest',
    request: (_intent, { idempotencyKey }) => completeRestUsecase({ idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setIsConfirmOpen(false)
      setErrorNotice(null)
      setNotice(`休養完成，已消耗 ${response.data.cost.toLocaleString()} 靈石`)
    },
    onError: (error) => {
      setErrorNotice(getApiClientError(error).message)
    },
  })

  const isHealthFull = healthRemainingSeconds === 0
  const isSpiritFull = spiritRemainingSeconds === 0
  const isFull = isHealthFull && isSpiritFull
  const hasEnoughStones = character.spiritStones >= cave.finishNowCost
  const canFinishNow = !isFull && hasEnoughStones && !completeMutation.isPending

  const handleCloseConfirm = useCallback(() => {
    if (!completeMutation.isPending) {
      setIsConfirmOpen(false)
      completeMutation.cancelIntent()
    }
  }, [completeMutation])

  const handleOpenConfirm = (): void => {
    setIsConfirmOpen(true)
  }

  /** 提交洞府立即完成，重試時沿用相同冪等鍵 */
  const handleConfirmFinish = (): void => {
    if (!canFinishNow) {
      return
    }
    setNotice(null)
    setErrorNotice(null)
    completeMutation.execute({})
  }

  return {
    /** 角色摘要 */
    character,
    /** 洞府休養預覽 */
    cave,
    /** 是否開啟立即完成確認 Modal */
    isConfirmOpen,
    /** 成功提示 */
    notice,
    /** 錯誤提示 */
    errorNotice,
    /** 生命是否已回滿 */
    isHealthFull,
    /** 靈力是否已回滿 */
    isSpiritFull,
    /** 生命與靈力是否皆已回滿 */
    isFull,
    /** 靈石是否足夠立即完成 */
    hasEnoughStones,
    /** 是否可送出立即完成 */
    canFinishNow,
    /** 立即完成請求是否進行中 */
    isCompletePending: completeMutation.isPending,
    /** 生命剩餘分鐘數（畫面顯示用） */
    healthRemainingMinutes: secondsToMinutes(healthRemainingSeconds),
    /** 靈力剩餘分鐘數（畫面顯示用） */
    spiritRemainingMinutes: secondsToMinutes(spiritRemainingSeconds),
    /** 開啟立即完成確認 */
    handleOpenConfirm,
    /** 關閉立即完成確認 */
    handleCloseConfirm,
    /** 確認立即完成休養 */
    handleConfirmFinish,
  }
}

export type ICaveViewModel = ReturnType<typeof useCaveViewModel>
