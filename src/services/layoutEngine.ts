import type { GridLayout, TileConfig } from '../types/layout'
import {
  GRID_COLS,
  GRID_ROWS,
  DEFAULT_TILE_W,
  DEFAULT_TILE_H,
  MIN_TILE_W,
  MIN_TILE_H,
} from '../utils/constants'

/**
 * Returns true if a candidate rectangle at (cx, cy) with size (cw, ch)
 * overlaps an existing tile layout.
 */
function overlapsExisting(
  existing: GridLayout,
  cx: number,
  cy: number,
  cw: number,
  ch: number,
): boolean {
  return (
    cx < existing.x + existing.w &&
    cx + cw > existing.x &&
    cy < existing.y + existing.h &&
    cy + ch > existing.y
  )
}

/**
 * Scans the grid row-first, left-to-right and returns the first (x, y) where
 * a tile of size (w, h) fits within bounds without overlapping existing tiles.
 * Returns null if no valid position exists.
 */
export function findFreeTilePosition(
  tiles: TileConfig[],
  w: number,
  h: number,
): { x: number; y: number } | null {
  for (let y = 0; y <= GRID_ROWS - h; y++) {
    for (let x = 0; x <= GRID_COLS - w; x++) {
      const blocked = tiles.some((t) => overlapsExisting(t.layout, x, y, w, h))
      if (!blocked) return { x, y }
    }
  }
  return null
}

/**
 * Resolves the best available GridLayout for a new tile.
 * Tries DEFAULT_TILE_W × DEFAULT_TILE_H first; falls back to MIN_TILE_W × MIN_TILE_H.
 * Returns null only when no space is available at minimum size.
 */
export function resolveNewTileLayout(tiles: TileConfig[]): GridLayout | null {
  const defaultPos = findFreeTilePosition(tiles, DEFAULT_TILE_W, DEFAULT_TILE_H)
  if (defaultPos !== null) {
    return { ...defaultPos, w: DEFAULT_TILE_W, h: DEFAULT_TILE_H }
  }

  const minPos = findFreeTilePosition(tiles, MIN_TILE_W, MIN_TILE_H)
  if (minPos !== null) {
    return { ...minPos, w: MIN_TILE_W, h: MIN_TILE_H }
  }

  return null
}

/**
 * Returns true if there is room to add at least one more tile at minimum size.
 * Used to enable/disable the add-tile controls in the toolbar.
 */
export function canAddTile(tiles: TileConfig[]): boolean {
  return findFreeTilePosition(tiles, MIN_TILE_W, MIN_TILE_H) !== null
}
