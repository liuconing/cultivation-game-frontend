import { useId, type InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

/** 顯示完整標籤、提示與錯誤關聯的文字欄位。 */
export function TextField({
  label,
  error,
  hint,
  className = '',
  id,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`

  return (
    <label className="block min-w-0" htmlFor={inputId}>
      <span className="mb-2 block text-sm text-neutral-300">{label}</span>
      <input
        aria-describedby={error || hint ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className={`min-h-11 w-full rounded-md border bg-black/30 px-3 py-2.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-jade-300/70 focus:ring-2 focus:ring-jade-300/15 disabled:cursor-not-allowed disabled:opacity-45 ${
          error ? 'border-cinnabar-400/70' : 'border-white/14'
        } ${className}`}
        id={inputId}
        {...inputProps}
      />
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
    </label>
  )
}
