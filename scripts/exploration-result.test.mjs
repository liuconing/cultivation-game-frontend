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
    battleLog: [
      {
        round: 1,
        actorId: 'player',
        targetId: 'enemy',
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
  assert.deepEqual(view.battle?.log, ['命中對手。'])
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
