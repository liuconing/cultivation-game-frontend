import { stats } from '@/data/gameMock'
import { Panel } from '../Panel'
import {
  FaBullseye,
  FaGaugeHigh,
  FaHeartPulse,
  FaShieldHalved,
} from 'react-icons/fa6'
import { GiClover, GiCrossedSwords, GiShardSword, GiWindSlap } from 'react-icons/gi'

const statIcons = [
  GiCrossedSwords,
  FaShieldHalved,
  FaHeartPulse,
  FaGaugeHigh,
  GiShardSword,
  GiShardSword,
  FaShieldHalved,
  GiWindSlap,
  FaBullseye,
  GiClover,
]

export function StatsCard() {
  return (
    <Panel eyebrow="戰鬥數值" title="屬性">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {stats.map((stat, index) => {
          const Icon = statIcons[index] ?? GiClover

          return (
            <div
              className="rounded-md border border-white/10 bg-black/20 px-3 py-3 transition hover:bg-white/5"
              key={stat.label}
            >
              <dt className="flex items-center gap-2 text-neutral-500">
                <Icon className="text-neutral-400 opacity-70" />
                <span>{stat.label}</span>
              </dt>
              <dd className="mt-1 text-base text-neutral-100">{stat.value}</dd>
            </div>
          )
        })}
      </dl>
    </Panel>
  )
}
