type SidebarProps = {
  items: string[]
}

/** 顯示桌面側欄使用的固定尺寸導覽。 */
export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-white/10 bg-ink-950/85 p-5">
      <p className="text-xs tracking-[0.2em] text-gold-200/60">問仙</p>
      <nav aria-label="展示導覽" className="mt-6 grid gap-2">
        {items.map((item, index) => (
          <button
            className={`min-h-11 truncate rounded-md border px-4 text-left text-sm focus-visible:outline-2 focus-visible:outline-jade-300 ${
              index === 0
                ? 'border-jade-400/30 bg-jade-400/10 text-jade-100'
                : 'border-transparent text-neutral-400 hover:bg-white/[0.05]'
            }`}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}
