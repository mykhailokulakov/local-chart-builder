import { useCallback } from 'react'
import { useReport } from './useReport'
import { undo, redo } from '../store/actions'

export interface UseUndoRedoResult {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
}

/**
 * Convenience hook that exposes undo/redo capabilities.
 * Use this to wire up toolbar buttons and keyboard shortcuts.
 */
export function useUndoRedo(): UseUndoRedoResult {
  const { dispatch, canUndo, canRedo } = useReport()

  const handleUndo = useCallback(() => {
    dispatch(undo())
  }, [dispatch])

  const handleRedo = useCallback(() => {
    dispatch(redo())
  }, [dispatch])

  return { canUndo, canRedo, undo: handleUndo, redo: handleRedo }
}
