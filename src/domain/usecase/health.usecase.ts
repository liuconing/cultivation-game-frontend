import { getHealth } from '../repository'
import type { GetHealthRes } from '../repository'

/** 取得健康狀態 DTO。 */
export type GetHealthDto = GetHealthRes

/**
 * 取得後端健康狀態。
 *
 * @returns 健康狀態 DTO。
 */
export const getHealthUsecase = async (): Promise<GetHealthDto> => {
  return getHealth()
}
