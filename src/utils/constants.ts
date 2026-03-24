/** Width of the slide list sidebar in pixels */
export const SLIDE_PANEL_WIDTH_PX = 200

/** Width of the properties panel sidebar in pixels */
export const PROPERTIES_PANEL_WIDTH_PX = 280

/** Height of the application top bar in pixels */
export const TOP_BAR_HEIGHT_PX = 56

/** Background colour of the application top bar */
export const TOPBAR_BG_COLOR = '#001529'

/** Minimum width of the Export PDF button in pixels — wide enough for the longest translation */
export const EXPORT_BTN_MIN_WIDTH_PX = 130

/** Thumbnail background colour for each slide type */
export const SLIDE_TYPE_COLORS: Record<string, string> = {
  title: '#1677ff',
  chart: '#52c41a',
  divider: '#fa8c16',
  text: '#722ed1',
  ending: '#13c2c2',
}

/** Slide display aspect ratio (16:9) */
export const SLIDE_ASPECT_RATIO = 16 / 9

/** Padding around the slide frame inside the canvas area, in pixels */
export const CANVAS_PADDING_PX = 32

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
