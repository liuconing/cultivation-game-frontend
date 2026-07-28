import { FaTimes } from 'react-icons/fa'
import { Link } from 'react-router'
import bambooShadow from '@/assets/images/bamboo-shadow.jpg'
import explorationMap from '@/assets/images/exploration-map.jpg'
import heroCultivator from '@/assets/images/hero-cultivator.jpg'
import heroLandscape from '@/assets/images/hero-landscape.jpg'
import { Button } from '@/components'
import { bind } from '@/utils'
import type { HomeAction } from './home-navigation'
import { useHomeViewModel, type IHomeViewModel } from './home.view-model'

/** 首頁主要操作元件需要的資料。 */
interface HomeActionControlProps {
  /** 依 Session 狀態計算後的首頁操作。 */
  action: HomeAction
  /** 重試確認 Session 時執行的操作。 */
  onRetry: () => void
  /** 外部補充的版面樣式。 */
  className?: string
}

/** 首頁核心玩法卡片的靜態內容。 */
const featureItems = [
  {
    mark: '煉',
    title: '放置修煉',
    description: '離線累積修為，返回後一鍵領取；衡量資源與成功率，突破每一層境界。',
  },
  {
    mark: '探',
    title: '探索戰鬥',
    description: '踏入凡俗山林與靈氣秘境，以逐回合戰報見證每一次命中、閃避與勝負。',
  },
  {
    mark: '整',
    title: '功法整備',
    description: '比較裝備詞條，配置主動與被動技能，讓功法與靈根共同塑造修行流派。',
  },
  {
    mark: '府',
    title: '洞府休養',
    description: '生命與靈力各自自然恢復，也能消耗靈石立即完成，為下一次探索做好準備。',
  },
] as const

/** 玩家從入道至成長的四段歷程。 */
const journeyItems = [
  ['壹', '建立道籍', '建立唯一角色，隨機覺醒靈根與初始品質。'],
  ['貳', '靜修積累', '領取修為、累積資源，逐步逼近境界上限。'],
  ['參', '探索磨礪', '挑戰不同境界地圖，從戰鬥與事件取得戰利品。'],
  ['肆', '整備突破', '調整裝備、功法、技能與丹藥，向更高境界邁進。'],
] as const

/** 首頁主要連結使用的共通視覺樣式。 */
const primaryLinkClassName =
  'inline-flex min-h-11 min-w-28 items-center justify-center rounded-md border border-jade-400/45 bg-jade-400/14 px-4 py-2.5 text-sm font-medium text-jade-100 transition hover:bg-jade-400/22 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-300'

/**
 * 依 Session 狀態呈現首頁主要連結或按鈕。
 *
 * @param props - 首頁操作資料、重試操作與外部樣式。
 * @returns 可鍵盤操作的 Link 或共用 Button。
 */
function renderHomeActionControl({ action, onRetry, className = '' }: HomeActionControlProps) {
  if (action.kind === 'link' && action.to) {
    return (
      <Link
        className={`${primaryLinkClassName} ${className}`}
        state={
          action.from
            ? {
                from: action.from,
              }
            : undefined
        }
        to={action.to}
      >
        {action.label}
      </Link>
    )
  }

  return (
    <Button
      className={className}
      disabled={action.kind === 'pending'}
      onClick={action.kind === 'retry' ? onRetry : undefined}
    >
      {action.label}
    </Button>
  )
}

/**
 * 呈現公開遊戲介紹首頁。
 *
 * @param props - Session 入口、重新確認及失效提示操作。
 * @returns 深色水墨風格的公開首頁。
 */
