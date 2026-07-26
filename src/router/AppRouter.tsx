import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Button, Panel } from '@/components'
import { useSession } from '@/session'
import { GameRuntimeProvider } from '@/containers'
import { CharacterCreateView } from '@/views/characterCreate'
import { FoundationView } from '@/views/foundation'
import { GameShellView } from '@/views/gameShell'
import { HomeView } from '@/views/home'
import { LoginView } from '@/views/login'
import { resolveRouteAccess } from './route-access'

/** 顯示登入狀態與角色資料啟動期間的等待畫面。 */
const SessionLoading = () => (
  <main aria-busy='true' className='ink-wash grid min-h-dvh place-items-center bg-ink-950 px-4 text-neutral-200'>
    <Panel eyebrow='SESSION BOOTSTRAP' title='正在確認道籍'>
      <div className='flex min-h-40 items-center justify-center gap-3 text-sm text-neutral-400' role='status'>
        <span
          aria-hidden='true'
          className='size-6 animate-spin rounded-full border-2 border-jade-300/60 border-r-transparent'
        />
        正在載入登入與角色狀態……
      </div>
    </Panel>
  </main>
)

/** Session 啟動失敗畫面的操作。 */
interface SessionErrorProps {
  /** 可顯示給使用者的錯誤訊息。 */
  message: string
  /** 重新執行 session 啟動查詢。 */
  onRetry: () => Promise<void>
  /** 清除登入狀態並返回公開首頁。 */
  onLogout: () => Promise<void>
}

/**
 * 顯示 session 啟動失敗與安全恢復操作。
 *
 * @param props - 錯誤訊息、重試及登出操作。
 */
const SessionError = ({ message, onRetry, onLogout }: SessionErrorProps) => (
  <main className='ink-wash grid min-h-dvh place-items-center bg-ink-950 px-4 text-neutral-200'>
    <Panel eyebrow='SESSION ERROR' title='暫時無法載入'>
      <div
        aria-live='assertive'
        className='rounded-md border border-cinnabar-400/30 bg-cinnabar-400/[0.08] p-4 text-sm leading-6 text-cinnabar-100'
        role='alert'
      >
        {message}
      </div>
      <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
        <Button
          onClick={() => {
            void onRetry()
          }}
        >
          重試載入
        </Button>
        <Button
          onClick={() => {
            void onLogout()
          }}
          variant='secondary'
        >
          返回首頁
        </Button>
      </div>
    </Panel>
  </main>
)

/** 依 session 狀態提供登入、角色建立與遊戲路由守衛。 */
export function AppRouter() {
  const location = useLocation()
  const { status, errorMessage, reloadSession, logout } = useSession()
  const routeAccess = resolveRouteAccess({
    pathname: location.pathname,
    sessionStatus: status,
  })

  if (routeAccess.kind === 'loading') {
    return <SessionLoading />
  }

  if (routeAccess.kind === 'error') {
    return (
      <SessionError
        message={errorMessage ?? '登入狀態載入失敗，請稍後再試。'}
        onLogout={logout}
        onRetry={reloadSession}
      />
    )
  }

  if (routeAccess.kind === 'redirect') {
    return (
      <Navigate
        replace
        state={routeAccess.preserveFrom ? { from: `${location.pathname}${location.search}` } : undefined}
        to={routeAccess.to}
      />
    )
  }

  return (
    <Routes>
      <Route element={<HomeView />} path='/' />
      <Route element={<FoundationView />} path='/foundation' />
      <Route element={<LoginView key='login' />} path='/login' />
      <Route element={<LoginView key='register' />} path='/register' />
      <Route element={<CharacterCreateView />} path='/character/create' />
      <Route
        element={
          <GameRuntimeProvider>
            <GameShellView />
          </GameRuntimeProvider>
        }
        path='/game/*'
      />
    </Routes>
  )
}
