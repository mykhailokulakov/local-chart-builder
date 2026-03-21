import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Canvas } from '../../src/components/layout/Canvas'
import { ReportProvider } from '../../src/store/ReportContext'
import type { UndoableState } from '../../src/types/slide'
import { ThemePreset } from '../../src/types/theme'
import i18n from '../../src/i18n/config'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// useContainerSize uses ResizeObserver which is unavailable in jsdom.
// Return a fixed 800×600 size so Canvas can compute a non-zero slide frame.
vi.mock('../../src/hooks/useContainerSize', () => ({
  useContainerSize: () => ({ width: 800, height: 600 }),
}))

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(overrides: Partial<UndoableState> = {}): UndoableState {
  return {
    past: [],
    present: {
      slides: [],
      theme: ThemePreset.light,
      language: 'en',
    },
    future: [],
    selectedSlideId: null,
    selectedTileId: null,
    ...overrides,
  }
}

function renderCanvas(initialState?: UndoableState) {
  return render(
    <ReportProvider initialState={initialState ?? makeState()}>
      <Canvas />
    </ReportProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Canvas', () => {
  it('renders without crashing when no slide is selected', () => {
    renderCanvas()
    expect(screen.getByText('Select a slide to preview')).toBeInTheDocument()
  })

  it('shows status bar with slide count when a slide is selected', () => {
    const state = makeState({
      present: {
        slides: [{ id: 'a', type: 'title', data: { type: 'title', heading: 'Test' } }],
        theme: ThemePreset.light,
        language: 'en',
      },
      selectedSlideId: 'a',
    })
    renderCanvas(state)
    expect(screen.getByText('Slide 1 of 1')).toBeInTheDocument()
  })

  it('renders the tile toolbar only for chart-type slides', () => {
    const chartState = makeState({
      present: {
        slides: [{ id: 'c', type: 'chart', data: { type: 'chart' }, tiles: [] }],
        theme: ThemePreset.light,
        language: 'en',
      },
      selectedSlideId: 'c',
    })
    renderCanvas(chartState)
    // Toolbar buttons for tile types should be visible
    expect(screen.getByText('Bar')).toBeInTheDocument()
    expect(screen.getByText('Donut')).toBeInTheDocument()
  })

  it('does not render the tile toolbar for non-chart slides', () => {
    const titleState = makeState({
      present: {
        slides: [{ id: 't', type: 'title', data: { type: 'title', heading: '' } }],
        theme: ThemePreset.light,
        language: 'en',
      },
      selectedSlideId: 't',
    })
    renderCanvas(titleState)
    expect(screen.queryByText('Bar')).not.toBeInTheDocument()
  })

  it('shows the hint for a title slide', () => {
    const state = makeState({
      present: {
        slides: [{ id: 't', type: 'title', data: { type: 'title', heading: '' } }],
        theme: ThemePreset.light,
        language: 'en',
      },
      selectedSlideId: 't',
    })
    renderCanvas(state)
    expect(screen.getByText('Edit properties in the right panel')).toBeInTheDocument()
  })

  it('shows the hint for a chart slide', () => {
    const state = makeState({
      present: {
        slides: [{ id: 'c', type: 'chart', data: { type: 'chart' }, tiles: [] }],
        theme: ThemePreset.light,
        language: 'en',
      },
      selectedSlideId: 'c',
    })
    renderCanvas(state)
    expect(screen.getByText('Drag to move · Resize from corners')).toBeInTheDocument()
  })
})
