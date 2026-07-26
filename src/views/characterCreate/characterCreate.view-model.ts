import { useRef, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'
import { createCharacterUsecase } from '@/domain'
import type { CharacterResponse } from '@/domain/repository'
import {
  characterGenderOptions,
  createCharacterRequest,
  spiritualRootOptions,
  validateCharacterCreation,
  type CharacterCreationErrors,
  type CharacterCreationValues,
  type CharacterGender,
  type SpiritualRootType,
} from '@/data/characterCreationMock'
import { useMutation } from '@/hook'
import { getApiClientError } from '@/lib/axios'
import { uuid } from '@/lib/uuid'
import { useSession } from '@/session'

type CharacterCreateScreen = 'form' | 'result'

/** 建立角色 mutation 所需的完整參數。 */
interface CreateCharacterMutationParams {
  /** 僅包含後端允許欄位的角色建立資料。 */
  values: CharacterCreationValues
  /** 本次建立操作固定使用的冪等鍵。 */
  idempotencyKey: string
}

const initialValues: CharacterCreationValues = {
  name: '',
  gender: 'unknown',
  spiritualRootType: 'metal',
}

/** 管理角色建立表單、正式 API 與後端結果。 */
export function useCharacterCreateViewModel() {
  const navigate = useNavigate()
  const { reloadSession } = useSession()
  const [screen, setScreen] = useState<CharacterCreateScreen>('form')
  const [values, setValues] = useState<CharacterCreationValues>(initialValues)
  const [errors, setErrors] = useState<CharacterCreationErrors>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [result, setResult] = useState<CharacterResponse | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const genderRef = useRef<HTMLFieldSetElement>(null)
  const spiritualRootRef = useRef<HTMLFieldSetElement>(null)

  /**
   * 將焦點移至第一個角色欄位錯誤。
   *
   * @param fieldErrors - 目前表單欄位錯誤。
   */
  const focusFirstError = (fieldErrors: CharacterCreationErrors): void => {
    if (fieldErrors.name) {
      nameRef.current?.focus()
    } else if (fieldErrors.gender) {
      genderRef.current?.focus()
    } else if (fieldErrors.spiritualRootType) {
      spiritualRootRef.current?.focus()
    }
  }

  const createCharacterMutation = useMutation(
    ({ values: requestValues, idempotencyKey }: CreateCharacterMutationParams) =>
      createCharacterUsecase(createCharacterRequest(requestValues), {
        idempotencyKey,
      }),
    {
      onSuccess: (response) => {
        setResult(response.data.character)
        setScreen('result')
        setNotice(null)
      },
      onError: (error) => {
        const apiError = getApiClientError(error)
        setNotice(
          apiError.code === 'CHARACTER_ALREADY_EXISTS'
            ? '此帳號已建立角色，請重新載入帳號狀態後再試。'
            : apiError.code === 'VALIDATION_ERROR'
              ? '角色資料格式不正確，請檢查欄位後再試。'
              : apiError.message,
        )
        window.requestAnimationFrame(() => nameRef.current?.focus())
      },
    },
  )

  /**
   * 驗證並送出正式角色建立請求。
   *
   * @param event - React 表單送出事件。
   */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (createCharacterMutation.isPending) {
      return
    }

    const fieldErrors = validateCharacterCreation(values)
    setErrors(fieldErrors)
    setNotice(null)

    if (Object.keys(fieldErrors).length > 0) {
      focusFirstError(fieldErrors)
      return
    }

    createCharacterMutation.mutate({
      values,
      idempotencyKey: uuid(),
    })
  }

  return {
    /** 目前顯示表單或建立結果。 */
    screen,
    /** 使用者輸入的角色資料。 */
    values,
    /** 各角色欄位的驗證錯誤。 */
    errors,
    /** 建立失敗或提示訊息。 */
    notice,
    /** 可選性別清單。 */
    genderOptions: characterGenderOptions,
    /** 可選靈根清單。 */
    spiritualRootOptions,
    /** 後端建立完成的正式角色。 */
    result,
    /** 是否正在送出建立請求。 */
    isSubmitting: createCharacterMutation.isPending,
    /** 角色姓名輸入欄位 ref。 */
    nameRef,
    /** 性別欄位群組 ref。 */
    genderRef,
    /** 靈根欄位群組 ref。 */
    spiritualRootRef,
    /** 更新角色姓名。 */
    handleNameChange: (name: string) => {
      setValues((currentValues) => ({ ...currentValues, name }))
      setErrors((currentErrors) => ({
        ...currentErrors,
        name: undefined,
      }))
      setNotice(null)
    },
    /** 更新角色性別。 */
    handleGenderChange: (gender: CharacterGender) => {
      setValues((currentValues) => ({ ...currentValues, gender }))
      setErrors((currentErrors) => ({
        ...currentErrors,
        gender: undefined,
      }))
      setNotice(null)
    },
    /** 更新角色靈根類型。 */
    handleSpiritualRootChange: (spiritualRootType: SpiritualRootType) => {
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
    /** 驗證並送出角色建立表單。 */
    handleSubmit,
    /** 重新同步 Session 後進入遊戲。 */
    handleEnterGame: () => {
      void reloadSession().then(() => {
        navigate('/game/cultivation', { replace: true })
      })
    },
  }
}

export type ICharacterCreateViewModel = ReturnType<typeof useCharacterCreateViewModel>
