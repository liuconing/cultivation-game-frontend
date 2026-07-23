import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  eyebrow?: string
  className?: string
  children: ReactNode
}

/**
 * 提供遊戲資訊卡片的共用外框樣式。
 *
 * @param props - 卡片標題、輔助標籤、外部樣式與內容。
 */
export function Panel({ title, eyebrow, className = '', children }: PanelProps) {
  return (
    <section
      className={`min-w-0 rounded-lg border border-white/12 bg-ink-900/75 p-4 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-5 ${className}`}
    >
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          {eyebrow ? (
            <p className="truncate text-xs tracking-[0.18em] text-gold-200/70">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="break-words font-serif text-xl text-neutral-100">
            {title}
          </h2>
        </div>
        <span className="h-px w-12 shrink-0 bg-gold-300/35" />
      </div>
      {children}
    </section>
  )
}
