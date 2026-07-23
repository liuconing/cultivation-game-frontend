import { mockGameStateFixtures } from '@/data/gameMock'
import { Panel } from '../Panel'
import { StatusBadge } from '../StatusBadge'

/** 顯示地圖 fixture 的展示卡片。 */
export function ExplorationCard() {
  const { maps } = mockGameStateFixtures.default

  return (
    <Panel eyebrow="MAP FIXTURE" title="探索地圖">
      <ul className="space-y-3">
        {maps.map((map) => (
          <li
            className="flex min-w-0 items-center justify-between gap-4 rounded-md border border-white/10 bg-black/20 p-3"
            key={map.id}
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-neutral-100">{map.name}</p>
              <p className="mt-1 truncate text-xs text-neutral-500">
                建議境界：{map.recommendedRealm}
              </p>
            </div>
            <StatusBadge
              tone={
                map.status === 'unlocked'
                  ? 'jade'
                  : map.status === 'challenging'
                    ? 'gold'
                    : 'neutral'
              }
            >
              {map.status}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
