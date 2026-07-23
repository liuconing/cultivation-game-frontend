import {
  compareEquipment,
  equipEquipment,
  sellEquipment,
} from '../repository'
import type {
  CompareEquipmentRes,
  EquipmentInstanceParams,
  EquipEquipmentRes,
  MutationOptions,
  SellEquipmentRes,
} from '../repository'

export type CompareEquipmentDto = CompareEquipmentRes
export type EquipEquipmentDto = EquipEquipmentRes
export type SellEquipmentDto = SellEquipmentRes
export type EquipmentInstanceParamsDto = EquipmentInstanceParams

/** 取得裝備比較結果。 */
export const compareEquipmentUsecase = (
  instanceId: string,
): Promise<CompareEquipmentDto> => compareEquipment(instanceId)

/** 穿戴指定裝備。 */
export const equipEquipmentUsecase = (
  params: EquipmentInstanceParamsDto,
  options: MutationOptions,
): Promise<EquipEquipmentDto> => equipEquipment(params, options)

/** 出售指定裝備。 */
export const sellEquipmentUsecase = (
  params: EquipmentInstanceParamsDto,
  options: MutationOptions,
): Promise<SellEquipmentDto> => sellEquipment(params, options)
