import { character } from '@/data/gameMock'
import { Panel } from '../Panel'
import { ProgressBar } from '../ProgressBar'

/**
 * 顯示角色境界、基礎資訊與生命狀態。
 */
export function CharacterCard() {
  return (
    <Panel
      className="lg:col-span-2"
      eyebrow={character.title}
      title={character.name}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-white/10 bg-black/25 p-5">
          <p className="text-sm text-neutral-500">當前境界</p>
          <p className="mt-2 font-serif text-4xl text-neutral-100">
            {character.realm}
          </p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500">靈根</dt>
              <dd className="mt-1 text-neutral-200">{character.root}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">氣運</dt>
              <dd className="mt-1 text-neutral-200">{character.fortune}</dd>
            </div>
          </dl>
        </div>
        <div className="grid content-center gap-5">
          {character.vitals.map((vital) => (
            <ProgressBar
              key={vital.label}
              label={vital.label}
              value={vital.value}
            />
          ))}
          <div className="pt-1 text-xs text-neutral-500">
            修為進度 {character.cultivationProgress}% ，距離金丹尚需沉心淬煉。
          </div>
        </div>
      </div>
    </Panel>
  )
}
