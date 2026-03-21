import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createUndoReducer, initialUndoableState } from '../../src/store/undoMiddleware'
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
import type { UndoableState, Slide, TitleSlideData, Report } from '../../src/types/slide'
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

function makeReport(slideIds: string[] = []): Report {
  return {
    slides: slideIds.map(makeSlide),
    theme: ThemePreset.light,
    language: 'ua',
  }
}

function stateWith(overrides: Partial<UndoableState> = {}): UndoableState {
  return { ...initialUndoableState, ...overrides }
}

// ---------------------------------------------------------------------------
// Each test gets a fresh reducer instance so debounce state doesn't bleed.
// ---------------------------------------------------------------------------

let reduce: ReturnType<typeof createUndoReducer>

beforeEach(() => {
  reduce = createUndoReducer()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Content-modifying actions push to history
// ---------------------------------------------------------------------------

describe('content-modifying actions', () => {
  it('ADD_SLIDE: pushes present to past and clears future', () => {
    const state = stateWith({ future: [makeReport()] })
    const slide = makeSlide('s1')
    const next = reduce(state, addSlide(slide))

    expect(next.past).toHaveLength(1)
    expect(next.past[0]).toBe(state.present)
    expect(next.present.slides).toHaveLength(1)
    expect(next.future).toHaveLength(0)
  })

  it('REMOVE_SLIDE: pushes to history and removes slide', () => {
    const report = makeReport(['s1', 's2'])
    const state = stateWith({ present: report })
    const next = reduce(state, removeSlide('s1'))

    expect(next.past).toHaveLength(1)
    expect(next.present.slides.map((s) => s.id)).toEqual(['s2'])
    expect(next.future).toHaveLength(0)
  })

  it('REORDER_SLIDE: pushes to history', () => {
    const report = makeReport(['a', 'b', 'c'])
    const state = stateWith({ present: report })
    const next = reduce(state, reorderSlide(0, 2))

    expect(next.past).toHaveLength(1)
    expect(next.present.slides.map((s) => s.id)).toEqual(['b', 'c', 'a'])
  })

  it('ADD_TILE: pushes to history', () => {
    const slide = makeSlide('s1')
    const report = makeReport(['s1'])
    report.slides[0] = slide
    const state = stateWith({ present: report })
    const next = reduce(state, addTile('s1', makeTile('t1')))

    expect(next.past).toHaveLength(1)
    expect(next.present.slides[0].tiles).toHaveLength(1)
  })

  it('REMOVE_TILE: pushes to history', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...makeReport(), slides: [slide] }
    const state = stateWith({ present: report })
    const next = reduce(state, removeTile('s1', 't1'))

    expect(next.past).toHaveLength(1)
    expect(next.present.slides[0].tiles).toHaveLength(0)
  })

  it('UPDATE_TILE_LAYOUT: pushes to history', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...makeReport(), slides: [slide] }
    const state = stateWith({ present: report })
    const next = reduce(state, updateTileLayout('s1', 't1', { x: 1, y: 1, w: 3, h: 3 }))

    expect(next.past).toHaveLength(1)
    expect(next.future).toHaveLength(0)
  })

  it('SET_THEME: pushes to history', () => {
    const state = stateWith()
    const next = reduce(state, setTheme(ThemePreset.dark))

    expect(next.past).toHaveLength(1)
    expect(next.present.theme).toBe(ThemePreset.dark)
    expect(next.future).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// UI-only actions do NOT push history
// ---------------------------------------------------------------------------

describe('UI-only actions do not push history', () => {
  it('SELECT_SLIDE: updates selectedSlideId without touching history', () => {
    const report = makeReport(['s1'])
    const state = stateWith({ present: report })
    const next = reduce(state, selectSlide('s1'))

    expect(next.past).toHaveLength(0)
    expect(next.future).toHaveLength(0)
    expect(next.selectedSlideId).toBe('s1')
    expect(next.selectedTileId).toBeNull()
  })

  it('SELECT_SLIDE: clears selectedTileId', () => {
    const state = stateWith({ selectedTileId: 't1' })
    const next = reduce(state, selectSlide('s1'))
    expect(next.selectedTileId).toBeNull()
  })

  it('SELECT_TILE: updates selectedTileId without touching history', () => {
    const state = stateWith()
    const next = reduce(state, selectTile('t1'))

    expect(next.past).toHaveLength(0)
    expect(next.selectedTileId).toBe('t1')
  })

  it('SET_LANGUAGE: applies to report but does not push history', () => {
    const state = stateWith()
    const next = reduce(state, setLanguage('en'))

    expect(next.past).toHaveLength(0)
    expect(next.future).toHaveLength(0)
    expect(next.present.language).toBe('en')
  })
})

// ---------------------------------------------------------------------------
// UNDO
// ---------------------------------------------------------------------------

describe('UNDO', () => {
  it('restores previous present from past', () => {
    const older = makeReport(['old'])
    const current = makeReport(['current'])
    const state = stateWith({ past: [older], present: current })
    const next = reduce(state, undo())

    expect(next.present).toBe(older)
    expect(next.past).toHaveLength(0)
    expect(next.future[0]).toBe(current)
  })

  it('is a no-op when past is empty', () => {
    const state = stateWith()
    const next = reduce(state, undo())
    expect(next).toBe(state)
  })

  it('accumulates multiple undos', () => {
    const r0 = makeReport([])
    const r1 = makeReport(['s1'])
    const r2 = makeReport(['s1', 's2'])
    let state = stateWith({ past: [r0, r1], present: r2 })

    state = reduce(state, undo())
    expect(state.present).toBe(r1)
    expect(state.past).toHaveLength(1)

    state = reduce(state, undo())
    expect(state.present).toBe(r0)
    expect(state.past).toHaveLength(0)
  })

  it('clears selectedSlideId when the selected slide no longer exists', () => {
    const past = makeReport([]) // no slides
    const current = makeReport(['s1'])
    const state = stateWith({ past: [past], present: current, selectedSlideId: 's1' })
    const next = reduce(state, undo())

    expect(next.selectedSlideId).toBeNull()
  })

  it('preserves selectedSlideId when the slide still exists', () => {
    const past = makeReport(['s1'])
    const current = makeReport(['s1', 's2'])
    const state = stateWith({ past: [past], present: current, selectedSlideId: 's1' })
    const next = reduce(state, undo())

    expect(next.selectedSlideId).toBe('s1')
  })
})

// ---------------------------------------------------------------------------
// REDO
// ---------------------------------------------------------------------------

describe('REDO', () => {
  it('re-applies a previously undone state', () => {
    const r0 = makeReport([])
    const r1 = makeReport(['s1'])
    const state = stateWith({ past: [r0], present: makeReport(), future: [r1] })
    const next = reduce(state, redo())

    expect(next.present).toBe(r1)
    expect(next.future).toHaveLength(0)
  })

  it('is a no-op when future is empty', () => {
    const state = stateWith()
    const next = reduce(state, redo())
    expect(next).toBe(state)
  })

  it('clears selectedSlideId when it no longer exists in the redo state', () => {
    const next_report = makeReport([]) // redo target has no slides
    const state = stateWith({ future: [next_report], selectedSlideId: 's1' })
    const next = reduce(state, redo())

    expect(next.selectedSlideId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// New content action clears the redo future
// ---------------------------------------------------------------------------

describe('new action clears future', () => {
  it('future is cleared after a new content action', () => {
    const future = [makeReport(['s1'])]
    const state = stateWith({ future })
    const next = reduce(state, addSlide(makeSlide('s2')))

    expect(next.future).toHaveLength(0)
  })

  it('undo then new action clears future', () => {
    const r0 = makeReport([])
    const r1 = makeReport(['s1'])
    let state = stateWith({ past: [r0], present: r1 })

    // Undo puts r1 in future
    state = reduce(state, undo())
    expect(state.future).toHaveLength(1)

    // New action clears it
    state = reduce(state, addSlide(makeSlide('s2')))
    expect(state.future).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// REMOVE_SLIDE: selection edge cases
// ---------------------------------------------------------------------------

describe('REMOVE_SLIDE selection cleanup', () => {
  it('clears selectedSlideId when the selected slide is removed', () => {
    const report = makeReport(['s1', 's2'])
    const state = stateWith({ present: report, selectedSlideId: 's1' })
    const next = reduce(state, removeSlide('s1'))

    expect(next.selectedSlideId).toBeNull()
    expect(next.selectedTileId).toBeNull()
  })

  it('preserves selectedSlideId when a different slide is removed', () => {
    const report = makeReport(['s1', 's2'])
    const state = stateWith({ present: report, selectedSlideId: 's2' })
    const next = reduce(state, removeSlide('s1'))

    expect(next.selectedSlideId).toBe('s2')
  })
})

// ---------------------------------------------------------------------------
// REMOVE_TILE: selection edge cases
// ---------------------------------------------------------------------------

describe('REMOVE_TILE selection cleanup', () => {
  it('clears selectedTileId when the selected tile is removed', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...makeReport(), slides: [slide] }
    const state = stateWith({ present: report, selectedSlideId: 's1', selectedTileId: 't1' })
    const next = reduce(state, removeTile('s1', 't1'))

    expect(next.selectedTileId).toBeNull()
    expect(next.selectedSlideId).toBe('s1')
  })

  it('preserves selectedTileId when a different tile is removed', () => {
    const tile1 = makeTile('t1')
    const tile2 = makeTile('t2')
    const slide = { ...makeSlide('s1'), tiles: [tile1, tile2] }
    const report = { ...makeReport(), slides: [slide] }
    const state = stateWith({ present: report, selectedSlideId: 's1', selectedTileId: 't2' })
    const next = reduce(state, removeTile('s1', 't1'))

    expect(next.selectedTileId).toBe('t2')
  })
})

// ---------------------------------------------------------------------------
// History depth limit (max 50)
// ---------------------------------------------------------------------------

describe('history depth limit', () => {
  it('caps past at 50 entries', () => {
    let state = stateWith()

    // Dispatch 60 ADD_SLIDE actions to fill past beyond 50
    for (let i = 0; i < 60; i++) {
      state = reduce(state, addSlide(makeSlide(`s${i}`)))
    }

    expect(state.past.length).toBeLessThanOrEqual(50)
    // The most recent 50 snapshots should be kept (oldest dropped)
    expect(state.past.length).toBe(50)
  })

  it('drops the oldest entries when limit is exceeded', () => {
    let state = stateWith()

    for (let i = 0; i < 52; i++) {
      state = reduce(state, addSlide(makeSlide(`s${i}`)))
    }

    // We dispatched 52 ADD_SLIDE actions.
    // The initial report had 0 slides; after 52 adds, present has 52 slides.
    // The past should hold the 50 most recent snapshots.
    expect(state.past.length).toBe(50)
    // The oldest entry in past should have had 2 slides (dropped 0 and 1-slide snapshots)
    expect(state.past[0].slides.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Debounce: UPDATE_SLIDE_DATA
// ---------------------------------------------------------------------------

describe('UPDATE_SLIDE_DATA debounce', () => {
  it('does not add a new history entry when same slideId within 500ms', () => {
    const report = makeReport(['s1'])
    const state = stateWith({ present: report })

    // First update — should push to past
    const s1 = reduce(state, updateSlideData('s1', { type: 'title', heading: 'v1' }))
    expect(s1.past).toHaveLength(1)

    // Second update within 500ms — should NOT push again
    vi.advanceTimersByTime(100)
    const s2 = reduce(s1, updateSlideData('s1', { type: 'title', heading: 'v2' }))
    expect(s2.past).toHaveLength(1)
    expect(s2.present.slides[0].data).toMatchObject({ heading: 'v2' })
  })

  it('adds a new history entry after 500ms elapsed', () => {
    const report = makeReport(['s1'])
    const state = stateWith({ present: report })

    const s1 = reduce(state, updateSlideData('s1', { type: 'title', heading: 'v1' }))
    expect(s1.past).toHaveLength(1)

    vi.advanceTimersByTime(501)
    const s2 = reduce(s1, updateSlideData('s1', { type: 'title', heading: 'v2' }))
    expect(s2.past).toHaveLength(2)
  })

  it('adds a new history entry when targeting a different slideId', () => {
    const report = makeReport(['s1', 's2'])
    const state = stateWith({ present: report })

    const s1 = reduce(state, updateSlideData('s1', { type: 'title', heading: 'v1' }))
    expect(s1.past).toHaveLength(1)

    vi.advanceTimersByTime(100)
    const s2 = reduce(s1, updateSlideData('s2', { type: 'title', heading: 'v2' }))
    expect(s2.past).toHaveLength(2)
  })

  it('clears future even for debounced updates', () => {
    const report = makeReport(['s1'])
    const future = [makeReport(['old'])]
    const state = stateWith({ present: report, future })

    const s1 = reduce(state, updateSlideData('s1', { type: 'title', heading: 'v1' }))
    vi.advanceTimersByTime(100)
    const s2 = reduce(s1, updateSlideData('s1', { type: 'title', heading: 'v2' }))

    expect(s2.future).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Debounce: UPDATE_TILE_DATA
// ---------------------------------------------------------------------------

describe('UPDATE_TILE_DATA debounce', () => {
  it('does not add history entry when same tileId within 500ms', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...makeReport(), slides: [slide] }
    const state = stateWith({ present: report })

    const s1 = reduce(state, updateTileData('s1', 't1', { points: [{ label: 'B', value: 2 }] }))
    expect(s1.past).toHaveLength(1)

    vi.advanceTimersByTime(200)
    const s2 = reduce(s1, updateTileData('s1', 't1', { points: [{ label: 'C', value: 3 }] }))
    expect(s2.past).toHaveLength(1)
  })

  it('adds history entry after 500ms', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...makeReport(), slides: [slide] }
    const state = stateWith({ present: report })

    const s1 = reduce(state, updateTileData('s1', 't1', { points: [{ label: 'B', value: 2 }] }))
    vi.advanceTimersByTime(600)
    const s2 = reduce(s1, updateTileData('s1', 't1', { points: [{ label: 'C', value: 3 }] }))
    expect(s2.past).toHaveLength(2)
  })

  it('does not debounce across different action types', () => {
    const tile = makeTile('t1')
    const slide = { ...makeSlide('s1'), tiles: [tile] }
    const report = { ...makeReport(), slides: [slide] }
    const state = stateWith({ present: report })

    // First: UPDATE_SLIDE_DATA
    const s1 = reduce(state, updateSlideData('s1', { type: 'title', heading: 'v1' }))
    vi.advanceTimersByTime(100)

    // Second: UPDATE_TILE_DATA — different action type, should push new history
    const s2 = reduce(s1, updateTileData('s1', 't1', { points: [] }))
    expect(s2.past).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Undo/redo interaction: debounce resets on UNDO/REDO
// ---------------------------------------------------------------------------

describe('debounce resets after UNDO/REDO', () => {
  it('first UPDATE_SLIDE_DATA after UNDO pushes to history (no debounce)', () => {
    const report = makeReport(['s1'])
    const past = [makeReport([])]
    const state = stateWith({ past, present: report })

    // Undo
    const afterUndo = reduce(state, undo())

    // First update after undo — should push to history (debounce was reset)
    const afterUpdate = reduce(afterUndo, updateSlideData('s1', { type: 'title', heading: 'v1' }))
    expect(afterUpdate.past).toHaveLength(1)
  })
})
