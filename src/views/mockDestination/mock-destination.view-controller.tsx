import { Link } from 'react-router'
import { StatusBadge } from '@/components'
import { bind } from '@/utils'
import {
  useMockDestinationViewModel,
  type IMockDestinationViewModel,
} from './mock-destination.view-model'

/** 顯示 Auth Mock 成功後的輕量導向結果。 */
export function mockDestinationViewController({
  eyebrow,
  title,
  description,
  targetRoute,
}: IMockDestinationViewModel) {
  return (
    <main className="ink-wash grid min-h-screen place-items-center bg-ink-950 px-4 py-10 text-neutral-200">
      <section className="w-full max-w-lg rounded-lg border border-white/12 bg-ink-900/80 p-6 text-center shadow-2xl shadow-black/45 sm:p-8">
        <StatusBadge tone="jade">Mock 導向成功</StatusBadge>
        <p className="mt-6 text-xs tracking-[0.2em] text-gold-200/65">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-neutral-100">
          {title}
        </h1>
        <p className="mt-4 break-words font-mono text-xs text-neutral-500">
          {targetRoute}
        </p>
        <p className="mt-5 text-sm leading-7 text-neutral-400">
          {description}
        </p>
        <Link
          className="mt-7 inline-flex min-h-11 min-w-32 items-center justify-center rounded-md border border-jade-400/45 bg-jade-400/14 px-4 text-sm text-jade-100 transition hover:bg-jade-400/22 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-300"
          to="/login"
        >
          返回登入 Mock
        </Link>
      </section>
    </main>
  )
}

export default bind(
  mockDestinationViewController,
  useMockDestinationViewModel,
)
