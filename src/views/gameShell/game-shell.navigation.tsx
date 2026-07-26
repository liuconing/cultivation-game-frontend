import { NavLink } from 'react-router'
import type { GameNavigationItem } from './gameShell.view-model'

const navLinkClassName = ({ isActive }: { isActive: boolean }) => {
  return `group flex min-h-12 w-full min-w-0 items-center gap-3 overflow-hidden rounded-md border px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-300 ${
    isActive
      ? 'border-jade-400/35 bg-jade-400/12 text-jade-100'
      : 'border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-neutral-200'
  }`
}

const mobileNavLinkClassName = ({ isActive }: { isActive: boolean }) => {
  return `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md border py-1.5 text-[0.68rem] transition focus-visible:outline-2 focus-visible:outline-jade-300 ${
    isActive ? 'border-jade-400/30 bg-jade-400/12 text-jade-100' : 'border-transparent text-neutral-500'
  }`
}

export function DesktopNavigation({ navigationItems }: { navigationItems: GameNavigationItem[] }) {
  return (
    <aside className='fixed inset-y-0 left-0 z-40 hidden w-56 min-w-0 flex-col overflow-x-hidden border-r border-white/10 bg-ink-950/96 p-4 md:flex'>
      <div className='border-b border-white/10 px-2 pb-5 pt-2'>
        <p className='text-xs tracking-[0.25em] text-gold-200/65'>XIA-39</p>
        <p className='mt-2 font-serif text-2xl text-neutral-100'>問仙</p>
        <p className='mt-1 text-xs text-neutral-600'>修仙放置遊戲</p>
      </div>

      <nav aria-label='遊戲主導覽' className='mt-5 grid min-w-0 gap-2'>
        {navigationItems.map((item) => (
          <NavLink className={navLinkClassName} key={item.path} to={item.path}>
            <span
              aria-hidden='true'
              className='grid size-8 shrink-0 place-items-center rounded-full border border-current/20 font-serif'
            >
              {item.glyph}
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block truncate font-medium'>{item.label}</span>
              <span className='block truncate text-[0.66rem] text-neutral-600 group-hover:text-neutral-500'>
                {item.description}
              </span>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className='mt-auto rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-neutral-600'>
        遊戲進度由後端保存；操作完成後會自動同步最新狀態。
      </div>
    </aside>
  )
}

export function MobileNavigation({ navigationItems }: { navigationItems: GameNavigationItem[] }) {
  return (
    <nav
      aria-label='手機遊戲主導覽'
      className='fixed inset-x-0 bottom-0 z-40 grid h-[4.5rem] grid-cols-4 gap-1 border-t border-white/12 bg-ink-950/96 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden'
    >
      {navigationItems.map((item) => (
        <NavLink className={mobileNavLinkClassName} key={item.path} to={item.path}>
          <span
            aria-hidden='true'
            className='grid size-6 place-items-center rounded-full border border-current/20 font-serif text-xs'
          >
            {item.glyph}
          </span>
          <span className='max-w-full truncate'>{item.shortLabel}</span>
        </NavLink>
      ))}
    </nav>
  )
}
