import { equipment } from '@/data/gameMock'
import { Panel } from '../Panel'
import {
  GiArmorVest,
  GiBroadsword,
  GiCrownedSkull,
  GiDropEarrings,
  GiLegArmor,
  GiLeatherBoot,
} from 'react-icons/gi'

const equipmentIcons = {
  accessory: GiDropEarrings,
  armor: GiArmorVest,
  boots: GiLeatherBoot,
  helmet: GiCrownedSkull,
  pants: GiLegArmor,
  weapon: GiBroadsword,
}

export function EquipmentCard() {
  return (
    <Panel eyebrow="法器與護具" title="裝備">
      <div className="grid gap-3 sm:grid-cols-2">
        {equipment.map((item) => {
          const Icon =
            equipmentIcons[item.icon as keyof typeof equipmentIcons] ??
            GiBroadsword

          return (
            <div
              className="group flex gap-3 rounded-md border border-white/10 bg-black/20 p-3 transition hover:bg-white/5"
              key={item.slot}
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-md border border-white/10 bg-black/30">
                <Icon className="text-xl text-neutral-300 opacity-70 transition group-hover:opacity-90" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">{item.slot}</p>
                <p className="mt-1 text-sm text-neutral-100">{item.name}</p>
                <p className="mt-2 text-xs text-neutral-400">{item.bonus}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
