import type { GlobalErrorNotice as GlobalErrorNoticeData } from './global-error'

/** 全域錯誤通知元件的輸入。 */
interface GlobalErrorNoticeProps {
  /** 要顯示的共通錯誤資料。 */
  error: GlobalErrorNoticeData
  /** 使用者關閉通知時執行的操作。 */
  onClose: () => void
}

/**
 * 顯示不阻塞頁面操作的頂部全域錯誤通知。
 *
 * @param props - 錯誤資料與關閉操作。
 */
export function GlobalErrorNotice({
  error,
  onClose,
}: GlobalErrorNoticeProps) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center p-3 sm:p-4"
    >
      <div
        className="pointer-events-auto flex w-full max-w-xl items-start justify-between gap-4 rounded-lg border border-cinnabar-400/40 bg-ink-900/98 px-4 py-3 text-cinnabar-100 shadow-2xl shadow-black/60 backdrop-blur-xl"
        role="alert"
      >
        <div className="min-w-0">
          <p className="font-medium text-neutral-100">{error.title}</p>
          <p className="mt-1 break-words text-sm leading-6 text-cinnabar-100/90">
            {error.message}
          </p>
          {error.code ? (
            <p className="mt-1 font-mono text-[0.65rem] text-neutral-600">
              {error.code}
            </p>
          ) : null}
        </div>
        <button
          aria-label="關閉全域錯誤通知"
          className="min-h-10 shrink-0 rounded-md border border-white/12 px-3 text-sm text-neutral-300 transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-jade-300"
          onClick={onClose}
          type="button"
        >
          關閉
        </button>
      </div>
    </div>
  )
}
