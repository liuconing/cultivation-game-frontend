import { createContext } from 'react'
import type { GameRuntime } from './use-game-runtime'

/** Game Runtime Provider 尚未掛載時使用的空 context。 */
export const GameRuntimeContext =
  createContext<GameRuntime | null>(null)
