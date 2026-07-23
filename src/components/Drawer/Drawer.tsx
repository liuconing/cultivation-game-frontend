import { useEffect, useRef, type ReactNode } from 'react'

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

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const triggerElement = document.activeElement as HTMLElement | null
    drawerRef.current?.focus()

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
      aria-labelledby="foundation-drawer-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm"
      role="dialog"
    >
      <div
        className="h-dvh w-full max-w-md overflow-y-auto border-l border-white/16 bg-ink-900 p-5 shadow-2xl shadow-black/60 outline-none sm:p-6"
        ref={drawerRef}
        tabIndex={-1}
      >
        <h2
          className="font-serif text-xl text-neutral-100"
          id="foundation-drawer-title"
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
