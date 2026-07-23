import { equipCultivationMethod } from '../repository'
import type {
  EquipCultivationMethodParams,
  EquipCultivationMethodRes,
  MutationOptions,
} from '../repository'

export type EquipCultivationMethodDto = EquipCultivationMethodRes
export type EquipCultivationMethodParamsDto = EquipCultivationMethodParams

/** 裝備指定功法。 */
export const equipCultivationMethodUsecase = (
  params: EquipCultivationMethodParamsDto,
  options: MutationOptions,
): Promise<EquipCultivationMethodDto> =>
  equipCultivationMethod(params, options)
