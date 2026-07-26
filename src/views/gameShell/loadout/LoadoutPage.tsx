import { useCallback, useMemo, useState } from 'react'
import { Button, Drawer, Modal, Panel, StatusBadge, Tabs } from '@/components'
import {
  compareEquipmentUsecase,
  equipCultivationMethodUsecase,
  equipEquipmentUsecase,
  equipSkillsUsecase,
  getShopPillsUsecase,
  purchasePillUsecase,
  sellEquipmentUsecase,
  usePillUsecase as consumePillUsecase,
} from '@/domain'
import type {
  EquipSkillsParams,
  EquipCultivationMethodParams,
  EquipmentInstanceParams,
  PurchasePillParams,
  UsePillParams,
} from '@/domain/repository'
import { useFetch, useGameMutation } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import type { GameViewEquipment, GameViewInventoryItem } from '@/utils'
import { useGameRuntime } from '@/containers'
import { createEquipSkillsParams } from './loadoutActions'

type LoadoutTab = 'inventory' | 'equipment' | 'methods' | 'skills' | 'pills'
type InventoryFilter = 'all' | GameViewInventoryItem['type']
type ConfirmAction =
  | { kind: 'sell'; equipmentId: string; salePrice: number }
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

function ItemSummary({ name, quality, meta }: { name: string; quality: keyof typeof qualityTone; meta: string }) {
  return (
    <div className='min-w-0'>
      <div className='flex min-w-0 items-center gap-2'>
        <p className='truncate font-medium text-neutral-200'>{name}</p>
        <StatusBadge tone={qualityTone[quality]}>{quality}</StatusBadge>
      </div>
      <p className='mt-1 truncate text-xs text-neutral-600'>{meta}</p>
    </div>
  )
}

