import { completeRest } from '../repository'
import type { CompleteRestRes, MutationOptions } from '../repository'

export interface CompleteRestDto extends CompleteRestRes {}

/** 立即完成休養。 */
export const completeRestUsecase = (
  options: MutationOptions,
): Promise<CompleteRestDto> => completeRest(options)
