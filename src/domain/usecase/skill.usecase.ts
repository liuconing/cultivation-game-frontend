import { equipSkills } from '../repository'
import type {
  EquipSkillsParams,
  EquipSkillsRes,
  MutationOptions,
} from '../repository'

export type EquipSkillsDto = EquipSkillsRes
export type EquipSkillsParamsDto = EquipSkillsParams

/** 配置主動與被動技能。 */
export const equipSkillsUsecase = (
  params: EquipSkillsParamsDto,
  options: MutationOptions,
): Promise<EquipSkillsDto> => equipSkills(params, options)
