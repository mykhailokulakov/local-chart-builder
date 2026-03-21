import type { ThemeColors } from '../types/theme'

/**
 * Dark navy theme — inspired by NCSI / Diia City slide decks.
 * Deep navy background with light-blue accents and high-contrast white text.
 */
const dark: ThemeColors = {
  background: '#111827',
  surface: '#1f2937',
  foreground: '#f9fafb',
  muted: '#9ca3af',
  accent: '#3b82f6',
  accentSecondary: '#60a5fa',
  chartColors: [
    '#3b82f6',
    '#60a5fa',
    '#93c5fd',
    '#f59e0b',
    '#34d399',
    '#f87171',
    '#a78bfa',
    '#fb923c',
  ],
  fontFamily: "'e-Ukraine', sans-serif",
}

export default dark
