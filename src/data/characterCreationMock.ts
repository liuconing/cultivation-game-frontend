export type CharacterGender = 'male' | 'female' | 'none' | 'unknown'

export type SpiritualRootType =
  | 'metal'
  | 'wood'
  | 'water'
  | 'fire'
  | 'earth'
  | 'thunder'
  | 'wind'
  | 'ice'

export type SpiritualRootQuality =
  | 'low'
  | 'middle'
  | 'high'
  | 'earth'
  | 'heaven'

export type CharacterCreationScenario =
  | 'successLow'
  | 'successMiddle'
  | 'successHigh'
  | 'successEarth'
  | 'successHeaven'
  | 'validationError'
  | 'duplicate'
  | 'submitFailure'

export type CharacterCreationValues = {
  name: string
  gender: CharacterGender
  spiritualRootType: SpiritualRootType
}

export type CharacterCreationErrors = Partial<
  Record<keyof CharacterCreationValues, string>
>

export type MockCreatedCharacter = CharacterCreationValues & {
  id: string
  spiritualRootQuality: SpiritualRootQuality
  realm: 'qi_condensation'
  minorRealm: 'early'
  cultivation: 0
  spiritStones: 0
  maxHp: 100
  maxMp: 50
}

export const characterGenderOptions: Array<{
  value: CharacterGender
  label: string
  description: string
}> = [
  { value: 'male', label: '男', description: '以男性身份行走仙途' },
  { value: 'female', label: '女', description: '以女性身份行走仙途' },
  { value: 'none', label: '無', description: '不受性別之相所限' },
  { value: 'unknown', label: '不公開', description: '不顯示角色性別' },
]

export const spiritualRootOptions: Array<{
  value: SpiritualRootType
  label: string
  symbol: string
  description: string
}> = [
  { value: 'metal', label: '金靈根', symbol: '金', description: '銳利堅毅' },
  { value: 'wood', label: '木靈根', symbol: '木', description: '生生不息' },
  { value: 'water', label: '水靈根', symbol: '水', description: '綿長靈動' },
  { value: 'fire', label: '火靈根', symbol: '火', description: '熾烈迅猛' },
  { value: 'earth', label: '土靈根', symbol: '土', description: '厚重穩固' },
  { value: 'thunder', label: '雷靈根', symbol: '雷', description: '剛猛果決' },
  { value: 'wind', label: '風靈根', symbol: '風', description: '飄逸無形' },
  { value: 'ice', label: '冰靈根', symbol: '冰', description: '清寒凝練' },
]

export const spiritualRootQualityLabels: Record<
  SpiritualRootQuality,
  string
> = {
  low: '下品',
  middle: '中品',
  high: '上品',
  earth: '地品',
  heaven: '天品',
}

export const characterCreationScenarioOptions: Array<{
  value: CharacterCreationScenario
  label: string
}> = [
  { value: 'successLow', label: '成功・下品靈根' },
  { value: 'successMiddle', label: '成功・中品靈根' },
  { value: 'successHigh', label: '成功・上品靈根' },
  { value: 'successEarth', label: '成功・地品靈根' },
  { value: 'successHeaven', label: '成功・天品靈根' },
  { value: 'validationError', label: '欄位驗證失敗' },
  { value: 'duplicate', label: '角色已存在' },
  { value: 'submitFailure', label: '建立失敗' },
]

const scenarioQualityMap: Record<
  Exclude<
    CharacterCreationScenario,
    'validationError' | 'duplicate' | 'submitFailure'
  >,
  SpiritualRootQuality
> = {
  successLow: 'low',
  successMiddle: 'middle',
  successHigh: 'high',
  successEarth: 'earth',
  successHeaven: 'heaven',
}

/** 驗證角色建立表單，不接受靈根品質欄位。 */
export function validateCharacterCreation(
  values: CharacterCreationValues,
): CharacterCreationErrors {
  const errors: CharacterCreationErrors = {}
  const nameLength = Array.from(values.name.trim()).length

  if (nameLength === 0) {
    errors.name = '請輸入角色姓名。'
  } else if (nameLength > 12) {
    errors.name = '角色姓名不可超過 12 字。'
  }

  if (!values.gender) {
    errors.gender = '請選擇性別。'
  }

  if (!values.spiritualRootType) {
    errors.spiritualRootType = '請選擇靈根。'
  }

  return errors
}

/** 依成功情境產生固定且可重現的角色結果。 */
export function createMockCharacter(
  values: CharacterCreationValues,
  scenario: CharacterCreationScenario,
): MockCreatedCharacter | null {
  if (
    scenario === 'validationError' ||
    scenario === 'duplicate' ||
    scenario === 'submitFailure'
  ) {
    return null
  }

  return {
    id: 'character-mock-001',
    ...values,
    name: values.name.trim(),
    spiritualRootQuality: scenarioQualityMap[scenario],
    realm: 'qi_condensation',
    minorRealm: 'early',
    cultivation: 0,
    spiritStones: 0,
    maxHp: 100,
    maxMp: 50,
  }
}
