type ProgressBarProps = {
  label: string
  value: number
}

/**
 * 顯示百分比進度的共用狀態列。
 *
 * @param props - 進度標籤與百分比數值。
 */
export function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="text-neutral-200">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neutral-700 via-neutral-300 to-white"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
