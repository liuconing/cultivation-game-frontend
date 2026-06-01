type Resource = {
  label: string
  value: string
}

type ResourceBarProps = {
  resources: Resource[]
}

/**
 * 顯示玩家持有資源與全域操作入口。
 *
 * @param props - 要顯示的資源列表。
 */
export function ResourceBar({ resources }: ResourceBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl lg:ml-64 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {resources.map((resource) => (
            <div
              className="rounded-md border border-white/15 bg-neutral-950/50 px-4 py-2"
              key={resource.label}
            >
              <p className="text-xs text-neutral-500">{resource.label}</p>
              <p className="mt-1 text-sm text-neutral-100">{resource.value}</p>
            </div>
          ))}
        </div>
        <button
          aria-label="設定"
          className="grid size-10 place-items-center rounded-md border border-white/15 bg-transparent text-neutral-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          type="button"
        >
          ⚙
        </button>
      </div>
    </header>
  )
}
