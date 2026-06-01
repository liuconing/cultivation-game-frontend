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
import { menuItems, resources } from '@/data/gameMock'
import inkLandscape from '@/assets/images/ink-landscape.svg'

function App() {
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
      <main className="relative z-10 px-4 py-6 lg:ml-64 lg:px-8 lg:py-8">
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

export default App
