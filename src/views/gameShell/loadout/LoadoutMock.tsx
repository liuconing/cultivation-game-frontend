import { useCallback, useMemo, useState } from 'react'
import {
  Button,
  Drawer,
  Modal,
  Panel,
  StatusBadge,
  Tabs,
} from '@/components'
import type {
  MockEquipment,
  MockInventoryItem,
  MockPill,
} from '@/data/gameMock'
import { equipSkillsUsecase } from '@/domain'
import type { EquipSkillsParams } from '@/domain/repository'
import { useMutation } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import { uuid } from '@/lib/uuid'
import { getOrCreateIdempotencyKey } from '../game-mutation'
import { useGameRuntime } from '../use-game-runtime'
import { createEquipSkillsParams } from './loadout-actions'

/** 技能配置 mutation 使用的參數。 */
interface EquipSkillsMutationParams {
  /** 同時包含主動與被動槽位的後端請求。 */
  values: EquipSkillsParams
  /** 同一次配置與網路重試共用的冪等鍵。 */
  idempotencyKey: string
}

type LoadoutTab = 'inventory' | 'equipment' | 'methods' | 'skills' | 'pills'
type InventoryFilter = 'all' | MockInventoryItem['type']
type ConfirmAction =
  | { kind: 'sell'; equipmentId: string }
  | { kind: 'usePill'; templateId: string }
  | null

const tabOptions: Array<{ value: LoadoutTab; label: string }> = [
  { value: 'inventory', label: '背包' },
  { value: 'equipment', label: '裝備' },
  { value: 'methods', label: '功法' },
  { value: 'skills', label: '技能' },
  { value: 'pills', label: '丹藥' },
]

const qualityTone = {
  凡品: 'neutral',
  良品: 'jade',
  上品: 'gold',
  極品: 'cinnabar',
} as const

const equipmentSalePrice = {
  凡品: 120,
  良品: 360,
  上品: 980,
  極品: 2400,
} as const

function ItemSummary({
  name,
  quality,
  meta,
}: {
  name: string
  quality: keyof typeof qualityTone
  meta: string
}) {
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <p className="truncate font-medium text-neutral-200">{name}</p>
        <StatusBadge tone={qualityTone[quality]}>{quality}</StatusBadge>
      </div>
      <p className="mt-1 truncate text-xs text-neutral-600">{meta}</p>
    </div>
  )
}

