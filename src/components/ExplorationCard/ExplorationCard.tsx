import { exploration } from '@/data/gameMock'
import { Panel } from '../Panel'

/**
 * 顯示探索地圖、推薦境界與獎勵內容。
 */
export function ExplorationCard() {
  return (
    <Panel eyebrow="外出歷練" title="探索紀錄">
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
    </Panel>
  )
}
