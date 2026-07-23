import {
  Button,
  Drawer,
  Modal,
  Panel,
  ProgressBar,
  StatusBadge,
  Tabs,
  TextField,
} from '@/components'
import { bind } from '@/utils'
import type { MockScenario } from '@/data/gameMock'
import {
  useHomeViewModel,
  type IHomeViewModel,
} from './home.view-model'

const foundationTabs = [
  { value: 'controls', label: '控制元件' },
  { value: 'fixtures', label: 'Fixture 資料' },
  { value: 'states', label: '狀態情境' },
] as const

const scenarioTone = {
  default: 'neutral',
  success: 'jade',
  failure: 'cinnabar',
  loading: 'gold',
  empty: 'neutral',
  insufficient: 'cinnabar',
  foundationComplete: 'gold',
  longName: 'gold',
  disconnected: 'cinnabar',
  sessionExpired: 'cinnabar',
  noMethod: 'neutral',
  turnLimit: 'cinnabar',
  encounter: 'jade',
  bossFirstKill: 'gold',
  recovered: 'jade',
} as const

/** 呈現 UI-01 的設計基礎與 Mock GameState 展示板。 */
export function homeViewController({
  gameState,
  scenarioOptions,
  selectedTab,
  isModalOpen,
  isDrawerOpen,
  handleScenarioChange,
  handleTabChange,
  handleClaimCultivation,
  handleReset,
  handleOpenModal,
  handleCloseModal,
  handleOpenDrawer,
  handleCloseDrawer,
}: IHomeViewModel) {
  const { character } = gameState

  return (
    <div className="ink-wash min-h-screen text-neutral-200">
      <header className="border-b border-white/10 bg-ink-950/85 px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.24em] text-gold-200/65">
              UI-01・XIA-36
            </p>
            <h1 className="mt-2 font-serif text-3xl text-neutral-100 sm:text-4xl">
              問仙・設計基礎
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              共用元件、穩定尺寸與純記憶體 GameState 的互動展示板。
            </p>
          </div>
          <label className="block w-full sm:w-56">
            <span className="mb-2 block text-xs text-neutral-500">
              Fixture 情境
            </span>
            <select
              className="min-h-11 w-full rounded-md border border-white/14 bg-ink-900 px-3 text-sm text-neutral-100 outline-none focus:border-jade-300/70 focus:ring-2 focus:ring-jade-300/15"
              onChange={(event) => {
                handleScenarioChange(event.target.value as MockScenario)
              }}
              value={gameState.scenario}
            >
              {scenarioOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)] lg:px-8 lg:py-8">
        <div className="grid min-w-0 gap-5">
          <Panel eyebrow="DESIGN TOKENS" title="色彩、按鈕與狀態">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="jade">玉綠・成功</StatusBadge>
              <StatusBadge tone="cinnabar">硃紅・危險</StatusBadge>
              <StatusBadge tone="gold">古金・提醒</StatusBadge>
              <StatusBadge>玄墨・中性狀態與極長名稱截斷測試</StatusBadge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Button
                className="w-full sm:w-auto"
                onClick={handleClaimCultivation}
              >
                領取修為
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={handleOpenModal}
                variant="secondary"
              >
                開啟彈窗
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={handleOpenDrawer}
                variant="ghost"
              >
                開啟抽屜
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled
                variant="danger"
              >
                資源不足
              </Button>
              <Button
                className="w-full sm:w-auto"
                isLoading
                variant="ghost"
              >
                載入
              </Button>
            </div>
          </Panel>

          <Panel eyebrow="FORM & TABS" title="輸入與頁籤">
            <Tabs
              label="Foundation 分類"
              onChange={handleTabChange}
              options={[...foundationTabs]}
              value={selectedTab}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                defaultValue="沈望舒"
                hint="姓名限制為 1 至 12 字；此處只展示欄位樣式。"
                label="角色姓名"
              />
              <TextField
                defaultValue="超過十二字的角色姓名示例"
                error="角色姓名不可超過 12 字。"
                label="錯誤狀態"
              />
            </div>
          </Panel>

          <Panel eyebrow="MOCK GAME STATE" title={character.name}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-serif text-2xl text-neutral-100">
                {character.realm}・{character.minorRealm}
              </p>
              <StatusBadge tone={scenarioTone[gameState.scenario]}>
                {gameState.scenario}
              </StatusBadge>
            </div>
            <div className="mt-5 grid gap-4">
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
            <p
              aria-live="polite"
              className="mt-5 min-h-11 rounded-md border border-white/10 bg-black/20 px-3 py-3 text-sm text-neutral-300"
            >
              {gameState.notice ?? '目前為預設狀態，尚無全域提示。'}
            </p>
          </Panel>
        </div>

        <aside className="grid min-w-0 content-start gap-5">
          <Panel eyebrow="FIXTURE COVERAGE" title="資料覆蓋">
            <dl className="grid grid-cols-2 gap-3">
              {[
                ['地圖', gameState.maps.length],
                ['戰鬥', gameState.battle ? 1 : 0],
                ['背包', gameState.inventory.length],
                ['裝備', gameState.equipment.length],
                ['功法', gameState.cultivationMethods.length],
                ['技能', gameState.skills.length],
                ['丹藥', gameState.pills.length],
                ['休養分鐘', gameState.cave.minutesToFull],
              ].map(([label, value]) => (
                <div
                  className="min-w-0 rounded-md border border-white/10 bg-black/20 p-3"
                  key={label}
                >
                  <dt className="truncate text-xs text-neutral-500">
                    {label}
                  </dt>
                  <dd className="mt-1 text-xl tabular-nums text-neutral-100">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel eyebrow="MEMORY ONLY" title="資料原則">
            <ul className="space-y-3 text-sm leading-6 text-neutral-400">
              <li>所有操作只修改 Zustand 記憶體狀態。</li>
              <li>重新整理頁面即回復預設 fixture。</li>
              <li>不呼叫正式 API，也不預先模擬後端成功。</li>
            </ul>
            <Button
              className="mt-5 w-full"
              onClick={handleReset}
              variant="ghost"
            >
              重設 Fixture
            </Button>
          </Panel>
        </aside>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="突破確認範例"
      >
        <p>這是共用確認彈窗。按 Escape 關閉後，焦點會回到原按鈕。</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button onClick={handleCloseModal} variant="ghost">
            取消
          </Button>
          <Button onClick={handleCloseModal} variant="secondary">
            確認
          </Button>
        </div>
      </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="角色詳情抽屜範例"
      >
        <dl className="space-y-4">
          <div>
            <dt className="text-xs text-neutral-500">靈根</dt>
            <dd>{character.spiritualRoot}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">品質</dt>
            <dd>{character.spiritualRootQuality}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">靈石</dt>
            <dd className="tabular-nums">
              {character.spiritStones.toLocaleString()}
            </dd>
          </div>
        </dl>
        <Button
          className="mt-6 w-full"
          onClick={handleCloseDrawer}
          variant="ghost"
        >
          關閉抽屜
        </Button>
      </Drawer>
    </div>
  )
}

export default bind(homeViewController, useHomeViewModel)
