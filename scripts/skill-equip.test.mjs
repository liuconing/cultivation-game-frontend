import assert from 'node:assert/strict'
import test from 'node:test'
import { createEquipSkillsParams } from '../src/views/gameShell/loadout/loadout-actions.ts'

const skills = [
  {
    templateId: 'skill_spirit_slash',
    name: '斬靈',
    kind: 'active',
    spiritCost: 10,
    description: '',
    equipped: true,
  },
  {
    templateId: 'skill_rejuvenation',
    name: '回春',
    kind: 'active',
    spiritCost: 20,
    description: '',
    equipped: false,
  },
  {
    templateId: 'skill_focus_art',
    name: '凝神',
    kind: 'passive',
    spiritCost: 0,
    description: '',
    equipped: true,
  },
]

test('更換主動技能時會連同既有被動技能提交', () => {
  assert.deepEqual(
    createEquipSkillsParams(skills, 'skill_rejuvenation'),
    {
      activeSkillId: 'skill_rejuvenation',
      passiveSkillId: 'skill_focus_art',
    },
  )
})

test('缺少另一個槽位時不建立無效請求', () => {
  assert.equal(
    createEquipSkillsParams(
      skills.filter((skill) => skill.kind === 'active'),
      'skill_rejuvenation',
    ),
    null,
  )
})
