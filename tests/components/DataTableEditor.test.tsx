import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTableEditor } from '../../src/components/editors/DataTableEditor'
import { ReportProvider } from '../../src/store/ReportContext'
import type { UndoableState } from '../../src/types/slide'
import type { TileConfig } from '../../src/types/layout'
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

const SLIDE_ID = 'slide-1'
const TILE_ID = 'tile-1'

function makeTile(overrides: Partial<TileConfig> = {}): TileConfig {
  return {
    id: TILE_ID,
    type: 'data-table',
    layout: { x: 0, y: 0, w: 6, h: 4 },
    data: { columns: [], rows: [] },
    options: { showHeader: true, striped: false, bordered: false },
    ...overrides,
  }
}

function makeState(tile: TileConfig): UndoableState {
  return {
    past: [],
    present: {
      slides: [
        {
          id: SLIDE_ID,
          type: 'chart',
          data: { type: 'chart' },
          tiles: [tile],
        },
      ],
      theme: ThemePreset.light,
      language: 'en',
    },
    future: [],
    selectedSlideId: SLIDE_ID,
    selectedTileId: TILE_ID,
  }
}

function renderEditor(tile: TileConfig = makeTile()) {
  return render(
    <ReportProvider initialState={makeState(tile)}>
      <DataTableEditor tile={tile} />
    </ReportProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DataTableEditor', () => {
  it('renders without crashing', () => {
    renderEditor()
    expect(screen.getByText('Tile Editor')).toBeInTheDocument()
  })

  it('renders Manual and CSV mode tabs', () => {
    renderEditor()
    expect(screen.getByText('Manual')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })

  it('renders columns section heading in manual mode', () => {
    renderEditor()
    expect(screen.getByText('Columns')).toBeInTheDocument()
  })

  it('renders rows section heading in manual mode', () => {
    renderEditor()
    expect(screen.getByText('Rows')).toBeInTheDocument()
  })

  it('renders Add Column button', () => {
    renderEditor()
    expect(screen.getByText('Add Column')).toBeInTheDocument()
  })

  it('renders Add Row button', () => {
    renderEditor()
    expect(screen.getByText('Add Row')).toBeInTheDocument()
  })

  it('renders display toggles for showHeader, striped, bordered', () => {
    renderEditor()
    expect(screen.getByText('Show Header')).toBeInTheDocument()
    expect(screen.getByText('Striped Rows')).toBeInTheDocument()
    expect(screen.getByText('Bordered')).toBeInTheDocument()
  })

  it('renders Delete Tile button', () => {
    renderEditor()
    expect(screen.getByText('Delete Tile')).toBeInTheDocument()
  })

  it('renders existing columns as header inputs', () => {
    const tile = makeTile({
      data: {
        columns: [
          { key: 'col_0', header: 'Region' },
          { key: 'col_1', header: 'Value' },
        ],
        rows: [],
      },
    })
    renderEditor(tile)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    const values = inputs.map((i) => i.value)
    expect(values).toContain('Region')
    expect(values).toContain('Value')
  })

  it('renders existing row cell inputs', () => {
    const tile = makeTile({
      data: {
        columns: [{ key: 'col_0', header: 'City' }],
        rows: [{ col_0: 'Kyiv' }, { col_0: 'Lviv' }],
      },
    })
    renderEditor(tile)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    const values = inputs.map((i) => i.value)
    expect(values).toContain('Kyiv')
    expect(values).toContain('Lviv')
  })

  it('switches to CSV mode when CSV tab is clicked', () => {
    renderEditor()
    fireEvent.click(screen.getByText('CSV'))
    expect(screen.getByPlaceholderText('Paste CSV or TSV data…')).toBeInTheDocument()
    expect(screen.getByText('Parse & Apply')).toBeInTheDocument()
  })

  it('shows CSV hint text in CSV mode', () => {
    renderEditor()
    fireEvent.click(screen.getByText('CSV'))
    expect(screen.getByText('First row = headers, subsequent rows = data')).toBeInTheDocument()
  })

  it('switches back to manual mode when Manual tab is clicked', () => {
    renderEditor()
    fireEvent.click(screen.getByText('CSV'))
    fireEvent.click(screen.getByText('Manual'))
    expect(screen.getByText('Columns')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Paste CSV or TSV data…')).toBeNull()
  })

  it('returns null when selectedSlideId is null', () => {
    const tile = makeTile()
    const stateNoSlide: UndoableState = {
      past: [],
      present: {
        slides: [],
        theme: ThemePreset.light,
        language: 'en',
      },
      future: [],
      selectedSlideId: null,
      selectedTileId: TILE_ID,
    }
    const { container } = render(
      <ReportProvider initialState={stateNoSlide}>
        <DataTableEditor tile={tile} />
      </ReportProvider>,
    )
    expect(container.firstChild).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// parseTableCsv (tested indirectly via editor behaviour)
// ---------------------------------------------------------------------------

describe('DataTableEditor CSV parsing', () => {
  it('populates columns and rows from pasted CSV after Parse & Apply', () => {
    renderEditor()
    fireEvent.click(screen.getByText('CSV'))

    const textarea = screen.getByPlaceholderText('Paste CSV or TSV data…')
    fireEvent.change(textarea, { target: { value: 'City,Pop\nKyiv,3000000\nLviv,700000' } })
    fireEvent.click(screen.getByText('Parse & Apply'))

    // After applying, switches back to manual mode and shows column headers
    expect(screen.getByText('Columns')).toBeInTheDocument()
  })
})
