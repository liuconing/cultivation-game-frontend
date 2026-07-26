import { getGameState } from '../repository'
import type { GetGameStateRes } from '../repository'

export interface GetGameStateDto extends GetGameStateRes {}

/** 取得完整遊戲狀態。 */
export const getGameStateUsecase = (): Promise<GetGameStateDto> =>
  getGameState()
