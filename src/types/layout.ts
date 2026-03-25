import type {
  ChartType,
  ChartData,
  ChartOptions,
  GanttTask,
  ChoroplethRegionData,
  DataTableRow,
  DataTableColumn,
} from './chart'

// ---------------------------------------------------------------------------
// react-grid-layout position descriptor
// ---------------------------------------------------------------------------

/**
 * Tile position and size on the slide grid.
 * Units are grid columns / rows as consumed by react-grid-layout v2.
 */
export interface GridLayout {
  /** Horizontal start position (0-indexed column) */
  x: number
  /** Vertical start position (0-indexed row) */
  y: number
  /** Width in grid columns */
  w: number
  /** Height in grid rows */
  h: number
}

// ---------------------------------------------------------------------------
// Text tile data
// ---------------------------------------------------------------------------

/** Content model for a free-text tile on a chart slide */
export interface TextData {
  /** Optional bold heading rendered above the body */
  heading?: string
  /** Main body copy (plain text; no embedded HTML) */
  body: string
  /** Horizontal text alignment within the tile */
  alignment: 'left' | 'center' | 'right'
  /**
   * Relative font size token.
   * Renderers map these to concrete pixel values based on the slide scale.
   */
  fontSize: 'small' | 'medium' | 'large'
}

// ---------------------------------------------------------------------------
// Gantt tile data wrapper
// ---------------------------------------------------------------------------

export interface GanttData {
  tasks: GanttTask[]
}

// ---------------------------------------------------------------------------
// Choropleth tile data wrapper
// ---------------------------------------------------------------------------

export interface ChoroplethData {
  regions: ChoroplethRegionData[]
  /** Label for the colour-scale legend (e.g. "Охоплення, %") */
  legendLabel?: string
}

// ---------------------------------------------------------------------------
// Data table tile data wrapper
// ---------------------------------------------------------------------------

export interface DataTableData {
  columns: DataTableColumn[]
  rows: DataTableRow[]
}

// ---------------------------------------------------------------------------
// Discriminated union for tile-level data
// ---------------------------------------------------------------------------

/**
 * All possible data payloads a tile can hold.
 * Narrow by the parent `TileConfig.type` field.
 */
export type TileData = ChartData | TextData | GanttData | ChoroplethData | DataTableData

// ---------------------------------------------------------------------------
// Tile configuration
// ---------------------------------------------------------------------------

/** A single draggable / resizable unit on a chart slide canvas */
export interface TileConfig {
  /** UUID assigned at creation */
  id: string
  /** Visualisation type rendered inside the tile */
  type: ChartType | 'text'
  /** Position and size on the react-grid-layout grid */
  layout: GridLayout
  /**
   * Tile content data.
   * The concrete shape depends on `type`:
   * - 'text'        → TextData
   * - 'gantt'       → GanttData
   * - 'choropleth'  → ChoroplethData
   * - 'data-table'  → DataTableData
   * - all others    → ChartData
   */
  data: TileData
  /** Rendering options (legend, axis, value labels) */
  options: ChartOptions
}
