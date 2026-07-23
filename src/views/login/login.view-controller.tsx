import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link } from 'react-router'
import { Button, StatusBadge, TextField } from '@/components'
import { bind } from '@/utils'
import {
  useLoginViewModel,
  type ILoginViewModel,
} from './login.view-model'

/** 呈現串接正式認證 API 的登入與註冊畫面。 */
export function loginViewController({
  mode,
  values,
  fieldErrors,
  notice,
  showPassword,
  isSubmitting,
  accountRef,
  passwordRef,
  confirmPasswordRef,
  handleFieldChange,
  handleTogglePassword,
  handleSubmit,
}: ILoginViewModel) {
  const isRegister = mode === 'register'
  const title = isRegister ? '建立道籍' : '重返仙途'
  const description = isRegister
    ? '建立帳號後會立即登入，並由角色建立流程接續。'
    : '登入後將依角色狀態前往建立角色或遊戲畫面。'

  const passwordToggle = (
    <button
      aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
      className="grid size-10 place-items-center rounded text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-200 focus-visible:outline-2 focus-visible:outline-jade-300"
      onClick={handleTogglePassword}
      type="button"
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  )

  return (
    <main
      className="ink-wash grid min-h-screen bg-ink-950 text-neutral-200 lg:grid-cols-[minmax(22rem,0.82fr)_minmax(30rem,1.18fr)]"
      data-auth-mode={mode}
    >
      <aside className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold-200/65">
            問仙・V1
          </p>
          <h1 className="mt-5 max-w-md font-serif text-5xl leading-tight text-neutral-100">
            一念入道，
            <br />
            萬劫問仙。
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-neutral-400">
            後端權威、探索配裝導向的純單人文字放置遊戲。
            帳號資料由正式後端驗證，登入狀態會安全保存在此裝置。
          </p>
        </div>
        <ol className="space-y-4 border-l border-gold-300/25 pl-5 text-sm text-neutral-500">
          <li>
            <span className="mr-3 text-gold-200/65">壹</span>
            登入或建立道籍
          </li>
          <li>
            <span className="mr-3 text-gold-200/65">貳</span>
            建立唯一角色
          </li>
          <li>
            <span className="mr-3 text-gold-200/65">參</span>
            修煉、探索與突破
          </li>
        </ol>
      </aside>

      <section className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <p className="text-xs tracking-[0.24em] text-gold-200/65">
              問仙・V1
            </p>
          </div>

          <div className="rounded-lg border border-white/12 bg-ink-900/80 p-5 shadow-2xl shadow-black/45 backdrop-blur-md sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="min-w-0">
                <p className="text-xs tracking-[0.18em] text-gold-200/65">
                  {isRegister ? 'REGISTER' : 'LOGIN'}
                </p>
                <h2 className="mt-2 font-serif text-3xl text-neutral-100">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  {description}
                </p>
              </div>
              <StatusBadge tone="jade">API 已連線</StatusBadge>
            </div>

            <form
              className="mt-5 space-y-4"
              noValidate
              onSubmit={handleSubmit}
            >
              <TextField
                autoComplete="email"
                disabled={isSubmitting}
                error={fieldErrors.account}
                inputMode="email"
                inputRef={accountRef}
                label="Email"
                onChange={(event) => {
                  handleFieldChange('account', event.target.value)
                }}
                placeholder="name@example.com"
                type="email"
                value={values.account}
              />
              <TextField
                autoComplete={
                  isRegister ? 'new-password' : 'current-password'
                }
                disabled={isSubmitting}
                error={fieldErrors.password}
                inputRef={passwordRef}
                label="密碼"
                onChange={(event) => {
                  handleFieldChange('password', event.target.value)
                }}
                trailingAction={passwordToggle}
                type={showPassword ? 'text' : 'password'}
                value={values.password}
              />
              {isRegister ? (
                <TextField
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  error={fieldErrors.confirmPassword}
                  inputRef={confirmPasswordRef}
                  label="確認密碼"
                  onChange={(event) => {
                    handleFieldChange(
                      'confirmPassword',
                      event.target.value,
                    )
                  }}
                  trailingAction={passwordToggle}
                  type={showPassword ? 'text' : 'password'}
                  value={values.confirmPassword}
                />
              ) : null}

              <div
                aria-live="polite"
                className={`min-h-11 rounded-md border px-3 py-3 text-sm leading-5 ${
                  notice?.tone === 'success'
                    ? 'border-jade-400/30 bg-jade-400/10 text-jade-100'
                    : notice?.tone === 'error'
                      ? 'border-cinnabar-400/35 bg-cinnabar-400/10 text-cinnabar-100'
                      : 'border-white/8 bg-black/15 text-neutral-500'
                }`}
                role="status"
              >
                {notice?.message ??
                  '請輸入 Email 與至少 8 個字元的密碼。'}
              </div>

              <Button
                className="w-full"
                isLoading={isSubmitting}
                type="submit"
              >
                {isRegister ? '建立道籍' : '登入'}
              </Button>
            </form>

            <div className="mt-5 flex flex-col gap-3 text-center text-sm">
              <Link
                className="text-neutral-400 underline-offset-4 hover:text-jade-200 hover:underline focus-visible:outline-2 focus-visible:outline-jade-300"
                to={isRegister ? '/login' : '/register'}
              >
                {isRegister
                  ? '已有道籍？返回登入'
                  : '尚無道籍？建立帳號'}
              </Link>
              <Link
                className="text-xs text-neutral-600 underline-offset-4 hover:text-neutral-400 hover:underline focus-visible:outline-2 focus-visible:outline-jade-300"
                to="/foundation"
              >
                查看 UI Foundation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default bind(loginViewController, useLoginViewModel)
