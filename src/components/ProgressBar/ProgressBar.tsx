type ProgressBarProps = {
  label: string
  value: number
  max?: number
  tone?: 'jade' | 'cinnabar' | 'gold'
}

/**
 * 顯示百分比進度的共用狀態列。
 *
 * @param props - 進度標籤與百分比數值。
 */
export function ProgressBar({
  label,
  value,
  max = 100,
  tone = 'jade',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const toneClassNames = {
    jade: 'from-jade-700 via-jade-400 to-jade-200',
    cinnabar: 'from-cinnabar-700 via-cinnabar-400 to-cinnabar-200',
    gold: 'from-gold-700 via-gold-400 to-gold-200',
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="min-w-0 truncate text-neutral-400">{label}</span>
        <span className="ml-3 shrink-0 tabular-nums text-neutral-200">
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/40"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneClassNames[tone]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
