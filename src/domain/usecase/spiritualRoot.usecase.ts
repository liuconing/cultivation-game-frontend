import { upgradeSpiritualRoot } from '../repository'
import type {
  MutationOptions,
  UpgradeSpiritualRootRes,
} from '../repository'

export interface UpgradeSpiritualRootDto extends UpgradeSpiritualRootRes {}

/** 提升靈根品質。 */
export const upgradeSpiritualRootUsecase = (
  options: MutationOptions,
): Promise<UpgradeSpiritualRootDto> => upgradeSpiritualRoot(options)
