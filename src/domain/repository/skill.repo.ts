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

/** 配置主動與被動技能需要的 request body。 */
export interface EquipSkillsParams {
  /** 要配置的主動技能 ID。 */
  activeSkillId: ActiveSkillId
  /** 要配置的被動技能 ID。 */
  passiveSkillId: PassiveSkillId
}

/** 技能配置完成後的結果。 */
export interface EquipSkillsData {
  /** 結算後配置的主動技能 ID。 */
  equippedActiveSkillId: ActiveSkillId
  /** 結算後配置的被動技能 ID。 */
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
