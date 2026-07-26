import { Link } from 'react-router'
import { Button, StatusBadge, TextField } from '@/components'
import { spiritualRootQualityLabels } from '@/data/characterCreationMock'
import { bind } from '@/utils'
import { useCharacterCreateViewModel, type ICharacterCreateViewModel } from './characterCreate.view-model'

/** 呈現角色建立表單與靈根品質結果。 */
export function characterCreateViewController({
  screen,
  values,
  errors,
  notice,
  genderOptions,
  spiritualRootOptions,
  result,
  isSubmitting,
  nameRef,
  genderRef,
  spiritualRootRef,
  handleNameChange,
  handleGenderChange,
  handleSpiritualRootChange,
  handleSubmit,
  handleEnterGame,
}: ICharacterCreateViewModel) {
  const selectedRoot = spiritualRootOptions.find((option) => option.value === values.spiritualRootType)
  const selectedGender = genderOptions.find((option) => option.value === values.gender)

  if (screen === 'result' && result) {
    const resultRoot = spiritualRootOptions.find((option) => option.value === result.spiritualRootType)
    const resultGender = genderOptions.find((option) => option.value === result.gender)

    return (
      <main className='ink-wash grid min-h-screen place-items-center bg-ink-950 px-4 py-8 text-neutral-200 sm:px-6'>
        <section className='w-full max-w-2xl overflow-hidden rounded-lg border border-gold-300/25 bg-ink-900/85 shadow-2xl shadow-black/50'>
          <div className='border-b border-white/10 bg-gradient-to-b from-gold-400/[0.08] to-transparent px-5 py-8 text-center sm:px-8 sm:py-10'>
            <StatusBadge tone='jade'>角色建立成功</StatusBadge>
            <p className='mt-6 text-xs tracking-[0.24em] text-gold-200/65'>SPIRITUAL ROOT AWAKENED</p>
            <div className='mx-auto mt-5 grid size-24 place-items-center rounded-full border border-gold-300/35 bg-black/25 font-serif text-4xl text-gold-100 shadow-lg shadow-gold-700/15'>
              {resultRoot?.symbol}
            </div>
            <h1 className='mt-5 break-words font-serif text-4xl text-neutral-100'>{result.name}</h1>
            <p className='mt-3 text-lg text-neutral-300'>
              {resultRoot?.label}・
              <span className='text-gold-100'>{spiritualRootQualityLabels[result.spiritualRootQuality]}</span>
            </p>
          </div>

          <div className='p-5 sm:p-8'>
            <dl className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              {[
                ['性別', resultGender?.label ?? '不公開'],
                ['境界', '凝氣・前期'],
                ['生命', result.baseStats.maxHp],
                ['靈力', result.baseStats.maxMp],
                ['修為', result.cultivation],
                ['靈石', result.spiritStones],
                ['主動技能', result.equippedActiveSkillId ?? '未配置'],
                ['被動技能', result.equippedPassiveSkillId ?? '未配置'],
              ].map(([label, value]) => (
                <div className='min-w-0 rounded-md border border-white/10 bg-black/20 p-3' key={label}>
                  <dt className='truncate text-xs text-neutral-500'>{label}</dt>
                  <dd className='mt-1 truncate text-sm text-neutral-100'>{value}</dd>
                </div>
              ))}
            </dl>

            <p className='mt-5 rounded-md border border-jade-400/20 bg-jade-400/[0.06] px-4 py-3 text-sm leading-6 text-jade-100'>
              靈根品質由後端建立角色時產生；角色表單不會送出或覆寫此值。
            </p>

            <div className='mt-6'>
              <Button className='w-full' onClick={handleEnterGame}>
                進入修煉
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className='ink-wash min-h-screen bg-ink-950 text-neutral-200'>
      <div className='mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[minmax(20rem,0.7fr)_minmax(34rem,1.3fr)]'>
        <aside className='border-b border-white/10 px-4 py-8 sm:px-8 lg:flex lg:flex-col lg:justify-between lg:border-b-0 lg:border-r lg:py-12'>
          <div>
            <p className='text-xs tracking-[0.26em] text-gold-200/65'>UI-03・XIA-38</p>
            <h1 className='mt-4 font-serif text-4xl text-neutral-100 sm:text-5xl'>初入仙途</h1>
            <p className='mt-5 max-w-md text-sm leading-7 text-neutral-400'>
              選擇姓名、性別與靈根種類。靈根品質將在角色建立後由後端結果揭示。
            </p>
          </div>

          <div className='mt-7 rounded-lg border border-white/10 bg-ink-900/60 p-4 lg:mt-10'>
            <p className='text-xs tracking-[0.18em] text-gold-200/60'>當前選擇</p>
            <dl className='mt-4 grid grid-cols-3 gap-3 text-sm lg:grid-cols-1'>
              <div className='min-w-0'>
                <dt className='text-xs text-neutral-600'>姓名</dt>
                <dd className='mt-1 truncate text-neutral-200'>{values.name || '尚未輸入'}</dd>
              </div>
              <div className='min-w-0'>
                <dt className='text-xs text-neutral-600'>性別</dt>
                <dd className='mt-1 truncate text-neutral-200'>{selectedGender?.label}</dd>
              </div>
              <div className='min-w-0'>
                <dt className='text-xs text-neutral-600'>靈根</dt>
                <dd className='mt-1 truncate text-neutral-200'>{selectedRoot?.label}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className='min-w-0 px-4 py-8 sm:px-8 lg:py-12'>
          <div className='mx-auto max-w-3xl rounded-lg border border-white/12 bg-ink-900/80 p-5 shadow-2xl shadow-black/40 sm:p-7'>
            <div className='flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5'>
              <div>
                <p className='text-xs tracking-[0.18em] text-gold-200/65'>CHARACTER CREATION</p>
                <h2 className='mt-2 font-serif text-2xl text-neutral-100'>建立唯一角色</h2>
              </div>
              <StatusBadge tone='jade'>正式資料</StatusBadge>
            </div>

            <form className='mt-6 space-y-6' noValidate onSubmit={handleSubmit}>
              <TextField
                autoComplete='off'
                disabled={isSubmitting}
                error={errors.name}
                name='name'
                hint={`${Array.from(values.name).length} / 12 字`}
                inputRef={nameRef}
                label='角色姓名'
                onChange={(event) => {
                  handleNameChange(event.target.value)
                }}
                value={values.name}
              />

              <fieldset className='min-w-0' ref={genderRef} tabIndex={-1}>
                <legend className='text-sm text-neutral-300'>性別</legend>
                <div className='mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4'>
                  {genderOptions.map((option) => (
                    <label
                      className={`cursor-pointer rounded-md border p-3 transition focus-within:outline-2 focus-within:outline-jade-300 ${
                        values.gender === option.value
                          ? 'border-jade-400/45 bg-jade-400/10'
                          : 'border-white/10 bg-black/20 hover:bg-white/[0.04]'
                      }`}
                      key={option.value}
                    >
                      <input
                        checked={values.gender === option.value}
                        className='sr-only'
                        disabled={isSubmitting}
                        name='gender'
                        onChange={() => {
                          handleGenderChange(option.value)
                        }}
                        type='radio'
                        value={option.value}
                      />
                      <span className='block text-sm text-neutral-100'>{option.label}</span>
                      <span className='mt-1 block truncate text-xs text-neutral-500'>{option.description}</span>
                    </label>
                  ))}
                </div>
                {errors.gender ? (
                  <p className='mt-2 text-xs text-cinnabar-200' role='alert'>
                    {errors.gender}
                  </p>
                ) : null}
              </fieldset>

              <fieldset className='min-w-0' ref={spiritualRootRef} tabIndex={-1}>
                <legend className='text-sm text-neutral-300'>靈根種類</legend>
                <div className='mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4'>
                  {spiritualRootOptions.map((option) => (
                    <label
                      className={`cursor-pointer rounded-md border p-3 text-center transition focus-within:outline-2 focus-within:outline-jade-300 ${
                        values.spiritualRootType === option.value
                          ? 'border-gold-400/45 bg-gold-400/10'
                          : 'border-white/10 bg-black/20 hover:bg-white/[0.04]'
                      }`}
                      key={option.value}
                    >
                      <input
                        checked={values.spiritualRootType === option.value}
                        className='sr-only'
                        disabled={isSubmitting}
                        name='spiritualRootType'
                        onChange={() => {
                          handleSpiritualRootChange(option.value)
                        }}
                        type='radio'
                        value={option.value}
                      />
                      <span className='mx-auto grid size-9 place-items-center rounded-full border border-white/10 font-serif text-lg text-gold-100'>
                        {option.symbol}
                      </span>
                      <span className='mt-2 block text-sm text-neutral-100'>{option.label}</span>
                      <span className='mt-1 block truncate text-xs text-neutral-500'>{option.description}</span>
                    </label>
                  ))}
                </div>
                {errors.spiritualRootType ? (
                  <p className='mt-2 text-xs text-cinnabar-200' role='alert'>
                    {errors.spiritualRootType}
                  </p>
                ) : null}
              </fieldset>

              <div
                aria-live='polite'
                className={`min-h-11 rounded-md border px-3 py-3 text-sm ${
                  notice
                    ? 'border-cinnabar-400/35 bg-cinnabar-400/10 text-cinnabar-100'
                    : 'border-white/8 bg-black/15 text-neutral-500'
                }`}
                role='status'
              >
                {notice ?? '只會提交姓名、性別與靈根種類；靈根品質由後端決定。'}
              </div>

              <Button className='w-full' isLoading={isSubmitting} type='submit'>
                建立角色
              </Button>
            </form>

            <div className='mt-5 text-center'>
              <Link
                className='text-xs text-neutral-600 underline-offset-4 hover:text-neutral-400 hover:underline focus-visible:outline-2 focus-visible:outline-jade-300'
                to='/login'
              >
                返回登入
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default bind(characterCreateViewController, useCharacterCreateViewModel)
