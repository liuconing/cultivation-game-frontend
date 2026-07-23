import { useEffect, useId, useRef, type ReactNode } from 'react'

type ModalProps = {
  children: ReactNode
  title: string
  isOpen: boolean
  isBusy?: boolean
  onClose: () => void
}

/** 顯示具焦點移入、Escape 關閉與焦點還原的確認彈窗。 */
export function Modal({
  children,
  title,
  isOpen,
  isBusy = false,
  onClose,
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

    const triggerElement = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusyRef.current) {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        dialogRef.current?.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          document.activeElement === dialogRef.current)
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

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      triggerElement?.focus()
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-lg border border-white/16 bg-ink-900 p-5 shadow-2xl shadow-black/60 outline-none sm:p-6"
        ref={dialogRef}
        tabIndex={-1}
      >
        <h2
          className="font-serif text-xl text-neutral-100"
          id={titleId}
        >
          {title}
        </h2>
        <div className="mt-4 text-sm leading-7 text-neutral-300">
          {children}
        </div>
      </div>
    </div>
  )
}
