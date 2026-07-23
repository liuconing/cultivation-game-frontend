import { useEffect, useId, useRef, type ReactNode } from 'react'

type DrawerProps = {
  children: ReactNode
  title: string
  isOpen: boolean
  isBusy?: boolean
  onClose: () => void
}

/** 顯示不超出 viewport 的側邊資訊抽屜。 */
export function Drawer({
  children,
  title,
  isOpen,
  isBusy = false,
  onClose,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
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
    drawerRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusyRef.current) {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        drawerRef.current?.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          document.activeElement === drawerRef.current)
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
      className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm"
      onClick={(event) => {
        if (
          event.target === event.currentTarget &&
          !isBusyRef.current
        ) {
          onCloseRef.current()
        }
      }}
      role="dialog"
    >
      <div
        className="h-dvh w-full max-w-md overflow-y-auto border-l border-white/16 bg-ink-900 p-5 shadow-2xl shadow-black/60 outline-none sm:p-6"
        ref={drawerRef}
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
