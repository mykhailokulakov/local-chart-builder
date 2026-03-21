import type { ThemeColors } from '../types/theme'

/**
 * Light theme — inspired by the tech ecosystem dashboard.
 * White/light-gray background with vivid green, orange, and blue chart fills.
 */
const light: ThemeColors = {
  background: '#ffffff',
  surface: '#f3f4f6',
  foreground: '#111827',
  muted: '#6b7280',
  accent: '#2563eb',
  accentSecondary: '#16a34a',
  chartColors: [
    '#16a34a',
    '#ea580c',
    '#2563eb',
    '#d97706',
    '#7c3aed',
    '#0891b2',
    '#dc2626',
    '#0d9488',
  ],
  fontFamily: "'e-Ukraine', sans-serif",
}

export default light
