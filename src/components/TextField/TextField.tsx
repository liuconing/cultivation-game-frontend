import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  inputRef?: Ref<HTMLInputElement>
  trailingAction?: ReactNode
}

/** 顯示完整標籤、提示與錯誤關聯的文字欄位。 */
export function TextField({
  label,
  error,
  hint,
  inputRef,
  trailingAction,
  className = '',
  id,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`

  return (
    <div className="block min-w-0">
      <label
        className="mb-2 block text-sm text-neutral-300"
        htmlFor={inputId}
      >
        {label}
      </label>
      <span
        className={`flex min-h-11 items-center rounded-md border bg-black/30 transition focus-within:border-jade-300/70 focus-within:ring-2 focus-within:ring-jade-300/15 ${
          error ? 'border-cinnabar-400/70' : 'border-white/14'
        }`}
      >
        <input
          aria-describedby={error || hint ? descriptionId : undefined}
          aria-invalid={Boolean(error)}
          className={`min-h-11 min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
          id={inputId}
          ref={inputRef}
          {...inputProps}
        />
        {trailingAction ? (
          <span className="shrink-0 pr-1">{trailingAction}</span>
        ) : null}
      </span>
      {error || hint ? (
        <span
          className={`mt-2 block text-xs ${
            error ? 'text-cinnabar-200' : 'text-neutral-500'
          }`}
          id={descriptionId}
        >
          {error ?? hint}
        </span>
      ) : null}
    </div>
  )
}
