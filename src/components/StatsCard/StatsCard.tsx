import { mockGameStateFixtures } from '@/data/gameMock'
import { Panel } from '../Panel'

/** 顯示固定寬度數值的展示卡片。 */
export function StatsCard() {
  const { character } = mockGameStateFixtures.default
  const stats = [
    ['生命', `${character.health.toLocaleString()} / ${character.maxHealth.toLocaleString()}`],
    [
      '靈力',
      `${character.spiritPower.toLocaleString()} / ${character.maxSpiritPower.toLocaleString()}`,
    ],
    ['靈石', character.spiritStones.toLocaleString()],
    ['境界', `${character.realm}・${character.minorRealm}`],
  ]

  return (
    <Panel eyebrow="STABLE NUMBERS" title="角色摘要">
      <dl className="grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div
            className="min-w-0 rounded-md border border-white/10 bg-black/20 p-3"
            key={label}
          >
            <dt className="text-xs text-neutral-500">{label}</dt>
            <dd className="mt-1 truncate text-sm tabular-nums text-neutral-100">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
