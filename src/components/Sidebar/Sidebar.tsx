type SidebarProps = {
  items: string[]
}

/**
 * 顯示主要遊戲選單與目前所在區塊。
 *
 * @param props - 側邊選單項目。
 */
export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="z-10 border-white/10 bg-black/45 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r">
      <div className="flex h-full flex-col gap-8 px-4 py-5 lg:px-6 lg:py-8">
        <div className="shrink-0">
          <p className="text-xs text-neutral-500">墨境</p>
          <h1 className="font-serif text-3xl text-neutral-100">問道</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {items.map((item, index) => (
            <button
              className={`shrink-0 rounded-md border px-4 py-3 text-left text-sm transition hover:border-white/25 hover:bg-white/10 ${
                index === 0
                  ? 'border-white/20 bg-white/10 text-neutral-100'
                  : 'border-transparent text-neutral-400'
              }`}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 pt-5 text-xs text-neutral-500 lg:block">
          靜室閉關中
        </div>
      </div>
    </aside>
  )
}
