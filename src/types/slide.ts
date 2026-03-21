import type { TileConfig } from './layout'
import type { ThemePreset } from './theme'

/** All possible slide layout variants */
export type SlideType = 'title' | 'chart' | 'divider' | 'text' | 'ending'

// ---------------------------------------------------------------------------
// Per-slide data shapes (discriminated union via `type` field)
// ---------------------------------------------------------------------------

export interface TitleSlideData {
  type: 'title'
  /** Main headline text */
  heading: string
  /** Optional subtitle below the heading */
  subheading?: string
  /** Optional date string displayed at the bottom (formatted by the renderer) */
  date?: string
  /** Optional name/role of the presenter */
  author?: string
}

export interface ChartSlideData {
  type: 'chart'
  /** Optional slide-level title rendered above the tile grid */
  title?: string
}

export interface DividerSlideData {
  type: 'divider'
  /** Section label shown in large type */
  label: string
  /** Optional one-line description beneath the label */
  description?: string
}

export interface TextSlideData {
  type: 'text'
  /** Slide heading */
  heading: string
  /** Rich text body (plain text; no HTML) */
  body: string
}

export interface EndingSlideData {
  type: 'ending'
  /** Closing message, e.g. "Дякуємо!" */
  message: string
  /** Optional contact info line */
  contact?: string
  /** Optional URL or additional note */
  footnote?: string
}

/** Discriminated union — narrow by `data.type` */
export type SlideData =
  | TitleSlideData
  | ChartSlideData
  | DividerSlideData
  | TextSlideData
  | EndingSlideData

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

export interface Slide {
  /** UUID assigned at creation */
  id: string
  type: SlideType
  data: SlideData
  /** Present only on slides of type 'chart'; holds the draggable tile grid */
  tiles?: TileConfig[]
}

export interface Report {
  slides: Slide[]
  theme: ThemePreset
  /** Display language for all user-visible strings in the rendered output */
  language: 'ua' | 'en'
}

// ---------------------------------------------------------------------------
// Undo / redo wrapper
// ---------------------------------------------------------------------------

export interface UndoableState {
  /** Previously committed report snapshots (capped at 50 entries) */
  past: Report[]
  /** The live report being edited */
  present: Report
  /** States that were undone and can be re-applied */
  future: Report[]
  /** Currently highlighted slide in the builder UI; not part of undo history */
  selectedSlideId: string | null
  /** Currently highlighted tile inside the active slide; not part of undo history */
  selectedTileId: string | null
}
