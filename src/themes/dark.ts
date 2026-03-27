import type { ThemeColors } from '../types/theme'

/**
 * Trident dark theme.
 * All slides use the same near-black background (#0C0C0E).
 * Periwinkle (#7B6EF6) appears as accent strokes, section marks, the
 * left-edge bar, and the second line of two-tone titles.
 */
const dark: ThemeColors = {
  // Content slides
  background: '#0C0C0E',
  surface: 'rgba(255,255,255,0.06)',
  foreground: '#FFFFFF',
  muted: 'rgba(255,255,255,0.40)',
  foregroundTertiary: 'rgba(255,255,255,0.22)',
  accent: '#7B6EF6',
  rule: 'rgba(255,255,255,0.07)',
  chartSecondary: 'rgba(58,58,74,0.50)',

  // Statement slides (title, ending) — same dark background
  backgroundStatement: '#0C0C0E',
  foregroundStatement: '#FFFFFF',
  accentStatement: '#7B6EF6',
  titleLine1Color: '#FFFFFF',
  titleLine2Color: '#7B6EF6',
  tridentFilterStatement: 'invert(1)',

  chartColors: [
    '#7B6EF6',
    '#5B4EC6',
    '#9B8EF8',
    '#3A3A4A',
    '#A898FA',
    '#4A3AB6',
    '#C8C0FC',
    '#2A2A3A',
  ],
  fontFamily: "'e-Ukraine', 'DM Sans', 'Inter', sans-serif",
}

export default dark
