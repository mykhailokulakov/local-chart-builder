/** All supported chart / visualisation types that can appear inside a tile */
export type ChartType = 'bar-v' | 'bar-h' | 'donut' | 'line' | 'gantt' | 'choropleth' | 'data-table'

// ---------------------------------------------------------------------------
// Generic chart data shapes
// ---------------------------------------------------------------------------

/** A single data point used by bar, donut, and line charts */
export interface ChartDataPoint {
  /**
   * Stable client-side identifier used by the editor for React list keys.
   * Assigned when a point is created or imported; not required by chart renderers.
   */
  id?: string
  /** Category label shown on the axis or in the legend */
  label: string
  /** Numeric measurement */
  value: number
  /** Optional override colour for this specific point (hex) */
  color?: string
}

/**
 * Multi-series data used when a single chart needs several datasets
 * (e.g. grouped bar chart, multi-line chart).
 */
export interface ChartSeries {
  /** Series name displayed in the legend */
  name: string
  /** Ordered data points; labels must align across all series */
  points: ChartDataPoint[]
}

/**
 * Top-level chart data union.
 * Simple charts use `points`; multi-series charts use `series`.
 * Exactly one of the two should be present.
 */
export interface ChartData {
  /** Optional title displayed above the chart in the tile */
  title?: string
  /** Single-series data (bar-v, bar-h, donut, line) */
  points?: ChartDataPoint[]
  /** Multi-series data (grouped / stacked bar, multi-line) */
  series?: ChartSeries[]
}

// ---------------------------------------------------------------------------
// Gantt-specific types
// ---------------------------------------------------------------------------

/** Execution status of a Gantt task */
export type GanttTaskStatus = 'done' | 'in-progress' | 'planned'

/** A single row in a Gantt chart */
export interface GanttTask {
  /** Unique identifier for the task */
  id: string
  /** Human-readable task name shown on the Y-axis */
  name: string
  /** Start month 1–12 (January = 1) */
  startMonth: number
  /** End month 1–12, inclusive */
  endMonth: number
  /** Execution status drives bar colour and label */
  status: GanttTaskStatus
}

// ---------------------------------------------------------------------------
// Choropleth-specific types
// ---------------------------------------------------------------------------

/** Data binding for a single Ukrainian oblast in the choropleth map */
export interface ChoroplethRegionData {
  /**
   * Oblast identifier that matches the `name` property in
   * `assets/ukraine-oblasts.geojson`.
   */
  regionId: string
  /** Human-readable oblast name (used in tooltip) */
  label: string
  /** Numeric value that drives the colour scale */
  value: number
}

// ---------------------------------------------------------------------------
// Data table types
// ---------------------------------------------------------------------------

/**
 * A single row in a data table tile.
 * Keys are column identifiers; values are the cell content.
 */
export type DataTableRow = Record<string, string | number>

/** Column descriptor for a data table */
export interface DataTableColumn {
  /** Unique column key matching keys in `DataTableRow` */
  key: string
  /** Header text displayed in the table */
  header: string
  /** Horizontal text alignment within the column */
  align?: 'left' | 'center' | 'right'
}

// ---------------------------------------------------------------------------
// Chart rendering options
// ---------------------------------------------------------------------------

/** Display toggles shared across all chart types */
export interface ChartOptions {
  /** Render numeric value labels on bars / slices / data points */
  showValues?: boolean
  /** Render the chart legend */
  showLegend?: boolean
  /** Render axis lines and tick labels */
  showAxis?: boolean
  /** Render the header row in data tables */
  showHeader?: boolean
  /** Apply alternating row background colours in data tables */
  striped?: boolean
  /** Render cell and table borders in data tables */
  bordered?: boolean
}
