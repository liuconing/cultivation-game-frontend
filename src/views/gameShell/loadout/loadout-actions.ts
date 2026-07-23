import type {
  ActiveSkillId,
  EquipSkillsParams,
  PassiveSkillId,
} from '@/domain/repository'
import type { MockSkill } from '@/data/gameMock'

/** 依欲更換的技能建立同時包含兩個槽位的後端請求。 */
export const createEquipSkillsParams = (
  skills: MockSkill[],
  selectedSkillId: string,
): EquipSkillsParams | null => {
  const selected = skills.find(
    (skill) => skill.templateId === selectedSkillId,
  )
  if (!selected) {
    return null
  }

  const activeSkillId =
    selected.kind === 'active'
      ? selected.templateId
      : skills.find(
          (skill) => skill.kind === 'active' && skill.equipped,
        )?.templateId
  const passiveSkillId =
    selected.kind === 'passive'
      ? selected.templateId
      : skills.find(
          (skill) => skill.kind === 'passive' && skill.equipped,
        )?.templateId

  if (!activeSkillId || !passiveSkillId) {
    return null
  }

  return {
    activeSkillId: activeSkillId as ActiveSkillId,
    passiveSkillId: passiveSkillId as PassiveSkillId,
  }
}
