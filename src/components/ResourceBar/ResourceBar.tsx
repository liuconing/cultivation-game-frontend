type Resource = {
  label: string
  value: string
  key: string
}

type ResourceBarProps = {
  resources: Resource[]
}

/** 顯示不因數值變化而推擠的資源列。 */
export function ResourceBar({ resources }: ResourceBarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/12 bg-ink-950/90 px-4 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 overflow-x-auto">
        {resources.map((resource) => (
          <div
            className="flex h-10 min-w-36 shrink-0 items-center justify-between gap-3 rounded-full border border-white/12 bg-white/[0.04] px-3 text-xs"
            key={resource.key}
          >
            <span className="truncate text-neutral-500">{resource.label}</span>
            <span className="shrink-0 tabular-nums text-neutral-100">
              {resource.value}
            </span>
          </div>
        ))}
      </div>
    </header>
  )
}
