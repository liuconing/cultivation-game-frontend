import { mockGameStateFixtures } from '@/data/gameMock'
import { Panel } from '../Panel'
import { StatusBadge } from '../StatusBadge'

/** 顯示功法 fixture 的展示卡片。 */
export function MethodCard() {
  const method = mockGameStateFixtures.default.cultivationMethods[0]

  return (
    <Panel eyebrow="METHOD FIXTURE" title="裝備功法">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg text-neutral-100">{method.name}</p>
          <p className="mt-2 text-sm text-neutral-400">
            修煉倍率 ×{method.cultivationMultiplier}
          </p>
        </div>
        <StatusBadge tone="jade">{method.quality}</StatusBadge>
      </div>
    </Panel>
  )
}
