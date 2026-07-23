import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  isLoading?: boolean
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    'border-jade-400/45 bg-jade-400/14 text-jade-100 hover:bg-jade-400/22',
  secondary:
    'border-gold-400/40 bg-gold-400/10 text-gold-100 hover:bg-gold-400/18',
  danger:
    'border-cinnabar-400/45 bg-cinnabar-400/12 text-cinnabar-100 hover:bg-cinnabar-400/20',
  ghost:
    'border-white/12 bg-white/[0.03] text-neutral-200 hover:bg-white/[0.08]',
}

/** 提供固定尺寸、載入與停用狀態的共用按鈕。 */
export function Button({
  children,
  className = '',
  variant = 'primary',
  isLoading = false,
  disabled,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 min-w-28 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-300 disabled:cursor-not-allowed disabled:opacity-45 ${variantClassNames[variant]} ${className}`}
      disabled={disabled || isLoading}
      type={type}
      {...buttonProps}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      <span className="min-w-0 truncate">{isLoading ? '處理中' : children}</span>
    </button>
  )
}
