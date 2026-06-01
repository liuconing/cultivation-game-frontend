import { character } from '@/data/gameMock'
import { GameImage } from '../GameImage'
import { Panel } from '../Panel'
import { ProgressBar } from '../ProgressBar'
import characterSilhouette from '@/assets/images/character-silhouette.svg'

export function CharacterCard() {
  return (
    <Panel
      className="lg:col-span-2"
      eyebrow={character.title}
      title={character.name}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-white/10 bg-black/25 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="rounded-full border border-white/20 bg-black/35 p-2">
              <GameImage
                alt="角色剪影"
                className="size-28 rounded-full object-cover opacity-70 hover:opacity-85 hover:brightness-90"
                src={characterSilhouette}
              />
            </div>
            <div>
              <p className="text-sm text-neutral-500">當前境界</p>
              <p className="mt-2 font-serif text-4xl text-neutral-100">
                {character.realm}
              </p>
            </div>
          </div>
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
