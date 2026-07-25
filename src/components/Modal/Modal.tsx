import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'

/** Modal 支援的版面配置。 */
export type ModalLayout = 'dialog' | 'fullscreen'

/** 共用 Modal 對外公開的屬性。 */
export interface ModalProps {
  /** 彈窗主要內容。 */
  children: ReactNode
  /** 輔助技術與畫面標頭共用的標題。 */
  title: string
  /** 是否顯示彈窗。 */
  isOpen: boolean
  /** 是否正在執行不可中斷操作；為 true 時禁止關閉。 */
  isBusy?: boolean
  /** 一般置中彈窗或沉浸式全螢幕版面。 */
  layout?: ModalLayout
  /** 全螢幕標題上方的英文情境標籤。 */
  eyebrow?: string
  /** 標題右側的狀態或操作元件。 */
  headerAccessory?: ReactNode
  /** Escape、遮罩或頁面按鈕要求關閉時的 callback。 */
  onClose: () => void
  /** 非同步操作使原按鈕失焦時，明確指定關閉後的焦點目標。 */
  returnFocusRef?: RefObject<HTMLElement | null>
}

/** Modal 內可接受鍵盤焦點的元素選擇器。 */
const focusableElementSelector =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 在 Modal 內循環 Tab 焦點，避免鍵盤操作落到背景頁面。
 *
 * @param event - 文件層收到的鍵盤事件。
 * @param dialog - 目前顯示的 Modal 容器。
 */
const trapDialogFocus = (
  event: KeyboardEvent,
  dialog: HTMLDivElement,
): void => {
  if (event.key !== 'Tab') {
    return
  }

  const focusableElements = Array.from(
    dialog.querySelectorAll<HTMLElement>(focusableElementSelector),
  )
  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)

  if (!firstElement || !lastElement) {
    event.preventDefault()
    dialog.focus()
  } else if (
    event.shiftKey &&
    (document.activeElement === firstElement ||
      document.activeElement === dialog)
  ) {
    event.preventDefault()
    lastElement.focus()
  } else if (
    !event.shiftKey &&
    document.activeElement === lastElement
  ) {
    event.preventDefault()
    firstElement.focus()
  }
}

/**
 * 顯示統一管理 Escape、焦點圈定、body lock 與焦點還原的彈窗。
 *
 * @param props - 內容、標題、開關狀態與版面設定。
 * @returns 關閉時為 null，開啟時為可存取的 dialog。
 *
 * `fullscreen` 只改變外觀與內容尺寸，關閉與焦點生命週期仍與既有
 * `dialog` 相同，因此原有確認彈窗不需改動。
 */
export function Modal({
  children,
  title,
  isOpen,
  isBusy = false,
  layout = 'dialog',
  eyebrow,
  headerAccessory,
  onClose,
  returnFocusRef,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  const isBusyRef = useRef(isBusy)

  useEffect(() => {
    onCloseRef.current = onClose
    isBusyRef.current = isBusy
  }, [isBusy, onClose])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const triggerElement =
      returnFocusRef?.current ??
      (document.activeElement as HTMLElement | null)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    /** 處理 Escape 關閉與 Tab 焦點圈定。 */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isBusyRef.current) {
        onCloseRef.current()
        return
      }

      if (dialogRef.current) {
        trapDialogFocus(event, dialogRef.current)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      triggerElement?.focus()
    }
  }, [isOpen, returnFocusRef])

  if (!isOpen) {
    return null
  }

  /**
   * 只有直接點擊遮罩才關閉，避免內容區事件冒泡誤關彈窗。
   *
   * @param event - 遮罩收到的滑鼠事件。
   */
  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ): void => {
    if (
      event.target === event.currentTarget &&
      !isBusyRef.current
    ) {
      onCloseRef.current()
    }
  }

  const isFullscreen = layout === 'fullscreen'

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-y-auto bg-ink-950/98 p-3 backdrop-blur-xl sm:p-5 lg:overflow-hidden'
          : 'fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm'
      }
      onMouseDown={handleBackdropClick}
      role="dialog"
    >
      <div
        className={
          isFullscreen
            ? 'mx-auto flex min-h-full w-full max-w-5xl flex-col rounded-lg border border-white/10 bg-ink-950/70 p-3 shadow-2xl shadow-black/50 outline-none sm:p-5 lg:h-full lg:min-h-0'
            : 'w-full max-w-md rounded-lg border border-white/16 bg-ink-900 p-5 shadow-2xl shadow-black/60 outline-none sm:p-6'
        }
        ref={dialogRef}
        tabIndex={-1}
      >
        <header
          className={
            isFullscreen
              ? 'flex min-w-0 items-start justify-between gap-3 border-b border-white/12 pb-4'
              : 'flex min-w-0 items-start justify-between gap-3'
          }
        >
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs tracking-[0.2em] text-gold-200/65">
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={`break-words font-serif text-neutral-100 ${
                isFullscreen
                  ? eyebrow
                    ? 'mt-1 text-2xl'
                    : 'text-2xl'
                  : 'text-xl'
              }`}
              id={titleId}
            >
              {title}
            </h2>
          </div>
          {headerAccessory}
        </header>
        <div
          className={
            isFullscreen
              ? 'flex min-h-0 flex-1 flex-col text-sm leading-7 text-neutral-300'
              : 'mt-4 text-sm leading-7 text-neutral-300'
          }
        >
          {children}
        </div>
      </div>
    </div>
  )
}
