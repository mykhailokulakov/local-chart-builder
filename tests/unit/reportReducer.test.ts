import { describe, it, expect } from 'vitest'
import { reportReducer, initialReport } from '../../src/store/reportReducer'
import {
  addSlide,
  removeSlide,
  reorderSlide,
  updateSlideData,
  addTile,
  removeTile,
  updateTileData,
  updateTileLayout,
  setTheme,
  setLanguage,
  selectSlide,
  selectTile,
  undo,
  redo,
} from '../../src/store/actions'
import { ThemePreset } from '../../src/types/theme'
import type { Slide, TitleSlideData } from '../../src/types/slide'
import type { TileConfig } from '../../src/types/layout'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSlide(id: string): Slide {
  return {
    id,
    type: 'title',
    data: { type: 'title', heading: `Slide ${id}` } satisfies TitleSlideData,
  }
}

function makeTile(id: string): TileConfig {
  return {
    id,
    type: 'bar-v',
    layout: { x: 0, y: 0, w: 6, h: 4 },
    data: { points: [{ label: 'A', value: 1 }] },
    options: {},
  }
}

function reportWithSlides(...ids: string[]) {
  return { ...initialReport, slides: ids.map(makeSlide) }
}

// ---------------------------------------------------------------------------
// ADD_SLIDE
// ---------------------------------------------------------------------------

describe('ADD_SLIDE', () => {
  it('appends a slide to an empty report', () => {
    const slide = makeSlide('s1')
    const next = reportReducer(initialReport, addSlide(slide))
    expect(next.slides).toHaveLength(1)
    expect(next.slides[0]).toBe(slide)
  })

  it('appends a slide after existing slides', () => {
    const report = reportWithSlides('s1', 's2')
    const newSlide = makeSlide('s3')
    const next = reportReducer(report, addSlide(newSlide))
    expect(next.slides).toHaveLength(3)
    expect(next.slides[2].id).toBe('s3')
  })

  it('does not mutate the original slides array', () => {
    const report = reportWithSlides('s1')
    const original = report.slides
    reportReducer(report, addSlide(makeSlide('s2')))
    expect(report.slides).toBe(original)
  })
})

// ---------------------------------------------------------------------------
// REMOVE_SLIDE
// ---------------------------------------------------------------------------

describe('REMOVE_SLIDE', () => {
  it('removes a slide by id', () => {
    const report = reportWithSlides('s1', 's2', 's3')
    const next = reportReducer(report, removeSlide('s2'))
    expect(next.slides.map((s) => s.id)).toEqual(['s1', 's3'])
  })

  it('is a no-op when the id does not exist', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, removeSlide('nonexistent'))
    expect(next.slides).toHaveLength(1)
  })

  it('produces an empty slides array when last slide is removed', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, removeSlide('s1'))
    expect(next.slides).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// REORDER_SLIDE
// ---------------------------------------------------------------------------

