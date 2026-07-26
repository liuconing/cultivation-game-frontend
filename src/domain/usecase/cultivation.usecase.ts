import { claimCultivation } from '../repository'
import type { ClaimCultivationRes, MutationOptions, ExplorationData } from '../repository'

export interface ClaimCultivationDto extends ClaimCultivationRes {}

export interface ExplorationDataDtp extends ExplorationData {}

/** 領取離線修為。 */
export const claimCultivationUsecase = (options: MutationOptions): Promise<ClaimCultivationDto> =>
  claimCultivation(options)
