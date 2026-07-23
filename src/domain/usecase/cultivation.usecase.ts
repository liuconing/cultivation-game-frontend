import { claimCultivation } from '../repository'
import type { ClaimCultivationRes, MutationOptions } from '../repository'

export type ClaimCultivationDto = ClaimCultivationRes

/** 領取離線修為。 */
export const claimCultivationUsecase = (
  options: MutationOptions,
): Promise<ClaimCultivationDto> => claimCultivation(options)
