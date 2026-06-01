import { exploration } from '@/data/gameMock'
import { GameImage } from '../GameImage'
import { Panel } from '../Panel'
import explorationMap from '@/assets/images/exploration-map.svg'

export function ExplorationCard() {
  return (
    <Panel eyebrow="外出歷練" title="探索紀錄">
      <div className="grid gap-5 lg:grid-cols-[13rem_1fr]">
        <GameImage
          alt="探索山水縮圖"
          className="h-36 w-full rounded-lg border border-white/10 object-cover opacity-65 hover:opacity-80 hover:brightness-90 lg:h-full"
          src={explorationMap}
        />
        <div>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-neutral-500">地圖名稱</dt>
              <dd className="mt-1 text-neutral-100">{exploration.map}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">推薦境界</dt>
              <dd className="mt-1 text-neutral-100">
                {exploration.recommendedRealm}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">探索時間</dt>
              <dd className="mt-1 text-neutral-100">{exploration.duration}</dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs text-neutral-500">獲得獎勵</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {exploration.rewards.map((reward) => (
                <span
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-300"
                  key={reward}
                >
                  {reward}
                </span>
              ))}
            </div>
          </div>
          <button
            className="mt-6 rounded-md border border-white/20 bg-transparent px-5 py-3 text-sm text-neutral-100 transition hover:border-white/35 hover:bg-white/10"
            type="button"
          >
            探索完成
          </button>
        </div>
      </div>
    </Panel>
  )
}
