import { equipSkills } from '../repository'
import type {
  EquipSkillsParams,
  EquipSkillsRes,
  MutationOptions,
} from '../repository'

export interface EquipSkillsDto extends EquipSkillsRes {}
export interface EquipSkillsParamsDto extends EquipSkillsParams {}

/** 配置主動與被動技能。 */
export const equipSkillsUsecase = (
  params: EquipSkillsParamsDto,
  options: MutationOptions,
): Promise<EquipSkillsDto> => equipSkills(params, options)