/** UI-07 五分頁整備、物品抽屜與丹藥商店的記憶體 Mock。 */
export function LoadoutMock() {
  const {
    gameState,
    equipEquipment,
    sellEquipment,
    equipCultivationMethod,
    buyPill,
    consumePill,
    reloadGameState,
  } = useGameRuntime()
  const [activeTab, setActiveTab] = useState<LoadoutTab>('inventory')
  const [inventoryFilter, setInventoryFilter] =
    useState<InventoryFilter>('all')
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<
    string | null
  >(null)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [confirmAction, setConfirmAction] =
    useState<ConfirmAction>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [skillNotice, setSkillNotice] = useState<string | null>(null)
  const [skillIdempotencyKey, setSkillIdempotencyKey] = useState<
    string | null
  >(null)

  const equipSkillsMutation = useMutation(
    ({ values, idempotencyKey }: EquipSkillsMutationParams) =>
      equipSkillsUsecase(values, { idempotencyKey }),
    {
      enableGlobalError: false,
      onSuccess: async () => {
        setSkillIdempotencyKey(null)
        setSkillNotice('技能配置已同步。')
        await reloadGameState()
      },
      onError: (error) => {
        setSkillNotice(getApiClientError(error).message)
      },
    },
  )

  /** 配置單一技能時連同另一個既有槽位一併提交。 */
  const handleEquipSkill = (templateId: string): void => {
    if (equipSkillsMutation.isPending) {
      return
    }
    const values = createEquipSkillsParams(
      gameState.skills,
      templateId,
    )
    if (!values) {
      setSkillNotice('主動與被動技能各需至少持有一項。')
      return
    }
    const idempotencyKey = getOrCreateIdempotencyKey(
      skillIdempotencyKey,
      uuid,
    )
    setSkillIdempotencyKey(idempotencyKey)
    setSkillNotice(null)
    equipSkillsMutation.mutate({ values, idempotencyKey })
  }

  const selectedEquipment = gameState.equipment.find(
    (equipment) => equipment.id === selectedEquipmentId,
  )
  const comparedEquipment = selectedEquipment
    ? gameState.equipment.find(
        (equipment) =>
          equipment.slot === selectedEquipment.slot &&
          equipment.equipped &&
          equipment.id !== selectedEquipment.id,
      )
    : undefined
  const filteredInventory = useMemo(() => {
    if (inventoryFilter === 'all') {
      return gameState.inventory
    }
    return gameState.inventory.filter(
      (item) => item.type === inventoryFilter,
    )
  }, [gameState.inventory, inventoryFilter])

  const closeEquipmentDrawer = useCallback(() => {
    setSelectedEquipmentId(null)
  }, [])
  const closeShop = useCallback(() => {
    setIsShopOpen(false)
  }, [])
  const closeConfirm = useCallback(() => {
    if (!isBusy) {
      setConfirmAction(null)
    }
  }, [isBusy])

  const handleEquipEquipment = (equipment: MockEquipment) => {
    equipEquipment(equipment.id)
    setSelectedEquipmentId(null)
  }

  const handleConfirm = () => {
    if (!confirmAction || isBusy) {
      return
    }

    setIsBusy(true)
    window.setTimeout(() => {
      if (confirmAction.kind === 'sell') {
        sellEquipment(confirmAction.equipmentId)
        setSelectedEquipmentId(null)
      } else {
        consumePill(confirmAction.templateId)
      }
      setIsBusy(false)
      setConfirmAction(null)
    }, 400)
  }

  const renderInventory = () => {
    return (
      <Panel eyebrow="INVENTORY" title="背包">
        <label className="block text-xs text-neutral-500">
          類型篩選
          <select
            className="mt-2 min-h-10 w-full rounded-md border border-white/12 bg-ink-950 px-3 text-sm text-neutral-200 focus-visible:outline-2 focus-visible:outline-jade-300 sm:w-52"
            onChange={(event) =>
              setInventoryFilter(event.target.value as InventoryFilter)
            }
            value={inventoryFilter}
          >
            <option value="all">全部</option>
            <option value="material">材料</option>
            <option value="pill">丹藥</option>
            <option value="equipment">裝備</option>
            <option value="method">功法</option>
          </select>
        </label>

        {filteredInventory.length > 0 ? (
          <div
            aria-label={`${filteredInventory.length} 組背包物品`}
            className="mt-4 grid max-h-[60vh] gap-2 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2"
          >
            {filteredInventory.map((item) => (
              <div
                className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/10 bg-black/15 p-3"
                key={item.id}
              >
                <ItemSummary
                  meta={`${item.type}・${item.templateId}`}
                  name={item.name}
                  quality={item.quality}
                />
                <span className="shrink-0 tabular-nums text-sm text-neutral-300">
                  ×{item.quantity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-white/12 bg-black/10 px-4 py-12 text-center text-sm text-neutral-600">
            此篩選條件沒有物品。
          </div>
        )}
      </Panel>
    )
  }

  const renderEquipment = () => {
    return (
      <Panel eyebrow="EQUIPMENT INSTANCES" title="裝備">
        {gameState.equipment.length > 0 ? (
          <div className="grid gap-2">
            {gameState.equipment.map((equipment) => (
              <div
                className="grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                key={equipment.id}
              >
                <div className="min-w-0">
                  <ItemSummary
                    meta={`${equipment.slot}・Instance #${equipment.id.split('-').at(-1)}`}
                    name={equipment.name}
                    quality={equipment.quality}
                  />
                  <p className="mt-2 break-words text-xs leading-5 text-neutral-500">
                    {equipment.attributes.join('・')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {equipment.equipped ? (
                    <StatusBadge tone="jade">穿戴中</StatusBadge>
                  ) : null}
                  {!equipment.equipped ? (
                    <Button
                      className="min-w-0 flex-1 sm:flex-none"
                      onClick={() =>
                        setSelectedEquipmentId(equipment.id)
                      }
                      variant="ghost"
                    >
                      查看比較
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-white/12 px-4 py-12 text-center text-sm text-neutral-600">
            尚未持有任何裝備 instance。
          </div>
        )}
      </Panel>
    )
  }

  const renderMethods = () => {
    return (
      <Panel eyebrow="CULTIVATION METHODS" title="功法">
        <div className="grid gap-3">
          {gameState.cultivationMethods.map((method) => {
            const isLocked = method.minimumRealm === '金丹'
            return (
              <div
                className="grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                key={method.templateId}
              >
                <div className="min-w-0">
                  <ItemSummary
                    meta={`最低境界 ${method.minimumRealm}`}
                    name={method.name}
                    quality={method.quality}
                  />
                  <p className="mt-2 text-sm text-neutral-400">
                    修煉速度 × {method.cultivationMultiplier}
                  </p>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  disabled={method.equipped || isLocked}
                  onClick={() =>
                    equipCultivationMethod(method.templateId)
                  }
                  variant={method.equipped ? 'ghost' : 'secondary'}
                >
                  {method.equipped
                    ? '已裝備'
                    : isLocked
                      ? '境界不足'
                      : '裝備功法'}
                </Button>
              </div>
            )
          })}
        </div>
      </Panel>
    )
  }

  const renderSkills = () => {
    return (
      <div className="grid gap-4">
        {(['active', 'passive'] as const).map((kind) => (
          <Panel
            eyebrow={kind === 'active' ? 'ACTIVE SKILL' : 'PASSIVE SKILL'}
            key={kind}
            title={kind === 'active' ? '主動技能' : '被動技能'}
          >
            {skillNotice ? (
              <p
                aria-live="polite"
                className="mb-3 text-sm text-jade-100"
                role="status"
              >
                {skillNotice}
              </p>
            ) : null}
            <div className="grid gap-2">
              {gameState.skills
                .filter((skill) => skill.kind === kind)
                .map((skill) => (
                  <div
                    className="grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    key={skill.templateId}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-200">
                        {skill.name}
                      </p>
                      <p className="mt-1 break-words text-xs leading-5 text-neutral-500">
                        {skill.description}
                      </p>
                      <p className="mt-1 text-xs text-jade-100">
                        靈力消耗 {skill.spiritCost}
                      </p>
                    </div>
                    <Button
                      className="w-full sm:w-auto"
                      disabled={
                        skill.equipped ||
                        equipSkillsMutation.isPending
                      }
                      isLoading={
                        equipSkillsMutation.isPending &&
                        !skill.equipped
                      }
                      onClick={() =>
                        handleEquipSkill(skill.templateId)
                      }
                      variant={skill.equipped ? 'ghost' : 'primary'}
                    >
                      {skill.equipped ? '已配置' : '配置技能'}
                    </Button>
                  </div>
                ))}
            </div>
          </Panel>
        ))}
      </div>
    )
  }

  const renderPills = () => {
    return (
      <Panel eyebrow="PILLS & SHOP" title="丹藥">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">
            靈石{' '}
            <span className="tabular-nums text-gold-100">
              {gameState.character.spiritStones.toLocaleString()}
            </span>
          </p>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsShopOpen(true)}
            variant="secondary"
          >
            開啟丹藥商店
          </Button>
        </div>

        <div className="grid gap-2">
          {gameState.pills.map((pill) => {
            const isBreakthroughPill =
              pill.templateId === 'pill_breakthrough_01'
            return (
              <div
                className="grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                key={pill.templateId}
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-200">
                    {pill.name}{' '}
                    <span className="tabular-nums text-neutral-500">
                      ×{pill.quantity}
                    </span>
                  </p>
                  <p className="mt-1 break-words text-xs text-neutral-500">
                    {pill.effect}
                  </p>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  disabled={pill.quantity <= 0 || isBreakthroughPill}
                  onClick={() =>
                    setConfirmAction({
                      kind: 'usePill',
                      templateId: pill.templateId,
                    })
                  }
                >
                  {isBreakthroughPill ? '突破時使用' : '使用丹藥'}
                </Button>
              </div>
            )
          })}
        </div>
      </Panel>
    )
  }

  const confirmPill =
    confirmAction?.kind === 'usePill'
      ? gameState.pills.find(
          (pill) => pill.templateId === confirmAction.templateId,
        )
      : undefined
  const confirmEquipment =
    confirmAction?.kind === 'sell'
      ? gameState.equipment.find(
          (equipment) => equipment.id === confirmAction.equipmentId,
        )
      : undefined

  return (
    <>
      <div className="grid gap-4">
        <Tabs
          label="整備內部分頁"
          onChange={setActiveTab}
          options={tabOptions}
          value={activeTab}
        />
        {activeTab === 'inventory' ? renderInventory() : null}
        {activeTab === 'equipment' ? renderEquipment() : null}
        {activeTab === 'methods' ? renderMethods() : null}
        {activeTab === 'skills' ? renderSkills() : null}
        {activeTab === 'pills' ? renderPills() : null}
      </div>

      <Drawer
        isOpen={Boolean(selectedEquipment)}
        onClose={closeEquipmentDrawer}
        title="裝備比較"
      >
        {selectedEquipment ? (
          <>
            <ItemSummary
              meta={`${selectedEquipment.slot}・Instance #${selectedEquipment.id.split('-').at(-1)}`}
              name={selectedEquipment.name}
              quality={selectedEquipment.quality}
            />
            <div className="mt-4 grid gap-3">
              <section className="rounded-md border border-jade-400/20 bg-jade-400/[0.05] p-3">
                <h3 className="text-sm text-jade-100">選取 instance</h3>
                <ul className="mt-2 grid gap-1 text-xs text-neutral-400">
                  {selectedEquipment.attributes.map((attribute) => (
                    <li key={attribute}>・{attribute}</li>
                  ))}
                </ul>
              </section>
              <section className="rounded-md border border-white/10 bg-black/20 p-3">
                <h3 className="text-sm text-neutral-300">目前穿戴</h3>
                {comparedEquipment ? (
                  <>
                    <p className="mt-2 text-xs text-neutral-500">
                      {comparedEquipment.name}・#
                      {comparedEquipment.id.split('-').at(-1)}
                    </p>
                    <ul className="mt-2 grid gap-1 text-xs text-neutral-500">
                      {comparedEquipment.attributes.map((attribute) => (
                        <li key={attribute}>・{attribute}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-neutral-600">
                    此部位目前未穿戴裝備。
                  </p>
                )}
              </section>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                disabled={selectedEquipment.equipped}
                onClick={() => {
                  setConfirmAction({
                    kind: 'sell',
                    equipmentId: selectedEquipment.id,
                  })
                  setSelectedEquipmentId(null)
                }}
                variant="danger"
              >
                {selectedEquipment.equipped ? '穿戴中' : '出售'}
              </Button>
              <Button
                disabled={selectedEquipment.equipped}
                onClick={() =>
                  handleEquipEquipment(selectedEquipment)
                }
              >
                {selectedEquipment.equipped ? '已穿戴' : '穿戴替換'}
              </Button>
            </div>
          </>
        ) : null}
      </Drawer>

      <Drawer
        isOpen={isShopOpen}
        onClose={closeShop}
        title="丹藥商店"
      >
        <p className="text-xs text-neutral-500">
          持有靈石{' '}
          <span className="tabular-nums text-gold-100">
            {gameState.character.spiritStones.toLocaleString()}
          </span>
        </p>
        <div className="mt-4 grid gap-3">
          {gameState.pills.map((pill: MockPill) => {
            const canBuy =
              gameState.character.spiritStones >= pill.price
            return (
              <div
                className="rounded-md border border-white/10 bg-black/20 p-3"
                key={pill.templateId}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-neutral-200">{pill.name}</p>
                    <p className="mt-1 break-words text-xs text-neutral-500">
                      {pill.effect}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums text-gold-100">
                    {pill.price.toLocaleString()}
                  </span>
                </div>
                <Button
                  className="mt-3 w-full"
                  disabled={!canBuy}
                  onClick={() => buyPill(pill.templateId)}
                  variant={canBuy ? 'secondary' : 'ghost'}
                >
                  {canBuy ? '購買一枚' : '靈石不足'}
                </Button>
              </div>
            )
          })}
        </div>
        <Button className="mt-5 w-full" onClick={closeShop} variant="ghost">
          關閉商店
        </Button>
      </Drawer>

      <Modal
        isBusy={isBusy}
        isOpen={confirmAction !== null}
        onClose={closeConfirm}
        title={
          confirmAction?.kind === 'sell' ? '確認出售裝備' : '確認使用丹藥'
        }
      >
        {confirmEquipment ? (
          <>
            <p>
              出售 {confirmEquipment.name}・#
              {confirmEquipment.id.split('-').at(-1)}
            </p>
            <p className="mt-2 text-gold-100">
              售價{' '}
              {equipmentSalePrice[
                confirmEquipment.quality
              ].toLocaleString()}{' '}
              靈石
            </p>
            {confirmEquipment.quality === '上品' ||
            confirmEquipment.quality === '極品' ? (
              <p className="mt-3 rounded border border-cinnabar-400/25 bg-cinnabar-400/[0.07] p-3 text-xs text-cinnabar-100">
                這是高品質裝備，出售後無法復原。
              </p>
            ) : null}
          </>
        ) : null}
        {confirmPill ? (
          <>
            <p>使用 {confirmPill.name}？</p>
            <p className="mt-2 text-jade-100">{confirmPill.effect}</p>
          </>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button disabled={isBusy} onClick={closeConfirm} variant="ghost">
            取消
          </Button>
          <Button
            isLoading={isBusy}
            onClick={handleConfirm}
            variant={confirmEquipment ? 'danger' : 'primary'}
          >
            確認
          </Button>
        </div>
      </Modal>
    </>
  )
}
