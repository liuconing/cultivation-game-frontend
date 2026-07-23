import { Navigate, Route, Routes } from 'react-router'
import { HomeView } from '@/views/home'
import { LoginView } from '@/views/login'
import { MockDestinationView } from '@/views/mockDestination'

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
        element={<MockDestinationView />}
        path="/character/create"
      />
      <Route
        element={<MockDestinationView />}
        path="/game/cultivation"
      />
      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  )
}
