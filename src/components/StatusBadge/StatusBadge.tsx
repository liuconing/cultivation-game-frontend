import type { ReactNode } from 'react'

type StatusTone = 'neutral' | 'jade' | 'cinnabar' | 'gold'

type StatusBadgeProps = {
  children: ReactNode
  tone?: StatusTone
}

const toneClassNames: Record<StatusTone, string> = {
  neutral: 'border-white/12 bg-white/[0.04] text-neutral-300',
  jade: 'border-jade-400/35 bg-jade-400/10 text-jade-100',
  cinnabar:
    'border-cinnabar-400/35 bg-cinnabar-400/10 text-cinnabar-100',
  gold: 'border-gold-400/35 bg-gold-400/10 text-gold-100',
}

/** 顯示固定高度且不受長文字影響的狀態標籤。 */
export function StatusBadge({
  children,
  tone = 'neutral',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-7 max-w-full items-center rounded-full border px-2.5 text-xs ${toneClassNames[tone]}`}
    >
      <span className="truncate">{children}</span>
    </span>
  )
}
