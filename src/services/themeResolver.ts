import { ThemePreset } from '../types/theme'
import type { ThemeColors } from '../types/theme'
import dark from '../themes/dark'
import mindigit from '../themes/mindigit'
import light from '../themes/light'
import slate from '../themes/slate'

const THEME_MAP: Record<ThemePreset, ThemeColors> = {
  [ThemePreset.dark]: dark,
  [ThemePreset.mindigit]: mindigit,
  [ThemePreset.light]: light,
  [ThemePreset.slate]: slate,
}

/**
 * Returns the resolved {@link ThemeColors} for the given preset.
 * Pure function — no React dependency.
 */
export function resolveTheme(preset: ThemePreset): ThemeColors {
  return THEME_MAP[preset]
}
