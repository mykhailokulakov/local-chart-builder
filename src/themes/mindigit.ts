import type { ThemeColors } from '../types/theme'

// Dead code — mindigit is no longer a ThemePreset.
// Kept to avoid breaking any external tooling that may reference this file.
const mindigit: ThemeColors = {
  background: '#0a2e1f',
  surface: 'rgba(255,255,255,0.06)',
  foreground: '#f5f0e8',
  muted: 'rgba(245,240,232,0.45)',
  foregroundTertiary: 'rgba(245,240,232,0.22)',
  accent: '#c5a24d',
  rule: 'rgba(245,240,232,0.07)',
  chartSecondary: 'rgba(76,175,122,0.50)',
  backgroundStatement: '#0a2e1f',
  foregroundStatement: '#f5f0e8',
  accentStatement: '#c5a24d',
  titleLine2Color: '#c5a24d',
  chartColors: [
    '#c5a24d',
    '#4caf7a',
    '#e8c97e',
    '#2d9f5e',
    '#f0e0a8',
    '#1a7a47',
    '#d4b87a',
    '#6dbf8e',
  ],
  fontFamily: "'e-Ukraine', sans-serif",
}

export default mindigit
