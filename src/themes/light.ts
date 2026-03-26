import type { ThemeColors } from '../types/theme'

/**
 * Trident light theme.
 * Content slides use lavender-tinted white (#F3F2FA).
 * Statement slides (title, ending) use solid periwinkle (#7B6EF6) — this
 * is the signature move: the one brand colour as a full-bleed background.
 * The left-edge bar and accent marks flip to navy (#1A1A2E) on that bg.
 */
const light: ThemeColors = {
  // Content slides
  background: '#F3F2FA',
  surface: 'rgba(26,26,46,0.06)',
  foreground: '#1A1A2E',
  muted: 'rgba(26,26,46,0.45)',
  foregroundTertiary: 'rgba(26,26,46,0.27)',
  accent: '#7B6EF6',
  rule: 'rgba(26,26,46,0.07)',
  chartSecondary: '#D4D0F0',

  // Statement slides (title, ending) — solid periwinkle background
  backgroundStatement: '#7B6EF6',
  foregroundStatement: '#1A1A2E',
  accentStatement: '#1A1A2E',
  titleLine2Color: '#FFFFFF',

  chartColors: [
    '#7B6EF6',
    '#A49BF8',
    '#D4D0F0',
    '#E8E6F5',
    '#5B4EC6',
    '#8B82F4',
    '#C0BAF9',
    '#3C3489',
  ],
  fontFamily: "'e-Ukraine', 'DM Sans', 'Inter', sans-serif",
}

export default light
