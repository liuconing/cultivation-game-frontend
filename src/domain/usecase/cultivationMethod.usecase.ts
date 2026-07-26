import { equipCultivationMethod } from '../repository'
import type {
  EquipCultivationMethodParams,
  EquipCultivationMethodRes,
  MutationOptions,
} from '../repository'

export interface EquipCultivationMethodDto extends EquipCultivationMethodRes {}
export interface EquipCultivationMethodParamsDto extends EquipCultivationMethodParams {}

/** 裝備指定功法。 */
export const equipCultivationMethodUsecase = (
  params: EquipCultivationMethodParamsDto,
  options: MutationOptions,
): Promise<EquipCultivationMethodDto> =>
  equipCultivationMethod(params, options)
