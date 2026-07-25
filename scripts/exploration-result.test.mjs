import assert from 'node:assert/strict'
import test from 'node:test'
import { createExplorationResultView } from '../src/views/gameShell/explore/exploration-result.adapter.ts'

const characterAfter = {
  realm: 'qi_condensation',
  minorRealm: 'early',
  cultivation: 100,
  spiritStones: 20,
  spiritualRootEssence: 0,
  stats: {
    attack: 10,
    defense: 5,
    maxHp: 100,
    currentHp: 80,
    maxMp: 50,
    currentMp: 30,
    mpRegen: 1,
    speed: 1,
    critRate: 0,
    critDamage: 1.5,
    critResist: 0,
    dodgeRate: 0,
    hitRate: 100,
    luck: 0,
  },
}

test('戰鬥 DTO 會轉成既有結果層並保留後端訊息', () => {
  const view = createExplorationResultView({
    seedReference: 'seed',
    eventType: 'battle',
    result: 'win',
    battleSummary: {
      result: 'win',
      reason: 'defeated',
      rounds: 1,
      player: {
        id: 'player',
        name: '測試角色',
        realm: 'qi_condensation',
        before: { ...characterAfter.stats, currentHp: 100 },
        after: characterAfter.stats,
      },
      enemy: {
        id: 'enemy',
        name: '山林鬼物',
        realm: 'qi_condensation',
        before: { ...characterAfter.stats, currentHp: 10 },
        after: { ...characterAfter.stats, currentHp: 0 },
      },
    },
    battleLog: [
      {
        round: 1,
        actorId: 'player',
        actorName: '測試角色',
        targetId: 'enemy',
        targetName: '山林鬼物',
        action: 'attack',
        hit: true,
        critical: false,
        damage: 10,
        targetHp: 0,
        message: '命中對手。',
      },
    ],
    rewards: [{ type: 'cultivation', amount: 10 }],
    createdEquipment: [],
    characterAfter,
  })

  assert.equal(view.kind, 'battle')
  assert.equal(view.battle?.result, 'victory')
  assert.equal(view.battle?.enemyName, '山林鬼物')
  assert.equal(view.battle?.enemyHealthRemaining, 0)
  assert.deepEqual(view.battle?.log, [
    {
      round: 1,
      actorName: '測試角色',
      targetName: '山林鬼物',
      message: '命中對手。',
      hit: true,
      critical: false,
      damage: 10,
      targetHp: 0,
    },
  ])
})

test('戰敗顯示權威敵方生命並區分返回洞府後狀態', () => {
  const view = createExplorationResultView({
    seedReference: 'loss-seed',
    eventType: 'battle',
    result: 'loss',
    battleSummary: {
      result: 'loss',
      reason: 'defeated',
      rounds: 7,
      player: {
        id: 'player',
        name: '測試玩家',
        realm: 'qi_condensation',
        before: { ...characterAfter.stats, currentHp: 100 },
        after: { ...characterAfter.stats, currentHp: 0 },
      },
      enemy: {
        id: 'enemy',
        name: '凡俗山林鬼物',
        realm: 'qi_condensation',
        before: { ...characterAfter.stats, currentHp: 90 },
        after: { ...characterAfter.stats, currentHp: 47 },
      },
    },
    battleLog: [
      {
        round: 7,
        actorId: 'enemy',
        actorName: '凡俗山林鬼物',
        targetId: 'player',
        targetName: '測試玩家',
        action: 'attack',
        hit: true,
        critical: false,
        damage: 9,
        targetHp: 0,
        message: '凡俗山林鬼物對測試玩家造成 9 點傷害。',
      },
    ],
    rewards: [],
    createdEquipment: [],
    characterAfter: {
      ...characterAfter,
      stats: {
        ...characterAfter.stats,
        currentHp: 30,
        currentMp: 15,
      },
    },
  })

  assert.equal(view.battle?.result, 'defeat')
  assert.equal(view.battle?.enemyName, '凡俗山林鬼物')
  assert.equal(view.battle?.enemyHealthRemaining, 47)
  assert.equal(view.battle?.healthRemaining, 0)
  assert.equal(view.battle?.settledHealthRemaining, 30)
  assert.equal(view.battle?.settledSpiritRemaining, 15)
})

test('回合上限與舊版缺少摘要時採安全降級', () => {
  const turnLimit = createExplorationResultView({
    seedReference: 'turn-limit',
    eventType: 'battle',
    result: 'loss',
    battleSummary: {
      result: 'loss',
      reason: 'turn_limit',
      rounds: 30,
      player: {
        id: 'player',
        name: '測試玩家',
        realm: 'qi_condensation',
        before: characterAfter.stats,
        after: characterAfter.stats,
      },
      enemy: {
        id: 'enemy',
        name: '耐久妖獸',
        realm: 'qi_condensation',
        before: characterAfter.stats,
        after: characterAfter.stats,
      },
    },
    battleLog: [],
    rewards: [],
    createdEquipment: [],
    characterAfter,
  })
  const legacy = createExplorationResultView({
    seedReference: 'legacy',
    eventType: 'battle',
    result: 'loss',
    battleLog: [
      {
        round: 1,
        actorId: 'enemy',
        actorName: '舊版敵人',
        targetId: 'player',
        targetName: '測試玩家',
        action: 'attack',
        hit: true,
        critical: false,
        damage: 10,
        targetHp: 0,
        message: '舊版敵人命中。',
      },
    ],
    rewards: [],
    createdEquipment: [],
    characterAfter,
  })

  assert.equal(turnLimit.battle?.result, 'turn-limit')
  assert.equal(turnLimit.title, '回合上限')
  assert.equal(legacy.battle?.enemyName, '戰鬥摘要未提供')
  assert.equal(legacy.battle?.enemyHealthRemaining, undefined)
  assert.equal(legacy.battle?.hasAuthoritativeSummary, false)
})

test('非戰鬥事件會安全降級而不建立假戰鬥', () => {
  const view = createExplorationResultView({
    seedReference: 'seed',
    eventType: 'empty',
    result: 'none',
    rewards: [],
    createdEquipment: [],
    characterAfter,
  })

  assert.equal(view.kind, 'event')
  assert.equal(view.battle, null)
  assert.ok(view.eventMessage.length > 0)
})
