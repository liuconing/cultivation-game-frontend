import { Navigate, Route, Routes } from 'react-router'
import { CharacterCreateView } from '@/views/characterCreate'
import { GameShellView } from '@/views/gameShell'
import { HomeView } from '@/views/home'
import { LoginView } from '@/views/login'

/** 提供 UI Mock 畫面與成功導向示意路由。 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<HomeView />} path="/" />
      <Route element={<LoginView key="login" />} path="/login" />
      <Route
        element={<LoginView key="register" />}
        path="/register"
      />
      <Route
        element={<CharacterCreateView />}
        path="/character/create"
      />
      <Route
        element={<Navigate replace to="/game/cultivation" />}
        path="/game"
      />
      <Route
        element={<GameShellView />}
        path="/game/cultivation"
      />
      <Route element={<GameShellView />} path="/game/explore" />
      <Route element={<GameShellView />} path="/game/loadout" />
      <Route element={<GameShellView />} path="/game/cave" />
      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  )
}
