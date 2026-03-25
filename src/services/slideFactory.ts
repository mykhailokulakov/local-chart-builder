import type { Slide, SlideType } from '../types/slide'
import type { TileConfig } from '../types/layout'
import type { ChartType } from '../types/chart'
import { DEFAULT_TILE_W, DEFAULT_TILE_H } from '../utils/constants'

/**
 * Creates a new TileConfig with a fresh UUID and empty default data for the
 * given tile type. Pure function — no React imports, no side effects.
 */
export function createTile(type: ChartType | 'text'): TileConfig {
  const id = crypto.randomUUID()
  const layout = { x: 0, y: 0, w: DEFAULT_TILE_W, h: DEFAULT_TILE_H }
  const options = { showValues: false, showLegend: true, showAxis: true }

  switch (type) {
    case 'bar-v':
    case 'bar-h':
    case 'donut':
    case 'line':
      return { id, type, layout, data: { points: [] }, options }
    case 'gantt':
      return { id, type, layout, data: { tasks: [] }, options }
    case 'choropleth':
      return { id, type, layout, data: { regions: [] }, options }
    case 'data-table':
      return { id, type, layout, data: { columns: [], rows: [], rowIds: [] }, options }
    case 'text':
      return {
        id,
        type,
        layout,
        data: { body: '', alignment: 'left', fontSize: 'medium' },
        options,
      }
  }
}

/**
 * Creates a new Slide with a fresh UUID and sensible default data for the
 * given SlideType. Pure function — no React imports, no side effects.
 */
export function createSlide(type: SlideType): Slide {
  const id = crypto.randomUUID()

  switch (type) {
    case 'title':
      return { id, type, data: { type: 'title', heading: '' } }
    case 'chart':
      return { id, type, data: { type: 'chart' }, tiles: [] }
    case 'divider':
      return { id, type, data: { type: 'divider', label: '' } }
    case 'text':
      return { id, type, data: { type: 'text', heading: '', body: '' } }
    case 'ending':
      return { id, type, data: { type: 'ending', message: '' } }
  }
}
