import { menuItems, resources } from '@/data/gameMock'

/** 首頁畫面所需的資料模型。 */
export interface IHomeViewModel {
  /** 側邊選單項目。 */
  menuItems: typeof menuItems
  /** 頂部資源列資料。 */
  resources: typeof resources
}

/**
 * 提供首頁畫面所需的選單與資源資料。
 *
 * @returns 首頁的選單項目與資源列表。
 */
export function useHomeViewModel(): IHomeViewModel {
  return { menuItems, resources }
}
