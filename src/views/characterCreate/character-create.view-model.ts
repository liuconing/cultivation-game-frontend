import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'
import { useNavigate } from 'react-router'
import {
  characterCreationScenarioOptions,
  characterGenderOptions,
  createMockCharacter,
  spiritualRootOptions,
  validateCharacterCreation,
  type CharacterCreationErrors,
  type CharacterCreationScenario,
  type CharacterCreationValues,
  type MockCreatedCharacter,
} from '@/data/characterCreationMock'

type CharacterCreateScreen = 'form' | 'result'

export interface ICharacterCreateViewModel {
  screen: CharacterCreateScreen
  values: CharacterCreationValues
  errors: CharacterCreationErrors
  notice: string | null
  scenario: CharacterCreationScenario
  scenarioOptions: typeof characterCreationScenarioOptions
  genderOptions: typeof characterGenderOptions
  spiritualRootOptions: typeof spiritualRootOptions
  result: MockCreatedCharacter | null
  isSubmitting: boolean
  nameRef: RefObject<HTMLInputElement | null>
  genderRef: RefObject<HTMLFieldSetElement | null>
  spiritualRootRef: RefObject<HTMLFieldSetElement | null>
  handleNameChange: (name: string) => void
  handleGenderChange: (
    gender: CharacterCreationValues['gender'],
  ) => void
  handleSpiritualRootChange: (
    spiritualRootType: CharacterCreationValues['spiritualRootType'],
  ) => void
  handleScenarioChange: (
    scenario: CharacterCreationScenario,
  ) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  handleResetResult: () => void
  handleEnterGame: () => void
}

const initialValues: CharacterCreationValues = {
  name: '青玄',
  gender: 'unknown',
  spiritualRootType: 'metal',
}

/** 管理角色建立與靈根結果的純記憶體 Mock。 */
export function useCharacterCreateViewModel(): ICharacterCreateViewModel {
  const navigate = useNavigate()
  const [screen, setScreen] =
    useState<CharacterCreateScreen>('form')
  const [values, setValues] =
    useState<CharacterCreationValues>(initialValues)
  const [errors, setErrors] = useState<CharacterCreationErrors>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [scenario, setScenario] =
    useState<CharacterCreationScenario>('successMiddle')
  const [result, setResult] =
    useState<MockCreatedCharacter | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const genderRef = useRef<HTMLFieldSetElement>(null)
  const spiritualRootRef = useRef<HTMLFieldSetElement>(null)
  const submitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current)
      }
    }
  }, [])

  const focusFirstError = (fieldErrors: CharacterCreationErrors) => {
    if (fieldErrors.name) {
      nameRef.current?.focus()
    } else if (fieldErrors.gender) {
      genderRef.current?.focus()
    } else if (fieldErrors.spiritualRootType) {
      spiritualRootRef.current?.focus()
    }
  }

  const completeMockSubmit = () => {
    setIsSubmitting(false)

    if (scenario === 'validationError') {
      const mockErrors = {
        name: '此姓名未通過 Mock 欄位驗證。',
      }
      setErrors(mockErrors)
      setNotice('角色資料有誤，請修正標示欄位。')
      window.requestAnimationFrame(() => {
        nameRef.current?.focus()
      })
      return
    }

    if (scenario === 'duplicate') {
      setNotice('此帳號已有角色，不能重複建立。')
      return
    }

    if (scenario === 'submitFailure') {
      setNotice('Mock 建立失敗，輸入內容已保留，請稍後重試。')
      return
    }

    const createdCharacter = createMockCharacter(values, scenario)
    setResult(createdCharacter)
    setScreen('result')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const fieldErrors = validateCharacterCreation(values)
    setErrors(fieldErrors)
    setNotice(null)

    if (Object.keys(fieldErrors).length > 0) {
      focusFirstError(fieldErrors)
      return
    }

    setIsSubmitting(true)
    submitTimerRef.current = window.setTimeout(
      completeMockSubmit,
      550,
    )
  }

  return {
    screen,
    values,
    errors,
    notice,
    scenario,
    scenarioOptions: characterCreationScenarioOptions,
    genderOptions: characterGenderOptions,
    spiritualRootOptions,
    result,
    isSubmitting,
    nameRef,
    genderRef,
    spiritualRootRef,
    handleNameChange: (name) => {
      setValues((currentValues) => ({ ...currentValues, name }))
      setErrors((currentErrors) => ({
        ...currentErrors,
        name: undefined,
      }))
      setNotice(null)
    },
    handleGenderChange: (gender) => {
      setValues((currentValues) => ({ ...currentValues, gender }))
      setErrors((currentErrors) => ({
        ...currentErrors,
        gender: undefined,
      }))
      setNotice(null)
    },
    handleSpiritualRootChange: (spiritualRootType) => {
      setValues((currentValues) => ({
        ...currentValues,
        spiritualRootType,
      }))
      setErrors((currentErrors) => ({
        ...currentErrors,
        spiritualRootType: undefined,
      }))
      setNotice(null)
    },
    handleScenarioChange: setScenario,
    handleSubmit,
    handleResetResult: () => {
      setScreen('form')
      setResult(null)
      setNotice(null)
    },
    handleEnterGame: () => {
      navigate('/game/cultivation')
    },
  }
}
