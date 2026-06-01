import {
  FaBagShopping,
  FaCompass,
  FaGear,
  FaListCheck,
  FaScroll,
  FaStore,
  FaUser,
} from 'react-icons/fa6'
import { GiMountaintop } from 'react-icons/gi'
import { GameImage } from '../GameImage'
import bambooShadow from '@/assets/images/bamboo-shadow.svg'

const menuIcons = [
  FaUser,
  GiMountaintop,
  FaScroll,
  FaBagShopping,
  FaCompass,
  FaStore,
  FaListCheck,
  FaGear,
]

type SidebarProps = {
  items: string[]
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="z-10 border-white/10 bg-black/45 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r">
      <div className="relative flex h-full flex-col gap-8 overflow-hidden px-4 py-5 lg:px-6 lg:py-8">
        <GameImage
          alt="側欄竹影"
          className="pointer-events-none absolute bottom-0 right-0 hidden w-44 opacity-[0.16] lg:block"
          src={bambooShadow}
        />
        <div className="relative shrink-0">
          <p className="text-xs text-neutral-500">墨境</p>
          <h1 className="font-serif text-3xl text-neutral-100">問道</h1>
        </div>
        <nav className="relative flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {items.map((item, index) => {
            const Icon = menuIcons[index] ?? FaScroll

            return (
              <button
                className={`flex shrink-0 items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition hover:border-white/25 hover:bg-white/10 ${
                  index === 0
                    ? 'border-white/20 bg-white/10 text-neutral-100'
                    : 'border-transparent text-neutral-400'
                }`}
                key={item}
                type="button"
              >
                <Icon className="text-base text-neutral-400" />
                <span>{item}</span>
              </button>
            )
          })}
        </nav>
        <div className="relative mt-auto hidden border-t border-white/10 pt-5 text-xs text-neutral-500 lg:block">
          靜室閉關中
        </div>
      </div>
    </aside>
  )
}
