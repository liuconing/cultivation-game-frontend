import { useEffect, useRef, type ReactNode } from 'react'

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

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const triggerElement = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      triggerElement?.focus()
    }
  }, [isBusy, isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-labelledby="foundation-modal-title"
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
          id="foundation-modal-title"
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
