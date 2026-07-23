import { useLocation } from 'react-router'

export interface IMockDestinationViewModel {
  eyebrow: string
  title: string
  description: string
  targetRoute: string
}

/** 依成功導向路徑提供尚未實作頁面的示意內容。 */
export function useMockDestinationViewModel(): IMockDestinationViewModel {
  const location = useLocation()
  const isCharacterCreation =
    location.pathname === '/character/create'

  return {
    eyebrow: isCharacterCreation
      ? 'UI-03 PLACEHOLDER'
      : 'UI-04 PLACEHOLDER',
    title: isCharacterCreation ? '角色建立流程' : '遊戲修煉框架',
    description: isCharacterCreation
      ? 'Mock 登入成功，後端角色檢查結果為尚無角色。UI-03 將在下一批建立此頁。'
      : 'Mock 登入成功，後端角色檢查結果為已有角色。UI-04 將建立正式遊戲主框架。',
    targetRoute: location.pathname,
  }
}
