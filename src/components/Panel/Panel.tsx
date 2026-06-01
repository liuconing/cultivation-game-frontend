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
      className={`rounded-lg border border-white/15 bg-neutral-950/55 p-5 shadow-2xl shadow-black/25 backdrop-blur-md ${className}`}
    >
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          {eyebrow ? (
            <p className="text-xs text-neutral-500">{eyebrow}</p>
          ) : null}
          <h2 className="font-serif text-xl text-neutral-100">{title}</h2>
        </div>
        <span className="h-px w-12 bg-white/20" />
      </div>
      {children}
    </section>
  )
}
