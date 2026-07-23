import { upgradeSpiritualRoot } from '../repository'
import type {
  MutationOptions,
  UpgradeSpiritualRootRes,
} from '../repository'

export type UpgradeSpiritualRootDto = UpgradeSpiritualRootRes

/** 提升靈根品質。 */
export const upgradeSpiritualRootUsecase = (
  options: MutationOptions,
): Promise<UpgradeSpiritualRootDto> => upgradeSpiritualRoot(options)
