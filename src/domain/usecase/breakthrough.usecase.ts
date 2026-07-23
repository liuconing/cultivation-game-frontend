import { breakthrough } from '../repository'
import type {
  BreakthroughParams,
  BreakthroughRes,
  MutationOptions,
} from '../repository'

export type BreakthroughDto = BreakthroughRes
export type BreakthroughParamsDto = BreakthroughParams

/** 嘗試突破目前境界。 */
export const breakthroughUsecase = (
  params: BreakthroughParamsDto,
  options: MutationOptions,
): Promise<BreakthroughDto> => breakthrough(params, options)
