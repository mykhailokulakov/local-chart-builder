import { useMemo } from 'react'
import type { ThemeColors } from '../types/theme'
import { resolveTheme } from '../services/themeResolver'
import { useReport } from './useReport'

/**
 * Returns the resolved {@link ThemeColors} for the report's current theme preset.
 * Re-renders only when `state.present.theme` changes.
 */
export function useTheme(): ThemeColors {
  const { state } = useReport()
  return useMemo(() => resolveTheme(state.present.theme), [state.present.theme])
}
