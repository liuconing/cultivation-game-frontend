import {
  FaBolt,
  FaCoins,
  FaCog,
  FaHeart,
  FaLeaf,
  FaSignOutAlt,
} from 'react-icons/fa'
import { character } from '@/data/gameMock'

type Resource = {
  label: string
  value: string
  key: string
}

type ResourceBarProps = {
  resources: Resource[]
}

const resourceIcons = {
  cultivation: FaLeaf,
  health: FaHeart,
  spiritPower: FaBolt,
  spiritStone: FaCoins,
}

export function ResourceBar({ resources }: ResourceBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-white/12 bg-[rgba(10,10,10,0.85)] px-4 backdrop-blur-xl sm:h-20 lg:left-64 lg:px-8">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div className="hidden md:block" />
        <div className="flex min-w-0 items-center gap-2 overflow-hidden md:justify-self-center">
          {resources.map((resource, index) => {
            const Icon =
              resourceIcons[resource.key as keyof typeof resourceIcons] ??
              FaLeaf

            return (
              <div
                className={`flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/[0.08] hover:brightness-110 sm:px-4 ${
                  index > 0 ? 'hidden md:flex' : 'flex'
                }`}
                key={resource.key}
              >
                <Icon className="text-neutral-300 opacity-75" />
                <span className="text-neutral-400">{resource.label}</span>
                <span className="text-neutral-100">{resource.value}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-end gap-3 md:justify-self-end">
          <div className="hidden text-right sm:block">
            <p className="text-sm text-neutral-100">{character.name}</p>
            <p className="text-xs text-neutral-400">{character.realm}</p>
          </div>
          <button
            aria-label="設定"
            className="grid size-10 place-items-center rounded-full border border-white/12 bg-white/[0.03] text-neutral-300 transition hover:bg-white/[0.08] hover:brightness-110"
            type="button"
          >
            <FaCog />
          </button>
          <button
            aria-label="登出"
            className="hidden size-10 place-items-center rounded-full border border-white/12 bg-white/[0.03] text-neutral-400 transition hover:bg-white/[0.08] hover:text-neutral-100 hover:brightness-110 sm:grid"
            type="button"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  )
}
