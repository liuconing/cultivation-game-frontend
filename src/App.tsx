import {
  CharacterCard,
  EquipmentCard,
  ExplorationCard,
  MethodCard,
  ResourceBar,
  Sidebar,
  StatsCard,
} from '@/components'
import { menuItems, resources } from '@/data/gameMock'

/**
 * 組合修仙遊戲首頁版面。
 */
function App() {
  return (
    <div className="ink-wash min-h-screen bg-neutral-950 text-neutral-200">
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
