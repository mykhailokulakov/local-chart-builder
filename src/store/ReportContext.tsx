import { createContext, useReducer, useMemo, type ReactNode } from 'react'
import type { UndoableState } from '../types/slide'
import type { ReportAction } from './actions'
import { createUndoReducer, initialUndoableState } from './undoMiddleware'

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface ReportContextValue {
  state: UndoableState
  dispatch: React.Dispatch<ReportAction>
  canUndo: boolean
  canRedo: boolean
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const ReportContext = createContext<ReportContextValue | null>(null)

// ---------------------------------------------------------------------------
// Singleton reducer — created once outside the component so the debounce
// closure lives for the entire session.
// ---------------------------------------------------------------------------

const undoReducer = createUndoReducer()

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ReportProviderProps {
  children: ReactNode
  /** Override initial state — useful for tests. */
  initialState?: UndoableState
}

export function ReportProvider({ children, initialState }: ReportProviderProps) {
  const [state, dispatch] = useReducer(undoReducer, initialState ?? initialUndoableState)

  const value = useMemo<ReportContextValue>(
    () => ({
      state,
      dispatch,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [state, dispatch],
  )

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
}
