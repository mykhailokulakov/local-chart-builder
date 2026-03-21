import type { Report, UndoableState } from '../types/slide'
import type { ReportAction } from './actions'
import { reportReducer, initialReport } from './reportReducer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50
const DEBOUNCE_MS = 500

// ---------------------------------------------------------------------------
// Initial undoable state
// ---------------------------------------------------------------------------

export const initialUndoableState: UndoableState = {
  past: [],
  present: initialReport,
  future: [],
  selectedSlideId: null,
  selectedTileId: null,
}

// ---------------------------------------------------------------------------
// Internal debounce tracking (lives in the closure created by the factory)
// ---------------------------------------------------------------------------

interface LastDebounceEntry {
  actionType: 'UPDATE_SLIDE_DATA' | 'UPDATE_TILE_DATA'
  /** slideId for UPDATE_SLIDE_DATA; tileId for UPDATE_TILE_DATA */
  targetId: string
  timestamp: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Push the current present into past, respecting the max-history cap. */
function pushToPast(past: Report[], present: Report): Report[] {
  const next = [...past, present]
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next
}

/**
 * Checks whether the selected slide still exists after a Report update.
 * Returns null if it does not, preserving the id if it does.
 */
function resolveSelectedSlideId(
  slides: Report['slides'],
  selectedSlideId: string | null,
): string | null {
  if (selectedSlideId === null) return null
  return slides.some((s) => s.id === selectedSlideId) ? selectedSlideId : null
}

/**
 * Checks whether the selected tile still exists in the selected slide.
 * Returns null if either the slide or the tile is gone.
 */
function resolveSelectedTileId(
  slides: Report['slides'],
  selectedSlideId: string | null,
  selectedTileId: string | null,
): string | null {
  if (selectedTileId === null || selectedSlideId === null) return null
  const slide = slides.find((s) => s.id === selectedSlideId)
  if (!slide) return null
  return (slide.tiles ?? []).some((t) => t.id === selectedTileId) ? selectedTileId : null
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates an undo-aware reducer that wraps `reportReducer`.
 *
 * Call this **once** (outside any React component) and pass the resulting
 * function to `useReducer`. The returned function closes over mutable
 * debounce tracking state — this is intentional and safe because a single
 * reducer instance is shared for the lifetime of the provider.
 */
export function createUndoReducer(
  baseReducer: (report: Report, action: ReportAction) => Report = reportReducer,
): (state: UndoableState, action: ReportAction) => UndoableState {
  let lastDebounce: LastDebounceEntry | null = null

  return function undoReducer(state: UndoableState, action: ReportAction): UndoableState {
    switch (action.type) {
      // -----------------------------------------------------------------------
      // UNDO
      // -----------------------------------------------------------------------
      case 'UNDO': {
        if (state.past.length === 0) return state

        const previous = state.past[state.past.length - 1]
        const newPast = state.past.slice(0, -1)
        const newFuture = [state.present, ...state.future]

        // Validate selection against the restored report
        const newSelectedSlideId = resolveSelectedSlideId(previous.slides, state.selectedSlideId)
        const newSelectedTileId = resolveSelectedTileId(
          previous.slides,
          newSelectedSlideId,
          state.selectedTileId,
        )

        lastDebounce = null

        return {
          past: newPast,
          present: previous,
          future: newFuture,
          selectedSlideId: newSelectedSlideId,
          selectedTileId: newSelectedTileId,
        }
      }

      // -----------------------------------------------------------------------
      // REDO
      // -----------------------------------------------------------------------
      case 'REDO': {
        if (state.future.length === 0) return state

        const next = state.future[0]
        const newFuture = state.future.slice(1)
        const newPast = pushToPast(state.past, state.present)

        const newSelectedSlideId = resolveSelectedSlideId(next.slides, state.selectedSlideId)
        const newSelectedTileId = resolveSelectedTileId(
          next.slides,
          newSelectedSlideId,
          state.selectedTileId,
        )

        lastDebounce = null

        return {
          past: newPast,
          present: next,
          future: newFuture,
          selectedSlideId: newSelectedSlideId,
          selectedTileId: newSelectedTileId,
        }
      }

      // -----------------------------------------------------------------------
      // UI-only: SELECT_SLIDE
      // -----------------------------------------------------------------------
      case 'SELECT_SLIDE':
        return { ...state, selectedSlideId: action.payload.slideId, selectedTileId: null }

      // -----------------------------------------------------------------------
      // UI-only: SELECT_TILE
      // -----------------------------------------------------------------------
      case 'SELECT_TILE':
        return { ...state, selectedTileId: action.payload.tileId }

      // -----------------------------------------------------------------------
      // UI-only: SET_LANGUAGE (modifies Report but not part of undo history)
      // -----------------------------------------------------------------------
      case 'SET_LANGUAGE': {
        const newPresent = baseReducer(state.present, action)
        return { ...state, present: newPresent }
      }

      // -----------------------------------------------------------------------
      // Debounced content actions: UPDATE_SLIDE_DATA, UPDATE_TILE_DATA
      // -----------------------------------------------------------------------
      case 'UPDATE_SLIDE_DATA': {
        const targetId = action.payload.slideId
        const now = Date.now()
        const newPresent = baseReducer(state.present, action)

        const debounced =
          lastDebounce !== null &&
          lastDebounce.actionType === 'UPDATE_SLIDE_DATA' &&
          lastDebounce.targetId === targetId &&
          now - lastDebounce.timestamp < DEBOUNCE_MS

        lastDebounce = { actionType: 'UPDATE_SLIDE_DATA', targetId, timestamp: now }

        if (debounced) {
          // Replace running state without adding a new history entry
          return { ...state, present: newPresent, future: [] }
        }

        return {
          ...state,
          past: pushToPast(state.past, state.present),
          present: newPresent,
          future: [],
        }
      }

      case 'UPDATE_TILE_DATA': {
        const targetId = action.payload.tileId
        const now = Date.now()
        const newPresent = baseReducer(state.present, action)

        const debounced =
          lastDebounce !== null &&
          lastDebounce.actionType === 'UPDATE_TILE_DATA' &&
          lastDebounce.targetId === targetId &&
          now - lastDebounce.timestamp < DEBOUNCE_MS

        lastDebounce = { actionType: 'UPDATE_TILE_DATA', targetId, timestamp: now }

        if (debounced) {
          return { ...state, present: newPresent, future: [] }
        }

        return {
          ...state,
          past: pushToPast(state.past, state.present),
          present: newPresent,
          future: [],
        }
      }

      // -----------------------------------------------------------------------
      // Content actions: REMOVE_SLIDE (needs selection cleanup)
      // -----------------------------------------------------------------------
      case 'REMOVE_SLIDE': {
        const newPresent = baseReducer(state.present, action)
        lastDebounce = null

        const newSelectedSlideId = resolveSelectedSlideId(newPresent.slides, state.selectedSlideId)
        const newSelectedTileId =
          newSelectedSlideId === null
            ? null
            : resolveSelectedTileId(newPresent.slides, newSelectedSlideId, state.selectedTileId)

        return {
          past: pushToPast(state.past, state.present),
          present: newPresent,
          future: [],
          selectedSlideId: newSelectedSlideId,
          selectedTileId: newSelectedTileId,
        }
      }

      // -----------------------------------------------------------------------
      // Content actions: REMOVE_TILE (needs tile selection cleanup)
      // -----------------------------------------------------------------------
      case 'REMOVE_TILE': {
        const newPresent = baseReducer(state.present, action)
        lastDebounce = null

        const newSelectedTileId = resolveSelectedTileId(
          newPresent.slides,
          state.selectedSlideId,
          state.selectedTileId,
        )

        return {
          past: pushToPast(state.past, state.present),
          present: newPresent,
          future: [],
          selectedSlideId: state.selectedSlideId,
          selectedTileId: newSelectedTileId,
        }
      }

      // -----------------------------------------------------------------------
      // All other content-modifying actions
      // -----------------------------------------------------------------------
      case 'ADD_SLIDE':
      case 'REORDER_SLIDE':
      case 'ADD_TILE':
      case 'UPDATE_TILE_LAYOUT':
      case 'SET_THEME': {
        lastDebounce = null
        const newPresent = baseReducer(state.present, action)
        return {
          ...state,
          past: pushToPast(state.past, state.present),
          present: newPresent,
          future: [],
        }
      }
    }
  }
}
