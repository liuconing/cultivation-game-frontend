import { method } from '@/data/gameMock'
import { GameImage } from '../GameImage'
import { Panel } from '../Panel'
import meditationSilhouette from '@/assets/images/meditation-silhouette.svg'

export function MethodCard() {
  return (
    <Panel eyebrow="閉關修行" title="功法">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20 p-4">
        <GameImage
          alt="打坐剪影"
          className="pointer-events-none absolute bottom-0 right-0 w-44 opacity-[0.18]"
          src={meditationSilhouette}
        />
        <dl className="relative space-y-4 text-sm">
          <div>
            <dt className="text-neutral-500">當前功法</dt>
            <dd className="mt-1 text-lg text-neutral-100">{method.name}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">功法境界</dt>
            <dd className="mt-1 text-neutral-200">{method.stage}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">修煉效率</dt>
            <dd className="mt-1 text-neutral-200">{method.efficiency}</dd>
          </div>
        </dl>
      </div>
      <button
        className="mt-6 w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-neutral-100 transition hover:border-white/35 hover:bg-white/10"
        type="button"
      >
        修煉中
      </button>
    </Panel>
  )
}
