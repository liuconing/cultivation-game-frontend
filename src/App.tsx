import { useMemo } from 'react'
import { Link, Route, Routes } from 'react-router'
import { apiClient } from '@/lib/axios'
import { BigNumber } from '@/lib/bigNumber'
import { useQuery } from '@/lib/react-query'
import { createUuid } from '@/lib/uuid'

function App() {
  const sessionId = useMemo(() => createUuid(), [])
  const { data, isLoading } = useQuery({
    queryKey: ['health-preview'],
    queryFn: async () => {
      const response = await apiClient.get('/health')

      return response.data as { status?: string }
    },
    enabled: false,
  })
  const startingSpirit = new BigNumber(1000).plus(250).toFormat()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <nav className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
            Cultivation Game
          </span>
          <div className="flex gap-4 text-sm text-slate-300">
            <Link className="hover:text-emerald-300" to="/">
              Home
            </Link>
            <Link className="hover:text-emerald-300" to="/status">
              Status
            </Link>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <section className="grid gap-6 rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div>
                  <p className="text-sm text-emerald-300">Frontend ready</p>
                  <h1 className="mt-3 text-4xl font-bold text-white">
                    React, Vite, Tailwind, Router, and Query are connected.
                  </h1>
                </div>
                <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                  <div className="rounded-md border border-slate-800 p-4">
                    <p className="text-slate-500">Session ID</p>
                    <p className="mt-2 break-all font-mono text-emerald-200">
                      {sessionId}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-800 p-4">
                    <p className="text-slate-500">Starting spirit</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {startingSpirit}
                    </p>
                  </div>
                </div>
              </section>
            }
          />
          <Route
            path="/status"
            element={
              <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Backend health preview</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">
                  {isLoading ? 'Checking...' : data?.status ?? 'Not requested'}
                </h1>
                <p className="mt-4 text-slate-300">
                  Query wiring is present. Enable the query after the backend
                  URL is finalized.
                </p>
              </section>
            }
          />
        </Routes>
      </div>
    </main>
  )
}

export default App
