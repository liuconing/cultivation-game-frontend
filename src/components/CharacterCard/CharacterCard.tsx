import { mockGameStateFixtures } from '@/data/gameMock'
import { Panel } from '../Panel'
import { ProgressBar } from '../ProgressBar'

/** 顯示基礎角色狀態的展示卡片。 */
export function CharacterCard() {
  const { character } = mockGameStateFixtures.default

  return (
    <Panel
      eyebrow={`${character.spiritualRoot}・${character.spiritualRootQuality}`}
      title={character.name}
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-serif text-3xl text-neutral-100">
            {character.realm}・{character.minorRealm}
          </p>
          <p className="text-sm tabular-nums text-gold-100">
            靈石 {character.spiritStones.toLocaleString()}
          </p>
        </div>
        <ProgressBar
          label="修為"
          max={character.cultivationTarget}
          value={character.cultivation}
        />
        <ProgressBar
          label="生命"
          max={character.maxHealth}
          tone="cinnabar"
          value={character.health}
        />
        <ProgressBar
          label="靈力"
          max={character.maxSpiritPower}
          tone="gold"
          value={character.spiritPower}
        />
      </div>
    </Panel>
  )
}
