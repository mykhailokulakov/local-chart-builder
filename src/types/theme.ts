/** All built-in colour presets for the report output */
export enum ThemePreset {
  /** Dark background — Trident design system */
  dark = 'dark',
  /** Light background — Trident design system */
  light = 'light',
}

/** Resolved colour tokens for a single theme preset (Trident design system) */
export interface ThemeColors {
  // ---------------------------------------------------------------------------
  // Content slides (text, chart, divider)
  // ---------------------------------------------------------------------------

  /** Slide background fill for content slides */
  background: string
  /** Subtle surface elevation — used for chart grid lines and tile backgrounds */
  surface: string
  /** Primary text colour on content slides */
  foreground: string
  /** Secondary / muted text (rgba string with opacity baked in) */
  muted: string
  /** Tertiary text for footers and metadata (rgba string with opacity baked in) */
  foregroundTertiary: string
  /** Periwinkle accent — left-edge bar, section numbers, chart primary colour */
  accent: string
  /** Thin horizontal rules and axis lines (rgba string with opacity baked in) */
  rule: string
  /** Secondary chart bar colour (comparison / baseline series) */
  chartSecondary: string

  // ---------------------------------------------------------------------------
  // Statement slides (title, ending)
  // ---------------------------------------------------------------------------

  /** Background fill for title and ending slides */
  backgroundStatement: string
  /** Primary text colour on statement slide backgrounds */
  foregroundStatement: string
  /** Left-edge bar and accent marks on statement slide backgrounds */
  accentStatement: string
  /** Second line of the two-tone title (accent/contrast colour) */
  titleLine2Color: string

  // ---------------------------------------------------------------------------
  // Shared
  // ---------------------------------------------------------------------------

  /**
   * Ordered palette for chart series.
   * Chart renderers cycle through this array when assigning dataset colours.
   * Should contain at least 8 entries to handle multi-series charts.
   */
  chartColors: string[]
  /** CSS `font-family` value; must reference a font bundled in `public/fonts/` */
  fontFamily: string
}
