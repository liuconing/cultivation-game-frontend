import { createContext } from 'react'
import type { SessionContextValue } from './session.types'

/** Session Provider 尚未掛載時使用的空 context。 */
export const SessionContext =
  createContext<SessionContextValue | null>(null)
