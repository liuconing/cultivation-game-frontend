import {
  CharacterCard,
  EquipmentCard,
  ExplorationCard,
  MethodCard,
  ResourceBar,
  Sidebar,
  StatsCard,
} from '@/components'
import { GameImage } from '@/components/GameImage'
import { bind } from '@/utils'
import inkLandscape from '@/assets/images/ink-landscape.svg'
import { useHomeViewModel, type IHomeViewModel } from './home.view-model'

/**
 * 首頁畫面，組合修仙資訊卡片與水墨背景。
 *
 * @param props - 由 ViewModel 提供的選單與資源資料。
 */
export function homeViewController({ menuItems, resources }: IHomeViewModel) {
  return (
    <div className="ink-wash min-h-screen bg-neutral-950 text-neutral-200">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <GameImage
          alt="水墨遠山背景"
          className="absolute left-1/2 top-0 h-auto w-[110rem] max-w-none -translate-x-1/2 opacity-[0.14]"
          src={inkLandscape}
        />
        <GameImage
          alt="水墨山水底紋"
          className="absolute bottom-[-8rem] right-[-12rem] h-auto w-[72rem] max-w-none opacity-[0.1]"
          src={inkLandscape}
        />
      </div>
      <Sidebar items={menuItems} />
      <ResourceBar resources={resources} />
      <main className="relative z-10 px-4 pb-6 pt-20 sm:pt-24 lg:ml-64 lg:px-8 lg:pb-8 lg:pt-24">
        <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[1.45fr_0.85fr]">
          <CharacterCard />
          <StatsCard />
          <MethodCard />
          <EquipmentCard />
          <ExplorationCard />
        </div>
      </main>
    </div>
  )
}

export default bind(homeViewController, useHomeViewModel)
