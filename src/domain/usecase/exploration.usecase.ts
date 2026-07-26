import { explore } from '../repository'
import type {
  ExploreParams,
  ExploreRes,
  MutationOptions,
} from '../repository'

export interface ExploreDto extends ExploreRes {}
export interface ExploreParamsDto extends ExploreParams {}

/** 進行一次地圖探索。 */
export const exploreUsecase = (
  params: ExploreParamsDto,
  options: MutationOptions,
): Promise<ExploreDto> => explore(params, options)
