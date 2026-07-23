import {
  breakthrough,
  getBreakthroughPreview,
} from '../repository'
import type {
  BreakthroughParams,
  BreakthroughPreviewParams,
  BreakthroughPreviewRes,
  BreakthroughRes,
  MutationOptions,
} from '../repository'

export type BreakthroughDto = BreakthroughRes
export type BreakthroughParamsDto = BreakthroughParams
export type BreakthroughPreviewDto = BreakthroughPreviewRes
export type BreakthroughPreviewParamsDto =
  BreakthroughPreviewParams

/** 讀取目前角色在指定丹藥選擇下的突破預覽。 */
export const getBreakthroughPreviewUsecase = (
  params: BreakthroughPreviewParamsDto = {},
): Promise<BreakthroughPreviewDto> =>
  getBreakthroughPreview(params)

/** 嘗試突破目前境界。 */
export const breakthroughUsecase = (
  params: BreakthroughParamsDto,
  options: MutationOptions,
): Promise<BreakthroughDto> => breakthrough(params, options)
