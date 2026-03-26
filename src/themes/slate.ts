import type { ThemeColors } from '../types/theme'

// Dead code — slate is no longer a ThemePreset.
// Kept to avoid breaking any external tooling that may reference this file.
const slate: ThemeColors = {
  background: '#1e1e2e',
  surface: 'rgba(255,255,255,0.06)',
  foreground: '#cdd6f4',
  muted: 'rgba(205,214,244,0.45)',
  foregroundTertiary: 'rgba(205,214,244,0.22)',
  accent: '#89b4fa',
  rule: 'rgba(205,214,244,0.07)',
  chartSecondary: 'rgba(137,180,250,0.30)',
  backgroundStatement: '#1e1e2e',
  foregroundStatement: '#cdd6f4',
  accentStatement: '#89b4fa',
  titleLine2Color: '#89b4fa',
  chartColors: [
    '#89b4fa',
    '#cba6f7',
    '#89dceb',
    '#a6e3a1',
    '#f38ba8',
    '#fab387',
    '#f9e2af',
    '#94e2d5',
  ],
  fontFamily: "'e-Ukraine', sans-serif",
}

export default slate
