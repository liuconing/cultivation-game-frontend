import { FaLock, FaUserAlt } from 'react-icons/fa'
import { FaUserPen } from 'react-icons/fa6'
import { GameImage } from '@/components/GameImage'
import { bind } from '@/utils'
import inkLandscape from '@/assets/images/ink-landscape.svg'
import { useLoginViewModel, type ILoginViewModel } from './login.view-model'

/**
 * 登入 / 註冊畫面，依 ViewModel 狀態切換表單內容。
 *
 * @param props - 由 ViewModel 提供的顯示狀態、預設值與事件處理器。
 */
export function loginViewController({
  isRegister,
  message,
  accountDefault,
  passwordDefault,
  characterNameDefault,
  handleSelectLogin,
  handleSelectRegister,
  handleSubmit,
}: ILoginViewModel) {
  return (
    <main className="ink-wash grid min-h-screen place-items-center overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-200">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <GameImage
          alt="登入頁水墨背景"
          className="absolute left-1/2 top-[-4rem] h-auto w-[92rem] max-w-none -translate-x-1/2 opacity-[0.12]"
          src={inkLandscape}
        />
        <GameImage
          alt="登入頁山水底紋"
          className="absolute bottom-[-10rem] right-[-18rem] h-auto w-[66rem] max-w-none opacity-[0.1]"
          src={inkLandscape}
        />
      </div>

      <section className="relative z-10 w-full max-w-[420px] rounded-lg border border-white/15 bg-neutral-950/65 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-7">
        <div className="mb-6 text-center">
          <p className="text-xs text-neutral-500">墨境問道</p>
          <h1 className="mt-2 font-serif text-3xl text-neutral-100">
            {isRegister ? '開立洞府' : '入境修行'}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            {isRegister ? '建立 mock 修士資料' : '使用 mock 帳號登入'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-full border border-white/12 bg-black/30 p-1">
          <button
            className={`rounded-full px-4 py-2 text-sm transition hover:bg-white/[0.08] ${
              !isRegister ? 'bg-white/10 text-neutral-100' : 'text-neutral-400'
            }`}
            onClick={handleSelectLogin}
            type="button"
          >
            登入
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm transition hover:bg-white/[0.08] ${
              isRegister ? 'bg-white/10 text-neutral-100' : 'text-neutral-400'
            }`}
            onClick={handleSelectRegister}
            type="button"
          >
            註冊
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs text-neutral-500">
              帳號 / Email
            </span>
            <div className="flex items-center gap-3 rounded-md border border-white/12 bg-black/30 px-3 py-3 focus-within:border-white/25">
              <FaUserAlt className="text-neutral-400" />
              <input
                className="w-full bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
                defaultValue={accountDefault}
                placeholder="demo@inkdao.local"
                type="email"
              />
            </div>
          </label>

          {isRegister ? (
            <label className="block">
              <span className="mb-2 block text-xs text-neutral-500">
                角色名稱
              </span>
              <div className="flex items-center gap-3 rounded-md border border-white/12 bg-black/30 px-3 py-3 focus-within:border-white/25">
                <FaUserPen className="text-neutral-400" />
                <input
                  className="w-full bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
                  defaultValue={characterNameDefault}
                  placeholder="輸入角色名稱"
                  type="text"
                />
              </div>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-xs text-neutral-500">密碼</span>
            <div className="flex items-center gap-3 rounded-md border border-white/12 bg-black/30 px-3 py-3 focus-within:border-white/25">
              <FaLock className="text-neutral-400" />
              <input
                className="w-full bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
                defaultValue={passwordDefault}
                placeholder="輸入密碼"
                type="password"
              />
            </div>
          </label>

          <button
            className="w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-neutral-100 transition hover:border-white/35 hover:bg-white/10"
            type="submit"
          >
            {isRegister ? '建立帳號' : '登入'}
          </button>
        </form>

        <p className="mt-4 min-h-5 text-center text-xs text-neutral-500">
          {message}
        </p>
      </section>
    </main>
  )
}

export default bind(loginViewController, useLoginViewModel)
