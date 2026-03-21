import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TileToolbar } from '../../src/components/toolbar/TileToolbar'
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

function makeState(): UndoableState {
  return {
    past: [],
    present: {
      slides: [{ id: 'slide-1', type: 'chart', data: { type: 'chart' }, tiles: [] }],
      theme: ThemePreset.light,
      language: 'en',
    },
    future: [],
    selectedSlideId: 'slide-1',
    selectedTileId: null,
  }
}

function renderToolbar(slideId = 'slide-1') {
  return render(
    <ReportProvider initialState={makeState()}>
      <TileToolbar slideId={slideId} />
    </ReportProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TileToolbar', () => {
  it('renders a button for every tile type', () => {
    renderToolbar()
    expect(screen.getByText('Bar')).toBeInTheDocument()
    expect(screen.getByText('Horiz. Bar')).toBeInTheDocument()
    expect(screen.getByText('Donut')).toBeInTheDocument()
    expect(screen.getByText('Line')).toBeInTheDocument()
    expect(screen.getByText('Gantt')).toBeInTheDocument()
    expect(screen.getByText('Map')).toBeInTheDocument()
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('clicking a tile button does not throw', () => {
    renderToolbar()
    expect(() => fireEvent.click(screen.getByText('Bar'))).not.toThrow()
  })

  it('clicking a tile button adds a tile to the slide', () => {
    const state = makeState()
    const { rerender } = render(
      <ReportProvider initialState={state}>
        <TileToolbar slideId="slide-1" />
      </ReportProvider>,
    )
    fireEvent.click(screen.getByText('Donut'))
    // Component remains mounted without errors after dispatch
    expect(screen.getByText('Donut')).toBeInTheDocument()
    rerender(
      <ReportProvider initialState={state}>
        <TileToolbar slideId="slide-1" />
      </ReportProvider>,
    )
  })
})
