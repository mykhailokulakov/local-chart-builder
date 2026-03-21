/** All built-in colour presets for the report output */
export enum ThemePreset {
  /** Dark background — NCSI / Diia City visual style */
  dark = 'dark',
  /** Dark green + gold — official Ministry of Digital Transformation palette */
  mindigit = 'mindigit',
  /** White background with vivid chart colours */
  light = 'light',
  /** Dark gray with muted, desaturated tones */
  slate = 'slate',
}

/** Resolved colour tokens for a single theme preset */
export interface ThemeColors {
  /** Slide background fill (hex or CSS colour) */
  background: string
  /** Slightly elevated surface colour for cards, panels and tile backgrounds */
  surface: string
  /** Primary text colour */
  foreground: string
  /** Subdued text colour for secondary labels and captions */
  muted: string
  /** Highlight / call-to-action colour used for headings and key values */
  accent: string
  /** Secondary accent used for decorative dividers and supporting highlights */
  accentSecondary: string
  /**
   * Ordered palette for chart series.
   * Chart renderers cycle through this array when assigning dataset colours.
   * Should contain at least 8 entries to handle multi-series charts.
   */
  chartColors: string[]
  /** CSS `font-family` value; must reference a font bundled in `public/fonts/` */
  fontFamily: string
}
