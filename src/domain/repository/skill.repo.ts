import { apiClient } from '@/lib/axios'
import {
  createMutationHeaders,
  type ApiSuccess,
  type MutationOptions,
} from './common'
import { apiEndpoints } from './endpoints'

export type ActiveSkillId =
  | 'skill_spirit_slash'
  | 'skill_rejuvenation'
  | 'skill_frost_art'
export type PassiveSkillId =
  | 'skill_focus_art'
  | 'skill_iron_bone'
  | 'skill_breaking_army'

export interface EquipSkillsParams {
  activeSkillId: ActiveSkillId
  passiveSkillId: PassiveSkillId
}

export interface EquipSkillsData {
  equippedActiveSkillId: ActiveSkillId
  equippedPassiveSkillId: PassiveSkillId
}

export type EquipSkillsRes = ApiSuccess<EquipSkillsData>

/** 配置角色的主動與被動技能。 */
export const equipSkills = async (
  params: EquipSkillsParams,
  options: MutationOptions,
): Promise<EquipSkillsRes> => {
  const { data } = await apiClient.post<EquipSkillsRes>(
    apiEndpoints.equipSkills.path(),
    params,
    { headers: createMutationHeaders(options) },
  )

  return data
}
