import { breakthrough, getBreakthroughPreview } from '../repository'
import type {
  BreakthroughParams,
  BreakthroughPreviewParams,
  BreakthroughPreviewRes,
  BreakthroughChanceBreakdown,
  BreakthroughRes,
  MutationOptions,
} from '../repository'

export interface BreakthroughDto extends BreakthroughRes {}
export interface BreakthroughParamsDto extends BreakthroughParams {}
export interface BreakthroughPreviewDto extends BreakthroughPreviewRes {}
export interface BreakthroughPreviewParamsDto extends BreakthroughPreviewParams {}
export interface BreakthroughChanceBreakdownDto extends BreakthroughChanceBreakdown {}

/** 讀取目前角色在指定丹藥選擇下的突破預覽。 */
export const getBreakthroughPreviewUsecase = (
  params: BreakthroughPreviewParamsDto = {},
): Promise<BreakthroughPreviewDto> => getBreakthroughPreview(params)

/** 嘗試突破目前境界。 */
export const breakthroughUsecase = (
  params: BreakthroughParamsDto,
  options: MutationOptions,
): Promise<BreakthroughDto> => breakthrough(params, options)