export function homeViewController({
  action,
  hasInvalidSessionNotice,
  handleRetrySession,
  handleDismissSessionNotice,
}: IHomeViewModel) {
  return (
    <div className='ink-wash min-h-dvh bg-ink-950 text-neutral-200'>
      <header className='sticky top-0 z-40 border-b border-white/10 bg-ink-950/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8'>
        <div className='mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4'>
          <Link
            aria-label='返回問仙首頁'
            className='flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade-300'
            to='/'
          >
            <span
              aria-hidden='true'
              className='grid size-10 shrink-0 place-items-center rounded-full border border-gold-300/40 bg-gold-400/10 font-serif text-lg text-gold-100'
            >
              問
            </span>
            <span className='min-w-0'>
              <span className='block font-serif text-lg tracking-[0.12em] text-neutral-100'>問仙</span>
              <span className='hidden text-[0.65rem] tracking-[0.18em] text-neutral-500 sm:block'>
                CULTIVATION CHRONICLE
              </span>
            </span>
          </Link>

          <nav aria-label='首頁章節' className='hidden items-center gap-7 text-sm text-neutral-400 md:flex'>
            <a
              className='rounded hover:text-jade-200 focus-visible:outline-2 focus-visible:outline-jade-300'
              href='#features'
            >
              遊戲特色
            </a>
            <a
              className='rounded hover:text-jade-200 focus-visible:outline-2 focus-visible:outline-jade-300'
              href='#journey'
            >
              修仙之路
            </a>
            <a
              className='rounded hover:text-jade-200 focus-visible:outline-2 focus-visible:outline-jade-300'
              href='#exploration'
            >
              探索天地
            </a>
          </nav>

          {renderHomeActionControl({
            action,
            className: 'min-w-24 shrink-0',
            onRetry: handleRetrySession,
          })}
        </div>
      </header>

      {hasInvalidSessionNotice ? (
        <div
          aria-live='assertive'
          className='relative z-30 mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-7xl items-start justify-between gap-4 rounded-lg border border-cinnabar-400/40 bg-cinnabar-400/10 px-4 py-3 text-cinnabar-100'
          role='alert'
        >
          <div className='min-w-0'>
            <p className='font-medium text-neutral-100'>登入憑證已失效</p>
            <p className='mt-1 text-sm leading-6'>請重新登入後繼續先前的修仙歷程。</p>
          </div>
          <button
            aria-label='關閉登入憑證失效提示'
            className='grid size-10 shrink-0 place-items-center rounded-md border border-white/12 text-neutral-300 transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-jade-300'
            onClick={handleDismissSessionNotice}
            title='關閉'
            type='button'
          >
            <FaTimes aria-hidden='true' />
          </button>
        </div>
      ) : null}

      <main>
        <section className='relative isolate overflow-hidden border-b border-white/8'>
          <img
            alt=''
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[68%] w-full object-cover object-bottom opacity-35'
            decoding='async'
            fetchPriority='high'
            loading='eager'
            src={heroLandscape}
          />
          <div className='absolute inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-950/88 to-ink-950/45' />

          <div className='mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.58fr)] lg:px-8'>
            <div className='max-w-3xl'>
              <div className='flex flex-wrap gap-2 text-xs tracking-[0.16em]'>
                <span className='rounded-full border border-jade-400/30 bg-jade-400/10 px-3 py-1.5 text-jade-200'>
                  單人文字放置
                </span>
              </div>

              <p className='mt-8 text-xs tracking-[0.38em] text-gold-200/70 sm:text-sm'>一念入道・萬劫問仙</p>
              <h1 className='mt-4 font-serif text-5xl leading-tight tracking-[0.08em] text-neutral-100 sm:text-6xl lg:text-7xl'>
                問仙
              </h1>
              <p className='mt-6 max-w-2xl font-serif text-xl leading-9 text-neutral-300 sm:text-2xl'>
                在光陰流轉中積累修為，
                <br className='hidden sm:block' />
                於山河秘境間尋得自己的長生之路。
              </p>
              <p className='mt-6 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base'>
                從一介凡人覺醒靈根，透過修煉、探索、整備與突破穩步成長。
                每次戰鬥與資源異動皆由伺服器結算，讓每一步進境都真實保存。
              </p>

              <div className='mt-9 flex flex-col gap-3 sm:flex-row'>
                {renderHomeActionControl({
                  action,
                  className: 'w-full sm:w-auto',
                  onRetry: handleRetrySession,
                })}
                <a
                  className='inline-flex min-h-11 w-full items-center justify-center rounded-md border border-gold-400/35 bg-gold-400/[0.07] px-4 py-2.5 text-sm font-medium text-gold-100 transition hover:bg-gold-400/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-300 sm:w-auto'
                  href='#features'
                >
                  了解玩法
                </a>
              </div>
            </div>

            <div className='relative hidden min-h-[30rem] lg:block'>
              <img
                alt='修士盤坐修煉，靈氣環繞周身'
                className='absolute inset-0 size-full object-contain opacity-90 mix-blend-screen drop-shadow-2xl'
                decoding='async'
                loading='eager'
                src={heroCultivator}
              />
              <div className='absolute inset-8 rounded-full border border-gold-300/15' />
              <div className='absolute inset-20 rounded-full border border-jade-300/12' />
            </div>
          </div>
        </section>

        <section className='relative mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8' id='features'>
          <img
            alt=''
            aria-hidden='true'
            className='pointer-events-none absolute right-0 top-0 -z-10 h-72 opacity-40 mix-blend-screen'
            decoding='async'
            loading='lazy'
            src={bambooShadow}
          />
          <div className='max-w-2xl'>
            <p className='text-xs tracking-[0.24em] text-gold-200/65'>FOUR PATHS</p>
            <h2 className='mt-3 font-serif text-3xl text-neutral-100 sm:text-4xl'>四道相生，步步成仙</h2>
            <p className='mt-4 text-sm leading-7 text-neutral-400'>
              修煉帶來進境，探索取得資源，整備塑造流派，休養則讓下一次出發更從容。
            </p>
          </div>

          <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {featureItems.map((feature) => (
              <article
                className='group min-w-0 rounded-lg border border-white/10 bg-ink-900/65 p-5 transition hover:-translate-y-1 hover:border-jade-400/30 hover:bg-ink-900'
                key={feature.title}
              >
                <span
                  aria-hidden='true'
                  className='grid size-11 place-items-center rounded-full border border-gold-300/30 bg-gold-400/[0.08] font-serif text-lg text-gold-100'
                >
                  {feature.mark}
                </span>
                <h3 className='mt-5 font-serif text-xl text-neutral-100'>{feature.title}</h3>
                <p className='mt-3 text-sm leading-7 text-neutral-400'>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='scroll-mt-24 border-y border-white/8 bg-ink-900/45' id='journey'>
          <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8'>
            <div className='grid gap-10 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]'>
              <div>
                <p className='text-xs tracking-[0.24em] text-gold-200/65'>CULTIVATION JOURNEY</p>
                <h2 className='mt-3 font-serif text-3xl text-neutral-100 sm:text-4xl'>從凡塵走向長生</h2>
                <p className='mt-5 text-sm leading-7 text-neutral-400'>
                  問仙不替你決定唯一道路。靈根、裝備、功法與每次資源選擇， 都會逐漸形成屬於你的修行節奏。
                </p>
              </div>

              <ol className='grid gap-4 sm:grid-cols-2'>
                {journeyItems.map(([number, title, description]) => (
                  <li className='rounded-lg border border-white/10 bg-black/20 p-5' key={number}>
                    <span className='text-xs tracking-[0.2em] text-gold-200/60'>{number}</span>
                    <h3 className='mt-3 font-serif text-xl text-neutral-100'>{title}</h3>
                    <p className='mt-2 text-sm leading-6 text-neutral-400'>{description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          className='mx-auto grid max-w-7xl scroll-mt-24 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8'
          id='exploration'
        >
          <div className='relative overflow-hidden rounded-xl border border-gold-400/20 bg-gold-400/[0.04] p-6 sm:p-8'>
            <div className='absolute inset-0 bg-gradient-to-br from-jade-400/[0.05] to-transparent' />
            <img
              alt='標記山林、山谷與洞府的修仙探索地圖'
              className='relative mx-auto w-full max-w-xl opacity-90'
              decoding='async'
              loading='lazy'
              src={explorationMap}
            />
          </div>

          <div>
            <p className='text-xs tracking-[0.24em] text-gold-200/65'>EXPLORE THE REALMS</p>
            <h2 className='mt-3 font-serif text-3xl text-neutral-100 sm:text-4xl'>境界之外，皆是未知</h2>
            <p className='mt-5 text-sm leading-7 text-neutral-400 sm:text-base'>
              每張地圖都有建議境界、挑戰倍率與獨特掉落。你可以量力而行，
              也能冒險踏入更高境界，承受壓制以換取更豐厚的報酬。
            </p>
            <dl className='mt-7 grid grid-cols-2 gap-3'>
              <div className='rounded-lg border border-white/10 bg-ink-900/70 p-4'>
                <dt className='text-xs text-neutral-500'>戰鬥呈現</dt>
                <dd className='mt-2 font-serif text-lg text-neutral-100'>逐回合戰報</dd>
              </div>
              <div className='rounded-lg border border-white/10 bg-ink-900/70 p-4'>
                <dt className='text-xs text-neutral-500'>進度保存</dt>
                <dd className='mt-2 font-serif text-lg text-neutral-100'>即時結算</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className='border-t border-white/8 px-4 py-16 sm:px-6'>
          <div className='mx-auto max-w-4xl rounded-xl border border-gold-400/25 bg-gradient-to-br from-gold-400/[0.08] via-ink-900 to-jade-400/[0.07] p-7 text-center sm:p-10'>
            <p className='text-xs tracking-[0.24em] text-gold-200/65'>YOUR PATH AWAITS</p>
            <h2 className='mt-3 font-serif text-3xl text-neutral-100'>道途已開，只待一念</h2>
            <p className='mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-400'>
              建立道籍，覺醒靈根，讓每一次離開與歸來都成為修為的一部分。
            </p>
            {renderHomeActionControl({
              action,
              className: 'mt-7 w-full sm:w-auto',
              onRetry: handleRetrySession,
            })}
          </div>
        </section>
      </main>

      <footer className='border-t border-white/10 px-4 py-8 text-sm text-neutral-500 sm:px-6'>
        <div className='mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <p>問仙・單人文字放置修仙</p>
          <div className='flex flex-wrap gap-x-5 gap-y-2'>
            {action.to === '/login' ? (
              <Link
                className='rounded hover:text-jade-200 focus-visible:outline-2 focus-visible:outline-jade-300'
                state={action.from ? { from: action.from } : undefined}
                to='/login'
              >
                登入
              </Link>
            ) : null}
            <Link
              className='rounded hover:text-jade-200 focus-visible:outline-2 focus-visible:outline-jade-300'
              to='/foundation'
            >
              UI Foundation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default bind(homeViewController, useHomeViewModel)
