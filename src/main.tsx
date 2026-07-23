import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@/lib/react-query'
import { BrowserRouter } from 'react-router'
import { AppRouter } from '@/router'
import { SessionProvider } from '@/session'
import './index.css'

/** 全站共用的 TanStack Query client。 */
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionProvider>
          <AppRouter />
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
