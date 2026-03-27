import { describe, test, expect } from 'vitest'
import {
  findFreeTilePosition,
  resolveNewTileLayout,
  canAddTile,
} from '../../src/services/layoutEngine'
import type { TileConfig } from '../../src/types/layout'
import type { GridLayout } from '../../src/types/layout'
import {
  GRID_COLS,
  GRID_ROWS,
  DEFAULT_TILE_W,
  DEFAULT_TILE_H,
  MIN_TILE_W,
  MIN_TILE_H,
} from '../../src/utils/constants'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeTile(layout: GridLayout): TileConfig {
  return {
    id: `tile-${layout.x}-${layout.y}`,
    type: 'bar-v',
    layout,
    data: { points: [] },
    options: { showValues: false, showLegend: true, showAxis: true },
  }
}

/** Fills the entire grid with MIN_TILE_W × MIN_TILE_H tiles. */
function fullGrid(): TileConfig[] {
  const tiles: TileConfig[] = []
  const cols = GRID_COLS / MIN_TILE_W // 4
  const rows = GRID_ROWS / MIN_TILE_H // 4
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push(
        makeTile({ x: col * MIN_TILE_W, y: row * MIN_TILE_H, w: MIN_TILE_W, h: MIN_TILE_H }),
      )
    }
  }
  return tiles
}

// ---------------------------------------------------------------------------
// findFreeTilePosition
// ---------------------------------------------------------------------------

describe('findFreeTilePosition', () => {
  test('returns {x:0, y:0} for an empty tile list', () => {
    expect(findFreeTilePosition([], 6, 4)).toEqual({ x: 0, y: 0 })
  })

  test('places to the right of a single existing tile in the same row', () => {
    const tiles = [makeTile({ x: 0, y: 0, w: 6, h: 4 })]
    expect(findFreeTilePosition(tiles, 6, 4)).toEqual({ x: 6, y: 0 })
  })

  test('wraps to the next row when the current row is full', () => {
    const tiles = [makeTile({ x: 0, y: 0, w: 6, h: 4 }), makeTile({ x: 6, y: 0, w: 6, h: 4 })]
    expect(findFreeTilePosition(tiles, 6, 4)).toEqual({ x: 0, y: 4 })
  })

  test('finds a gap between two tiles in the same row', () => {
    // row 0 occupied at x=0..2 and x=6..11, gap at x=3..5 (w=3)
    const tiles = [makeTile({ x: 0, y: 0, w: 3, h: 4 }), makeTile({ x: 6, y: 0, w: 6, h: 4 })]
    expect(findFreeTilePosition(tiles, 3, 4)).toEqual({ x: 3, y: 0 })
  })

  test('respects right boundary — does not place tile beyond GRID_COLS', () => {
    // blocks columns 0-9 in row 0; only 2 columns remain (10-11), need w=3
    const tiles = [makeTile({ x: 0, y: 0, w: 10, h: 4 })]
    const result = findFreeTilePosition(tiles, 3, 4)
    // x=10 + w=3 = 13 > GRID_COLS=12, so must go to next row
    expect(result).not.toBeNull()
    expect(result?.y).toBeGreaterThan(0)
  })

  test('respects bottom boundary — does not place tile beyond GRID_ROWS', () => {
    // blocks row 6-7 entirely; tries to place h=3 tile
    const tiles = [makeTile({ x: 0, y: 6, w: GRID_COLS, h: 2 })]
    const result = findFreeTilePosition(tiles, 6, 3)
    // y=6 with h=3 would end at 9 > GRID_ROWS=8, so valid y must be <= 5
    expect(result).not.toBeNull()
    expect((result?.y ?? 99) + 3).toBeLessThanOrEqual(GRID_ROWS)
  })

  test('returns null when the grid is completely packed', () => {
    expect(findFreeTilePosition(fullGrid(), MIN_TILE_W, MIN_TILE_H)).toBeNull()
  })

  test('returns null when remaining space is smaller than requested size', () => {
    // Only a 2×2 area free at the bottom-right; request w=3
    const tiles = [
      makeTile({ x: 0, y: 0, w: GRID_COLS, h: 6 }), // top 6 rows full
      makeTile({ x: 0, y: 6, w: 10, h: 2 }), // bottom-left blocked
    ]
    // Free area: x=10..11, y=6..7 — only 2 wide, need 3
    expect(findFreeTilePosition(tiles, 3, 2)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// resolveNewTileLayout
// ---------------------------------------------------------------------------

describe('resolveNewTileLayout', () => {
  test('returns default-size layout for an empty slide', () => {
    expect(resolveNewTileLayout([])).toEqual({
      x: 0,
      y: 0,
      w: DEFAULT_TILE_W,
      h: DEFAULT_TILE_H,
    })
  })

  test('returns default size when partial space remains in the first row', () => {
    const tiles = [makeTile({ x: 0, y: 0, w: 4, h: DEFAULT_TILE_H })]
    const layout = resolveNewTileLayout(tiles)
    expect(layout?.w).toBe(DEFAULT_TILE_W)
    expect(layout?.h).toBe(DEFAULT_TILE_H)
  })

  test('falls back to minimum size when no room for default but min fits', () => {
    // Fill grid leaving only a 3×2 slot at x=9, y=0
    const tiles = [
      makeTile({ x: 0, y: 0, w: 9, h: GRID_ROWS }), // left block
      makeTile({ x: 9, y: MIN_TILE_H, w: MIN_TILE_W, h: GRID_ROWS - MIN_TILE_H }), // right block below row 2
    ]
    // Free: x=9..11, y=0..1 (3×2) — too small for default (6×4), fits min (3×2)
    const layout = resolveNewTileLayout(tiles)
    expect(layout).toEqual({ x: 9, y: 0, w: MIN_TILE_W, h: MIN_TILE_H })
  })

  test('returns null when grid is completely packed', () => {
    expect(resolveNewTileLayout(fullGrid())).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// canAddTile
// ---------------------------------------------------------------------------

describe('canAddTile', () => {
  test('returns true for an empty slide', () => {
    expect(canAddTile([])).toBe(true)
  })

  test('returns true when minimum tile space exists', () => {
    // Leave exactly a 3×2 gap
    const tiles = [
      makeTile({ x: 0, y: 0, w: 9, h: GRID_ROWS }),
      makeTile({ x: 9, y: MIN_TILE_H, w: MIN_TILE_W, h: GRID_ROWS - MIN_TILE_H }),
    ]
    expect(canAddTile(tiles)).toBe(true)
  })

  test('returns false when the grid is fully packed', () => {
    expect(canAddTile(fullGrid())).toBe(false)
  })

  test('returns false when remaining space is smaller than minimum tile size', () => {
    // Only a 2×2 area free — smaller than MIN_TILE_W=3 × MIN_TILE_H=2
    const tiles = [
      makeTile({ x: 0, y: 0, w: GRID_COLS, h: 6 }),
      makeTile({ x: 0, y: 6, w: 10, h: 2 }),
    ]
    expect(canAddTile(tiles)).toBe(false)
  })
})
