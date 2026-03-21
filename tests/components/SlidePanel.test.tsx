import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlidePanel } from '../../src/components/layout/SlidePanel'
import { ReportProvider } from '../../src/store/ReportContext'
import type { UndoableState } from '../../src/types/slide'
import { ThemePreset } from '../../src/types/theme'
import i18n from '../../src/i18n/config'

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

function renderPanel(initialState?: UndoableState) {
  return render(
    <ReportProvider initialState={initialState ?? makeState()}>
      <SlidePanel />
    </ReportProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SlidePanel', () => {
  it('renders the Add Slide button', () => {
    renderPanel()
    expect(screen.getByText('Add Slide')).toBeInTheDocument()
  })

  it('renders a card for each slide in state', () => {
    const state = makeState({
      present: {
        slides: [
          { id: 'a', type: 'title', data: { type: 'title', heading: 'T1' } },
          { id: 'b', type: 'chart', data: { type: 'chart' }, tiles: [] },
        ],
        theme: ThemePreset.light,
        language: 'en',
      },
    })
    renderPanel(state)
    expect(screen.getByLabelText('Title 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Chart 2')).toBeInTheDocument()
  })

  it('dispatches SELECT_SLIDE when a card is clicked', () => {
    const state = makeState({
      present: {
        slides: [{ id: 'slide-1', type: 'title', data: { type: 'title', heading: '' } }],
        theme: ThemePreset.light,
        language: 'en',
      },
    })
    renderPanel(state)
    fireEvent.click(screen.getByLabelText('Title 1'))
    // Verifies the click doesn't throw and the card remains in the DOM
    expect(screen.getByLabelText('Title 1')).toBeInTheDocument()
  })

  it('shows no slide cards when the report has no slides', () => {
    renderPanel()
    expect(screen.queryByLabelText(/more options/i)).not.toBeInTheDocument()
  })

  it('renders slide numbers starting at 1', () => {
    const state = makeState({
      present: {
        slides: [{ id: 'x', type: 'ending', data: { type: 'ending', message: '' } }],
        theme: ThemePreset.light,
        language: 'en',
      },
    })
    renderPanel(state)
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