describe('REORDER_SLIDE', () => {
  it('moves a slide forward', () => {
    const report = reportWithSlides('a', 'b', 'c', 'd')
    const next = reportReducer(report, reorderSlide(0, 2))
    expect(next.slides.map((s) => s.id)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves a slide backward', () => {
    const report = reportWithSlides('a', 'b', 'c', 'd')
    const next = reportReducer(report, reorderSlide(3, 1))
    expect(next.slides.map((s) => s.id)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('is a no-op when from === to', () => {
    const report = reportWithSlides('a', 'b', 'c')
    const next = reportReducer(report, reorderSlide(1, 1))
    expect(next.slides.map((s) => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('clamps fromIndex below 0 to 0', () => {
    const report = reportWithSlides('a', 'b', 'c')
    const next = reportReducer(report, reorderSlide(-5, 2))
    expect(next.slides.map((s) => s.id)).toEqual(['b', 'c', 'a'])
  })

  it('clamps toIndex beyond last index', () => {
    const report = reportWithSlides('a', 'b', 'c')
    const next = reportReducer(report, reorderSlide(0, 99))
    expect(next.slides.map((s) => s.id)).toEqual(['b', 'c', 'a'])
  })

  it('clamps both indices on an empty report without throwing', () => {
    const next = reportReducer(initialReport, reorderSlide(0, 1))
    expect(next.slides).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// UPDATE_SLIDE_DATA
// ---------------------------------------------------------------------------

describe('UPDATE_SLIDE_DATA', () => {
  it('updates the data of the matching slide', () => {
    const report = reportWithSlides('s1', 's2')
    const newData: TitleSlideData = { type: 'title', heading: 'Updated' }
    const next = reportReducer(report, updateSlideData('s1', newData))
    expect(next.slides[0].data).toEqual(newData)
    expect(next.slides[1].data).toEqual(report.slides[1].data)
  })

  it('is a no-op when the slide id does not exist', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, updateSlideData('ghost', { type: 'title', heading: 'X' }))
    expect(next).toBe(report)
  })
})

// ---------------------------------------------------------------------------
// ADD_TILE
// ---------------------------------------------------------------------------

describe('ADD_TILE', () => {
  it('adds a tile to a slide', () => {
    const slide = makeSlide('s1')
    const report = { ...initialReport, slides: [slide] }
    const tile = makeTile('t1')
    const next = reportReducer(report, addTile('s1', tile))
    expect(next.slides[0].tiles).toHaveLength(1)
    expect(next.slides[0].tiles?.[0]).toBe(tile)
  })

  it('appends tile to existing tiles array', () => {
    const slide = { ...makeSlide('s1'), tiles: [makeTile('t1')] }
    const report = { ...initialReport, slides: [slide] }
    const next = reportReducer(report, addTile('s1', makeTile('t2')))
    expect(next.slides[0].tiles).toHaveLength(2)
  })

  it('is a no-op when slide does not exist', () => {
    const next = reportReducer(initialReport, addTile('ghost', makeTile('t1')))
    expect(next).toBe(initialReport)
  })
})

// ---------------------------------------------------------------------------
// REMOVE_TILE
// ---------------------------------------------------------------------------

describe('REMOVE_TILE', () => {
  it('removes the tile with the matching id', () => {
    const tile1 = makeTile('t1')
    const tile2 = makeTile('t2')
    const slide = { ...makeSlide('s1'), tiles: [tile1, tile2] }
    const report = { ...initialReport, slides: [slide] }
    const next = reportReducer(report, removeTile('s1', 't1'))
    expect(next.slides[0].tiles).toHaveLength(1)
    expect(next.slides[0].tiles?.[0].id).toBe('t2')
  })

  it('is a no-op when the slide does not exist', () => {
    const next = reportReducer(initialReport, removeTile('ghost', 't1'))
    expect(next).toBe(initialReport)
  })

  it('is a no-op when the tile does not exist', () => {
    const slide = { ...makeSlide('s1'), tiles: [makeTile('t1')] }
    const report = { ...initialReport, slides: [slide] }
    const next = reportReducer(report, removeTile('s1', 'ghost'))
    expect(next.slides[0].tiles).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// UPDATE_TILE_DATA
// ---------------------------------------------------------------------------

describe('UPDATE_TILE_DATA', () => {
  it('updates the data of the matching tile', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...initialReport, slides: [slide] }
    const newData = { points: [{ label: 'B', value: 42 }] }
    const next = reportReducer(report, updateTileData('s1', 't1', newData))
    expect(next.slides[0].tiles?.[0].data).toEqual(newData)
  })

  it('is a no-op when slide does not exist', () => {
    const next = reportReducer(initialReport, updateTileData('ghost', 't1', {}))
    expect(next).toBe(initialReport)
  })

  it('is a no-op when tile does not exist', () => {
    const slide = { ...makeSlide('s1'), tiles: [makeTile('t1')] }
    const report = { ...initialReport, slides: [slide] }
    const next = reportReducer(report, updateTileData('s1', 'ghost', {}))
    expect(next).toBe(report)
  })
})

// ---------------------------------------------------------------------------
// UPDATE_TILE_LAYOUT
// ---------------------------------------------------------------------------

describe('UPDATE_TILE_LAYOUT', () => {
  it('updates the layout of the matching tile', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...initialReport, slides: [slide] }
    const newLayout = { x: 3, y: 2, w: 4, h: 5 }
    const next = reportReducer(report, updateTileLayout('s1', 't1', newLayout))
    expect(next.slides[0].tiles?.[0].layout).toEqual(newLayout)
  })

  it('is a no-op when slide does not exist', () => {
    const next = reportReducer(
      initialReport,
      updateTileLayout('ghost', 't1', { x: 0, y: 0, w: 1, h: 1 }),
    )
    expect(next).toBe(initialReport)
  })
})

// ---------------------------------------------------------------------------
// SET_THEME
// ---------------------------------------------------------------------------

describe('SET_THEME', () => {
  it('updates the theme', () => {
    const next = reportReducer(initialReport, setTheme(ThemePreset.dark))
    expect(next.theme).toBe(ThemePreset.dark)
  })

  it('does not affect slides', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, setTheme(ThemePreset.light))
    expect(next.slides).toEqual(report.slides)
  })
})

// ---------------------------------------------------------------------------
// SET_LANGUAGE
// ---------------------------------------------------------------------------

describe('SET_LANGUAGE', () => {
  it('sets language to en', () => {
    const next = reportReducer(initialReport, setLanguage('en'))
    expect(next.language).toBe('en')
  })

  it('sets language back to ua', () => {
    const report = { ...initialReport, language: 'en' as const }
    const next = reportReducer(report, setLanguage('ua'))
    expect(next.language).toBe('ua')
  })
})

// ---------------------------------------------------------------------------
// UI-only actions (SELECT_SLIDE, SELECT_TILE, UNDO, REDO) — no-ops on Report
// ---------------------------------------------------------------------------

describe('UI-only actions', () => {
  it('SELECT_SLIDE returns the same report reference', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, selectSlide('s1'))
    expect(next).toBe(report)
  })

  it('SELECT_TILE returns the same report reference', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, selectTile('t1'))
    expect(next).toBe(report)
  })

  it('UNDO returns the same report reference', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, undo())
    expect(next).toBe(report)
  })

  it('REDO returns the same report reference', () => {
    const report = reportWithSlides('s1')
    const next = reportReducer(report, redo())
    expect(next).toBe(report)
  })
})
