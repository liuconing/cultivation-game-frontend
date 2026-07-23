type TabOption<T extends string> = {
  value: T
  label: string
}

type TabsProps<T extends string> = {
  label: string
  options: Array<TabOption<T>>
  value: T
  onChange: (value: T) => void
}

/** 提供可鍵盤操作且尺寸穩定的頁籤控制。 */
export function Tabs<T extends string>({
  label,
  options,
  value,
  onChange,
}: TabsProps<T>) {
  return (
    <div
      aria-label={label}
      className="flex max-w-full gap-1 overflow-x-auto rounded-md border border-white/12 bg-black/25 p-1"
      role="tablist"
    >
      {options.map((option) => (
        <button
          aria-selected={value === option.value}
          className={`min-h-10 min-w-24 shrink-0 rounded px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-300 ${
            value === option.value
              ? 'bg-jade-400/14 text-jade-100'
              : 'text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200'
          }`}
          key={option.value}
          onKeyDown={(event) => {
            if (
              event.key !== 'ArrowRight' &&
              event.key !== 'ArrowLeft' &&
              event.key !== 'Home' &&
              event.key !== 'End'
            ) {
              return
            }

            event.preventDefault()
            const tabs = Array.from(
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                '[role="tab"]',
              ) ?? [],
            )
            const currentIndex = tabs.indexOf(event.currentTarget)
            const nextIndex =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? tabs.length - 1
                  : event.key === 'ArrowRight'
                    ? (currentIndex + 1) % tabs.length
                    : (currentIndex - 1 + tabs.length) % tabs.length
            tabs[nextIndex]?.focus()
            tabs[nextIndex]?.click()
          }}
          onClick={() => {
            onChange(option.value)
          }}
          role="tab"
          tabIndex={value === option.value ? 0 : -1}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
