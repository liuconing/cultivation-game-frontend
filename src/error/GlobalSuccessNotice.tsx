import { FaTimes } from 'react-icons/fa'

/** 全站成功通知所需的顯示資料。 */
interface GlobalSuccessNoticeProps {
  /** 通知標題。 */
  title: string
  /** 通知內容。 */
  message: string
  /** 關閉目前通知。 */
  onClose: () => void
}

/**
 * 在畫面頂部顯示不阻擋操作的成功通知。
 *
 * @param props - 成功通知內容與關閉操作。
 */
export function GlobalSuccessNotice({
  title,
  message,
  onClose,
}: GlobalSuccessNoticeProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center p-3 sm:p-4"
    >
      <div
        className="pointer-events-auto flex w-full max-w-xl items-start justify-between gap-4 rounded-lg border border-jade-400/40 bg-ink-900/98 px-4 py-3 text-jade-100 shadow-2xl shadow-black/60 backdrop-blur-xl"
        role="status"
      >
        <div className="min-w-0">
          <p className="font-medium text-neutral-100">{title}</p>
          <p className="mt-1 break-words text-sm leading-6 text-jade-100/90">
            {message}
          </p>
        </div>
        <button
          aria-label="關閉成功通知"
          className="grid size-10 shrink-0 place-items-center rounded-md border border-white/12 text-neutral-300 transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-jade-300"
          onClick={onClose}
          title="關閉"
          type="button"
        >
          <FaTimes aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
