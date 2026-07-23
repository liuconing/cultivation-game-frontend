import { Navigate, Route, Routes } from 'react-router'
import { HomeView } from '@/views/home'

/** 提供 UI-01 foundation showcase 的暫時路由。 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<HomeView />} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
