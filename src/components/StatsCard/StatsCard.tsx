import { stats } from '@/data/gameMock'
import { Panel } from '../Panel'

/**
 * 顯示角色戰鬥屬性數值。
 */
export function StatsCard() {
  return (
    <Panel eyebrow="戰鬥數值" title="屬性">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {stats.map((stat) => (
          <div
            className="rounded-md border border-white/10 bg-black/20 px-3 py-3"
            key={stat.label}
          >
            <dt className="text-neutral-500">{stat.label}</dt>
            <dd className="mt-1 text-base text-neutral-100">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
