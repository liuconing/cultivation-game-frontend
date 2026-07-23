import { completeRest } from '../repository'
import type { CompleteRestRes, MutationOptions } from '../repository'

export type CompleteRestDto = CompleteRestRes

/** 立即完成休養。 */
export const completeRestUsecase = (
  options: MutationOptions,
): Promise<CompleteRestDto> => completeRest(options)