/** 背包、裝備、功法、技能與丹藥的正式 API 頁面。 */
export function LoadoutPage() {
  const { gameState } = useGameRuntime()
  const [activeTab, setActiveTab] = useState<LoadoutTab>('inventory')
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('all')
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [skillNotice, setSkillNotice] = useState<string | null>(null)
  const [skillError, setSkillError] = useState<string | null>(null)
  const [equipmentNotice, setEquipmentNotice] = useState<string | null>(null)
  const [equipmentError, setEquipmentError] = useState<string | null>(null)
  const [methodNotice, setMethodNotice] = useState<string | null>(null)
  const [methodError, setMethodError] = useState<string | null>(null)
  const [pillNotice, setPillNotice] = useState<string | null>(null)
  const [pillError, setPillError] = useState<string | null>(null)

  const shopPillsQuery = useFetch(getShopPillsUsecase, undefined, {
    queryKey: ['pill-shop'],
    enabled: isShopOpen,
    retry: 1,
    enableGlobalError: false,
  })

  const equipMethodMutation = useGameMutation<
    EquipCultivationMethodParams,
    Awaited<ReturnType<typeof equipCultivationMethodUsecase>>
  >({
    operation: 'equip-cultivation-method',
    request: (intent, { idempotencyKey }) => equipCultivationMethodUsecase(intent, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setMethodError(null)
      setMethodNotice(
        `功法已裝備：修煉倍率 × ${response.data.cultivationMultiplier}，突破加成 +${response.data.breakthroughBonus}%。`,
      )
    },
    onError: (error) => {
      setMethodError(getApiClientError(error).message)
    },
  })

  /** 裝備玩家持有且符合境界的 V1 功法。 */
  const handleEquipMethod = (templateId: string): void => {
    if (equipMethodMutation.isPending) {
      return
    }
    setMethodNotice(null)
    setMethodError(null)
    equipMethodMutation.execute({
      cultivationMethodTemplateId: templateId,
    })
  }

  const equipSkillsMutation = useGameMutation<EquipSkillsParams, Awaited<ReturnType<typeof equipSkillsUsecase>>>({
    operation: 'equip-skills',
    request: (intent, { idempotencyKey }) => equipSkillsUsecase(intent, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: () => {
      setSkillError(null)
      setSkillNotice('技能配置已同步。')
    },
    onError: (error) => {
      setSkillError(getApiClientError(error).message)
    },
  })

  /** 配置單一技能時連同另一個既有槽位一併提交。 */
  const handleEquipSkill = (templateId: string): void => {
    if (equipSkillsMutation.isPending) {
      return
    }
    const values = createEquipSkillsParams(gameState.skills, templateId)
    if (!values) {
      setSkillError('主動與被動技能各需至少持有一項。')
      return
    }
    setSkillNotice(null)
    setSkillError(null)
    equipSkillsMutation.execute(values)
  }

  const selectedEquipment = gameState.equipment.find((equipment) => equipment.id === selectedEquipmentId)
  const comparisonQuery = useFetch(compareEquipmentUsecase, selectedEquipmentId ?? '', {
    queryKey: ['equipment-comparison', selectedEquipmentId],
    enabled: Boolean(selectedEquipmentId),
    retry: 1,
    enableGlobalError: false,
  })
  const equipEquipmentMutation = useGameMutation<
    EquipmentInstanceParams,
    Awaited<ReturnType<typeof equipEquipmentUsecase>>
  >({
    operation: 'equip-equipment',
    request: (intent, { idempotencyKey }) => equipEquipmentUsecase(intent, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: () => {
      setSelectedEquipmentId(null)
      setEquipmentError(null)
      setEquipmentNotice('裝備已穿戴並同步派生屬性。')
    },
    onError: (error) => {
      setEquipmentError(getApiClientError(error).message)
    },
  })
  const sellEquipmentMutation = useGameMutation<
    EquipmentInstanceParams,
    Awaited<ReturnType<typeof sellEquipmentUsecase>>
  >({
    operation: 'sell-equipment',
    request: (intent, { idempotencyKey }) => sellEquipmentUsecase(intent, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setConfirmAction(null)
      setSelectedEquipmentId(null)
      setEquipmentError(null)
      setEquipmentNotice(`已出售裝備並取得 ${response.data.salePrice.toLocaleString()} 靈石。`)
    },
    onError: (error) => {
      setEquipmentError(getApiClientError(error).message)
    },
  })
  const purchasePillMutation = useGameMutation<PurchasePillParams, Awaited<ReturnType<typeof purchasePillUsecase>>>({
    operation: 'purchase-pill',
    request: (intent, { idempotencyKey }) => purchasePillUsecase(intent, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setPillError(null)
      setPillNotice(
        `已購買 ${response.data.quantityPurchased.toLocaleString()} 枚丹藥，支付 ${response.data.totalPrice.toLocaleString()} 靈石。`,
      )
    },
    synchronize: async () => {
      await shopPillsQuery.refetch()
    },
    onError: (error) => {
      setPillError(getApiClientError(error).message)
    },
  })
  const usePillMutation = useGameMutation<UsePillParams, Awaited<ReturnType<typeof consumePillUsecase>>>({
    operation: 'use-pill',
    request: (intent, { idempotencyKey }) => consumePillUsecase(intent, { idempotencyKey }),
    enableGlobalError: false,
    onSuccess: (response) => {
      setConfirmAction(null)
      setPillError(null)
      setPillNotice(
        `已使用丹藥；生命 ${response.data.before.currentHp} → ${response.data.after.currentHp}，靈力 ${response.data.before.currentMp} → ${response.data.after.currentMp}，修為 ${response.data.before.cultivation.toLocaleString()} → ${response.data.after.cultivation.toLocaleString()}。`,
      )
    },
    onError: (error) => {
      setPillError(getApiClientError(error).message)
    },
  })
  const comparedEquipment = selectedEquipment
    ? gameState.equipment.find(
        (equipment) =>
          equipment.slot === selectedEquipment.slot && equipment.equipped && equipment.id !== selectedEquipment.id,
      )
    : undefined
  const filteredInventory = useMemo(() => {
    if (inventoryFilter === 'all') {
      return gameState.inventory
    }
    return gameState.inventory.filter((item) => item.type === inventoryFilter)
  }, [gameState.inventory, inventoryFilter])

  const closeEquipmentDrawer = useCallback(() => {
    setSelectedEquipmentId(null)
    equipEquipmentMutation.cancelIntent()
  }, [equipEquipmentMutation])
  const closeShop = useCallback(() => {
    setIsShopOpen(false)
    purchasePillMutation.cancelIntent()
  }, [purchasePillMutation])
  const closeConfirm = useCallback(() => {
    if (!usePillMutation.isPending && !sellEquipmentMutation.isPending) {
      setConfirmAction(null)
      sellEquipmentMutation.cancelIntent()
      usePillMutation.cancelIntent()
    }
  }, [sellEquipmentMutation, usePillMutation])

  const handleEquipEquipment = (equipment: GameViewEquipment) => {
    if (equipment.equipped || equipEquipmentMutation.isPending) {
      return
    }
    setEquipmentNotice(null)
    setEquipmentError(null)
    equipEquipmentMutation.execute({
      instanceId: equipment.id,
    })
  }

  const handleConfirm = () => {
    if (!confirmAction || usePillMutation.isPending || sellEquipmentMutation.isPending) {
      return
    }

    if (confirmAction.kind === 'sell') {
      setEquipmentError(null)
      sellEquipmentMutation.execute({
        instanceId: confirmAction.equipmentId,
      })
    } else {
      setPillNotice(null)
      setPillError(null)
      usePillMutation.execute({
        templateId: confirmAction.templateId,
      })
    }
  }

  /** 使用後端商品與冪等鍵購買一枚丹藥。 */
  const handlePurchasePill = (templateId: string): void => {
    if (purchasePillMutation.isPending) {
      return
    }
    setPillNotice(null)
    setPillError(null)
    purchasePillMutation.execute({
      templateId,
      quantity: 1,
    })
  }

  const renderInventory = () => {
    return (
      <Panel eyebrow='INVENTORY' title='背包'>
        <label className='block text-xs text-neutral-500'>
          類型篩選
          <select
            className='mt-2 min-h-10 w-full rounded-md border border-white/12 bg-ink-950 px-3 text-sm text-neutral-200 focus-visible:outline-2 focus-visible:outline-jade-300 sm:w-52'
            onChange={(event) => setInventoryFilter(event.target.value as InventoryFilter)}
            value={inventoryFilter}
          >
            <option value='all'>全部</option>
            <option value='material'>材料</option>
            <option value='pill'>丹藥</option>
            <option value='equipment'>裝備</option>
            <option value='method'>功法</option>
          </select>
        </label>

        {filteredInventory.length > 0 ? (
          <div
            aria-label={`${filteredInventory.length} 組背包物品`}
            className='mt-4 grid max-h-[60vh] gap-2 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2'
          >
            {filteredInventory.map((item) => (
              <div
                className='flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/10 bg-black/15 p-3'
                key={item.id}
              >
                <ItemSummary meta={`${item.type}・${item.templateId}`} name={item.name} quality={item.quality} />
                <span className='shrink-0 tabular-nums text-sm text-neutral-300'>
                  ×{item.quantity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className='mt-4 rounded-md border border-dashed border-white/12 bg-black/10 px-4 py-12 text-center text-sm text-neutral-600'>
            此篩選條件沒有物品。
          </div>
        )}
      </Panel>
    )
  }

  const renderEquipment = () => {
    return (
      <Panel eyebrow='EQUIPMENT INSTANCES' title='裝備'>
        {equipmentNotice ? (
          <p aria-live='polite' className='mb-3 text-sm text-jade-100' role='status'>
            {equipmentNotice}
          </p>
        ) : null}
        {equipmentError ? (
          <p className='mb-3 text-sm text-cinnabar-100' role='alert'>
            {equipmentError}
          </p>
        ) : null}
        {gameState.equipment.length > 0 ? (
          <div className='grid gap-2'>
            {gameState.equipment.map((equipment) => (
              <div
                className='grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'
                key={equipment.id}
              >
                <div className='min-w-0'>
                  <ItemSummary
                    meta={`${equipment.slot}・Instance #${equipment.id.split('-').at(-1)}`}
                    name={equipment.name}
                    quality={equipment.quality}
                  />
                  <p className='mt-2 break-words text-xs leading-5 text-neutral-500'>
                    {equipment.attributes.join('・')}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {equipment.equipped ? <StatusBadge tone='jade'>穿戴中</StatusBadge> : null}
                  {!equipment.equipped ? (
                    <Button
                      className='min-w-0 flex-1 sm:flex-none'
                      onClick={() => setSelectedEquipmentId(equipment.id)}
                      variant='ghost'
                    >
                      查看比較
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='rounded-md border border-dashed border-white/12 px-4 py-12 text-center text-sm text-neutral-600'>
            尚未持有任何裝備 instance。
          </div>
        )}
      </Panel>
    )
  }

  const renderMethods = () => {
    return (
      <Panel eyebrow='CULTIVATION METHODS' title='功法'>
        {methodNotice ? (
          <p aria-live='polite' className='mb-3 text-sm text-jade-100' role='status'>
            {methodNotice}
          </p>
        ) : null}
        {methodError ? (
          <p className='mb-3 text-sm text-cinnabar-100' role='alert'>
            {methodError}
          </p>
        ) : null}
        <div className='grid gap-3'>
          {gameState.cultivationMethods.map((method) => {
            return (
              <div
                className='grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'
                key={method.templateId}
              >
                <div className='min-w-0'>
                  <ItemSummary
                    meta={`最低境界 ${method.minimumRealm}・持有 ${method.quantity.toLocaleString()}`}
                    name={method.name}
                    quality={method.quality}
                  />
                  <p className='mt-2 text-sm text-neutral-400'>
                    修煉速度 × {method.cultivationMultiplier}・突破 +{method.breakthroughBonus}%
                  </p>
                </div>
                <Button
                  className='w-full sm:w-auto'
                  disabled={method.equipped || !method.realmEligible || equipMethodMutation.isPending}
                  isLoading={
                    equipMethodMutation.isPending &&
                    equipMethodMutation.activeIntent?.cultivationMethodTemplateId === method.templateId
                  }
                  onClick={() => handleEquipMethod(method.templateId)}
                  variant={method.equipped ? 'ghost' : 'secondary'}
                >
                  {method.equipped ? '已裝備' : !method.realmEligible ? '境界不足' : '裝備功法'}
                </Button>
              </div>
            )
          })}
        </div>
        {gameState.cultivationMethods.length === 0 ? (
          <p className='text-sm text-neutral-500'>尚未持有可裝備的 V1 功法。</p>
        ) : null}
      </Panel>
    )
  }

  const renderSkills = () => {
    return (
      <div className='grid gap-4'>
        {(['active', 'passive'] as const).map((kind) => (
          <Panel
            eyebrow={kind === 'active' ? 'ACTIVE SKILL' : 'PASSIVE SKILL'}
            key={kind}
            title={kind === 'active' ? '主動技能' : '被動技能'}
          >
            {skillNotice ? (
              <p aria-live='polite' className='mb-3 text-sm text-jade-100' role='status'>
                {skillNotice}
              </p>
            ) : null}
            {skillError ? (
              <p className='mb-3 text-sm text-cinnabar-100' role='alert'>
                {skillError}
              </p>
            ) : null}
            <div className='grid gap-2'>
              {gameState.skills
                .filter((skill) => skill.kind === kind)
                .map((skill) => (
                  <div
                    className='grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'
                    key={skill.templateId}
                  >
                    <div className='min-w-0'>
                      <p className='font-medium text-neutral-200'>{skill.name}</p>
                      <p className='mt-1 break-words text-xs leading-5 text-neutral-500'>{skill.description}</p>
                      <p className='mt-1 text-xs text-jade-100'>靈力消耗 {skill.spiritCost}</p>
                    </div>
                    <Button
                      className='w-full sm:w-auto'
                      disabled={skill.equipped || equipSkillsMutation.isPending}
                      isLoading={equipSkillsMutation.isPending && !skill.equipped}
                      onClick={() => handleEquipSkill(skill.templateId)}
                      variant={skill.equipped ? 'ghost' : 'primary'}
                    >
                      {skill.equipped ? '已配置' : '配置技能'}
                    </Button>
                  </div>
                ))}
            </div>
            {gameState.skills.every((skill) => skill.kind !== kind) ? (
              <p className='text-sm text-neutral-500'>尚未學會此類型技能。</p>
            ) : null}
          </Panel>
        ))}
      </div>
    )
  }

  const renderPills = () => {
    return (
      <Panel eyebrow='PILLS & SHOP' title='丹藥'>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-neutral-500'>
            靈石 <span className='tabular-nums text-gold-100'>{gameState.character.spiritStones.toLocaleString()}</span>
          </p>
          <Button className='w-full sm:w-auto' onClick={() => setIsShopOpen(true)} variant='secondary'>
            開啟丹藥商店
          </Button>
        </div>

        <div className='grid gap-2'>
          {gameState.pills.map((pill) => {
            const isBreakthroughPill = pill.effectTiming === 'breakthrough'
            return (
              <div
                className='grid min-w-0 gap-3 rounded-md border border-white/10 bg-black/15 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'
                key={pill.templateId}
              >
                <div className='min-w-0'>
                  <p className='font-medium text-neutral-200'>
                    {pill.name} <span className='tabular-nums text-neutral-500'>×{pill.quantity}</span>
                  </p>
                  <p className='mt-1 break-words text-xs text-neutral-500'>{pill.effect}</p>
                </div>
                <Button
                  className='w-full sm:w-auto'
                  disabled={pill.quantity <= 0 || pill.effectTiming !== 'instant' || usePillMutation.isPending}
                  onClick={() => {
                    setPillError(null)
                    setConfirmAction({
                      kind: 'usePill',
                      templateId: pill.templateId,
                    })
                  }}
                >
                  {isBreakthroughPill ? '突破時使用' : '使用丹藥'}
                </Button>
              </div>
            )
          })}
        </div>
        {gameState.pills.length === 0 ? <p className='text-sm text-neutral-500'>背包中尚無可顯示的丹藥。</p> : null}
        {pillNotice ? (
          <p aria-live='polite' className='mt-4 text-sm text-jade-100' role='status'>
            {pillNotice}
          </p>
        ) : null}
        {pillError ? (
          <p className='mt-4 text-sm text-cinnabar-100' role='alert'>
            {pillError}
          </p>
        ) : null}
      </Panel>
    )
  }

  const confirmPill =
    confirmAction?.kind === 'usePill'
      ? gameState.pills.find((pill) => pill.templateId === confirmAction.templateId)
      : undefined
  const confirmEquipment =
    confirmAction?.kind === 'sell'
      ? gameState.equipment.find((equipment) => equipment.id === confirmAction.equipmentId)
      : undefined

  return (
    <>
      <div className='grid gap-4'>
        <Tabs
          label='整備內部分頁'
          onChange={(value) => setActiveTab(value as LoadoutTab)}
          options={tabOptions}
          value={activeTab}
        />
        {activeTab === 'inventory' ? renderInventory() : null}
        {activeTab === 'equipment' ? renderEquipment() : null}
        {activeTab === 'methods' ? renderMethods() : null}
        {activeTab === 'skills' ? renderSkills() : null}
        {activeTab === 'pills' ? renderPills() : null}
      </div>

      <Drawer isOpen={Boolean(selectedEquipment)} onClose={closeEquipmentDrawer} title='裝備比較'>
        {selectedEquipment ? (
          <>
            <ItemSummary
              meta={`${selectedEquipment.slot}・Instance #${selectedEquipment.id.split('-').at(-1)}`}
              name={selectedEquipment.name}
              quality={selectedEquipment.quality}
            />
            <div className='mt-4 grid gap-3'>
              <section className='rounded-md border border-jade-400/20 bg-jade-400/[0.05] p-3'>
                <h3 className='text-sm text-jade-100'>選取 instance</h3>
                <ul className='mt-2 grid gap-1 text-xs text-neutral-400'>
                  {selectedEquipment.attributes.map((attribute) => (
                    <li key={attribute}>・{attribute}</li>
                  ))}
                </ul>
              </section>
              {comparisonQuery.isPending ? (
                <p className='text-sm text-neutral-500' role='status'>
                  正在載入後端比較結果…
                </p>
              ) : comparisonQuery.isError ? (
                <p className='text-sm text-cinnabar-100' role='alert'>
                  無法取得裝備比較，請關閉後重試。
                </p>
              ) : comparisonQuery.data ? (
                <section className='rounded-md border border-gold-400/20 bg-gold-400/[0.05] p-3'>
                  <h3 className='text-sm text-gold-100'>派生屬性差異</h3>
                  <ul className='mt-2 grid grid-cols-2 gap-1 text-xs text-neutral-400'>
                    {Object.entries(comparisonQuery.data.data.statDifference)
                      .filter(([, value]) => value !== 0)
                      .map(([stat, value]) => (
                        <li key={stat}>
                          {stat}：{value > 0 ? '+' : ''}
                          {value}
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}
              <section className='rounded-md border border-white/10 bg-black/20 p-3'>
                <h3 className='text-sm text-neutral-300'>目前穿戴</h3>
                {comparedEquipment ? (
                  <>
                    <p className='mt-2 text-xs text-neutral-500'>
                      {comparedEquipment.name}・#
                      {comparedEquipment.id.split('-').at(-1)}
                    </p>
                    <ul className='mt-2 grid gap-1 text-xs text-neutral-500'>
                      {comparedEquipment.attributes.map((attribute) => (
                        <li key={attribute}>・{attribute}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className='mt-2 text-xs text-neutral-600'>此部位目前未穿戴裝備。</p>
                )}
              </section>
            </div>
            <div className='mt-5 grid grid-cols-2 gap-2'>
              <Button
                disabled={selectedEquipment.equipped}
                onClick={() => {
                  setConfirmAction({
                    kind: 'sell',
                    equipmentId: selectedEquipment.id,
                    salePrice: comparisonQuery.data?.data.salePrice ?? 0,
                  })
                  setSelectedEquipmentId(null)
                }}
                variant='danger'
              >
                {selectedEquipment.equipped ? '穿戴中' : '出售'}
              </Button>
              <Button
                disabled={
                  selectedEquipment.equipped ||
                  equipEquipmentMutation.isPending ||
                  comparisonQuery.data?.data.canEquip === false
                }
                isLoading={equipEquipmentMutation.isPending}
                onClick={() => handleEquipEquipment(selectedEquipment)}
              >
                {selectedEquipment.equipped ? '已穿戴' : '穿戴替換'}
              </Button>
            </div>
            {equipmentError ? (
              <p className='mt-3 text-sm text-cinnabar-100' role='alert'>
                {equipmentError}
              </p>
            ) : null}
          </>
        ) : null}
      </Drawer>

      <Drawer isOpen={isShopOpen} onClose={closeShop} title='丹藥商店'>
        <p className='text-xs text-neutral-500'>
          持有靈石{' '}
          <span className='tabular-nums text-gold-100'>
            {(shopPillsQuery.data?.data.spiritStones ?? gameState.character.spiritStones).toLocaleString()}
          </span>
        </p>
        {pillNotice ? (
          <p aria-live='polite' className='mt-3 text-sm text-jade-100' role='status'>
            {pillNotice}
          </p>
        ) : null}
        {pillError ? (
          <p className='mt-3 text-sm text-cinnabar-100' role='alert'>
            {pillError}
          </p>
        ) : null}
        <div className='mt-4 grid gap-3'>
          {shopPillsQuery.data?.data.products.map((pill) => {
            const ownedQuantity = gameState.pills.find((ownedPill) => ownedPill.templateId === pill.id)?.quantity ?? 0
            const canBuy = pill.affordable && pill.realmEligible
            return (
              <div className='rounded-md border border-white/10 bg-black/20 p-3' key={pill.id}>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='text-neutral-200'>{pill.name}</p>
                    <p className='mt-1 break-words text-xs text-neutral-500'>
                      {pill.effects.map((effect) => effect.display).join('、')}
                    </p>
                    <p className='mt-1 text-xs text-neutral-600'>
                      持有 {ownedQuantity.toLocaleString()}・{pill.usableRealmName}可用
                    </p>
                  </div>
                  <span className='shrink-0 tabular-nums text-gold-100'>{pill.price.toLocaleString()}</span>
                </div>
                <Button
                  className='mt-3 w-full'
                  disabled={!canBuy || purchasePillMutation.isPending}
                  isLoading={
                    purchasePillMutation.isPending && purchasePillMutation.activeIntent?.templateId === pill.id
                  }
                  onClick={() => handlePurchasePill(pill.id)}
                  variant={canBuy ? 'secondary' : 'ghost'}
                >
                  {!pill.realmEligible ? '境界不足' : pill.affordable ? '購買一枚' : '靈石不足'}
                </Button>
              </div>
            )
          })}
          {shopPillsQuery.isPending ? (
            <p className='text-sm text-neutral-500' role='status'>
              正在載入後端丹藥商店…
            </p>
          ) : null}
          {shopPillsQuery.isError ? (
            <p className='text-sm text-cinnabar-100' role='alert'>
              {getApiClientError(shopPillsQuery.error).message}
            </p>
          ) : null}
          {shopPillsQuery.data?.data.products.length === 0 ? (
            <p className='text-sm text-neutral-500'>目前沒有可購買的 V1 丹藥。</p>
          ) : null}
        </div>
        <Button className='mt-5 w-full' onClick={closeShop} variant='ghost'>
          關閉商店
        </Button>
      </Drawer>

      <Modal
        isBusy={usePillMutation.isPending || sellEquipmentMutation.isPending}
        isOpen={confirmAction !== null}
        onClose={closeConfirm}
        title={confirmAction?.kind === 'sell' ? '確認出售裝備' : '確認使用丹藥'}
      >
        {confirmEquipment ? (
          <>
            <p>
              出售 {confirmEquipment.name}・#
              {confirmEquipment.id.split('-').at(-1)}
            </p>
            <p className='mt-2 text-gold-100'>
              售價 {confirmAction?.kind === 'sell' ? confirmAction.salePrice.toLocaleString() : '0'} 靈石
            </p>
            {confirmEquipment.quality === '上品' || confirmEquipment.quality === '極品' ? (
              <p className='mt-3 rounded border border-cinnabar-400/25 bg-cinnabar-400/[0.07] p-3 text-xs text-cinnabar-100'>
                這是高品質裝備，出售後無法復原。
              </p>
            ) : null}
            {equipmentError ? (
              <p className='mt-3 text-sm text-cinnabar-100' role='alert'>
                {equipmentError}
              </p>
            ) : null}
          </>
        ) : null}
        {confirmPill ? (
          <>
            <p>使用 {confirmPill.name}？</p>
            <p className='mt-2 text-jade-100'>{confirmPill.effect}</p>
            {pillError ? (
              <p className='mt-3 text-sm text-cinnabar-100' role='alert'>
                {pillError}
              </p>
            ) : null}
          </>
        ) : null}
        <div className='mt-5 grid grid-cols-2 gap-2'>
          <Button
            disabled={usePillMutation.isPending || sellEquipmentMutation.isPending}
            onClick={closeConfirm}
            variant='ghost'
          >
            取消
          </Button>
          <Button
            isLoading={usePillMutation.isPending || sellEquipmentMutation.isPending}
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
