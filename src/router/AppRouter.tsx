import { Navigate, Route, Routes } from 'react-router'
import { HomeView } from '@/views/home'
import { LoginView } from '@/views/login'

/**
 * 應用程式路由設定，定義各頁面對應路徑與預設導向。
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<HomeView />} path="/" />
      <Route element={<LoginView />} path="/login" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
