import type { SlideType } from '../types/slide'

/** Default width of the slide list sidebar in pixels */
export const SLIDE_PANEL_DEFAULT_PX = 200
/** Minimum width the slide list sidebar can be dragged to */
export const SLIDE_PANEL_MIN_PX = 160
/** Maximum width the slide list sidebar can be dragged to */
export const SLIDE_PANEL_MAX_PX = 320

/** Default width of the properties panel sidebar in pixels */
export const PROPERTIES_PANEL_DEFAULT_PX = 280
/** Minimum width the properties panel can be dragged to */
export const PROPERTIES_PANEL_MIN_PX = 220
/** Maximum width the properties panel can be dragged to */
export const PROPERTIES_PANEL_MAX_PX = 420

/** Minimum width of the canvas — ensures the slide preview stays usable */
export const CANVAS_MIN_PX = 400

/** Height of the application top bar in pixels */
export const TOP_BAR_HEIGHT_PX = 56

/**
 * Background colour of the application shell header.
 * Matches Ant Design's default dark-nav palette; referenced by the
 * Layout.headerBg component token in App.tsx's ConfigProvider.
 */
export const SHELL_HEADER_BG = '#001529'

/** Thumbnail background colour for each slide type */
export const SLIDE_TYPE_COLORS: Record<SlideType, string> = {
  title: '#1677ff',
  chart: '#52c41a',
  divider: '#fa8c16',
  text: '#722ed1',
  ending: '#13c2c2',
}

/** Slide display aspect ratio (16:9) */
export const SLIDE_ASPECT_RATIO = 16 / 9

/**
 * Font-size scale ratios for slide renderers.
 * Each value is multiplied by the slide height in pixels to produce a font-size
 * injected as a CSS custom property on the slide frame (--slide-fs-*).
 * Values are calibrated for 1920×1080 (16:9) as the reference resolution.
 */
export const SLIDE_FONT_SCALE_TITLE = 0.055 // ~59 px at 1080 px height
export const SLIDE_FONT_SCALE_HEADING = 0.038 // ~41 px at 1080 px height
export const SLIDE_FONT_SCALE_BODY = 0.022 // ~24 px at 1080 px height
export const SLIDE_FONT_SCALE_CAPTION = 0.016 // ~17 px at 1080 px height

/** Padding around the slide frame inside the canvas area, in pixels */
export const CANVAS_PADDING_PX = 32

/**
 * Minimum width of the Export PDF button in pixels.
 * Prevents layout shift when switching languages: the widest label across all
 * languages and export states ("Експортування…") determines this floor.
 */
export const EXPORT_BTN_MIN_WIDTH_PX = 130

/** Height of the tile toolbar above the slide frame, in pixels */
export const TILE_TOOLBAR_HEIGHT_PX = 44

/** Height of the status bar below the slide frame, in pixels */
export const STATUS_BAR_HEIGHT_PX = 32

/** Number of grid columns in the react-grid-layout tile grid */
export const GRID_COLS = 12

/** Number of grid rows used to compute row height */
export const GRID_ROWS = 8

/** Default tile width in grid columns when a new tile is added */
export const DEFAULT_TILE_W = 6

/** Default tile height in grid rows when a new tile is added */
export const DEFAULT_TILE_H = 4
