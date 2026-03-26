import { ThemePreset } from '../types/theme'
import type { ThemeColors } from '../types/theme'
import dark from '../themes/dark'
import light from '../themes/light'

const THEME_MAP: Record<ThemePreset, ThemeColors> = {
  [ThemePreset.dark]: dark,
  [ThemePreset.light]: light,
}

/**
 * Returns the resolved {@link ThemeColors} for the given preset.
 * Pure function — no React dependency.
 */
export function resolveTheme(preset: ThemePreset): ThemeColors {
  return THEME_MAP[preset]
}
