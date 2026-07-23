import { mockGameStateFixtures } from '@/data/gameMock'
import { Panel } from '../Panel'
import { StatusBadge } from '../StatusBadge'

/** 顯示裝備 fixture 的展示卡片。 */
export function EquipmentCard() {
  const { equipment } = mockGameStateFixtures.default

  return (
    <Panel eyebrow="INSTANCE FIXTURE" title="目前裝備">
      <ul className="grid gap-3 sm:grid-cols-2">
        {equipment.map((item) => (
          <li
            className="min-w-0 rounded-md border border-white/10 bg-black/20 p-3"
            key={item.id}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm text-neutral-100">{item.name}</p>
              <StatusBadge tone="gold">{item.quality}</StatusBadge>
            </div>
            <p className="mt-2 text-xs text-neutral-500">{item.slot}</p>
            <p className="mt-2 break-words text-xs text-neutral-300">
              {item.attributes.join('・')}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
