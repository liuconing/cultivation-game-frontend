import { equipment } from '@/data/gameMock'
import { Panel } from '../Panel'

/**
 * 顯示角色目前裝備與加成資訊。
 */
export function EquipmentCard() {
  return (
    <Panel eyebrow="法器與護具" title="裝備">
      <div className="grid gap-3 sm:grid-cols-2">
        {equipment.map((item) => (
          <div
            className="rounded-md border border-white/10 bg-black/20 p-3"
            key={item.slot}
          >
            <p className="text-xs text-neutral-500">{item.slot}</p>
            <p className="mt-1 text-sm text-neutral-100">{item.name}</p>
            <p className="mt-2 text-xs text-neutral-400">{item.bonus}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}
