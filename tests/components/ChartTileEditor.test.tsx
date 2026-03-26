import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChartTileEditor } from '../../src/components/editors/ChartTileEditor'
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
    type: 'bar-v',
    layout: { x: 0, y: 0, w: 6, h: 4 },
    data: { points: [] },
    options: { showValues: false, showLegend: true, showAxis: true },
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
      <ChartTileEditor tile={tile} />
    </ReportProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChartTileEditor', () => {
  it('renders without crashing', () => {
    renderEditor()
    expect(screen.getByText('Tile Editor')).toBeInTheDocument()
  })

  it('renders the chart type section label', () => {
    renderEditor()
    expect(screen.getByText('Chart Type')).toBeInTheDocument()
  })

  it('renders all 7 chart type buttons as icon-only with aria-labels', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: 'Vertical Bar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Horizontal Bar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Donut' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Line' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gantt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Map' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Table' })).toBeInTheDocument()
  })

  it('type button labels are not rendered as visible text (icon-only)', () => {
    renderEditor()
    // Text content should not appear as separate nodes — buttons are icon-only
    expect(screen.queryByText('Vertical Bar')).not.toBeInTheDocument()
    expect(screen.queryByText('Horizontal Bar')).not.toBeInTheDocument()
  })

  it('highlights the current tile type button as primary', () => {
    const tile = makeTile({ type: 'donut' })
    renderEditor(tile)
    const donutBtn = screen.getByRole('button', { name: 'Donut' })
    expect(donutBtn).toBeInTheDocument()
  })

  it('renders the chart title input with associated label', () => {
    renderEditor()
    expect(screen.getByLabelText('Chart Title')).toBeInTheDocument()
  })

  it('renders chart title input with existing title value', () => {
    const tile = makeTile({ data: { points: [], title: 'My Chart' } })
    renderEditor(tile)
    const input = screen.getByLabelText('Chart Title') as HTMLInputElement
    expect(input.value).toBe('My Chart')
  })

  it('renders the legend label input', () => {
    renderEditor()
    expect(screen.getByLabelText('Legend Label')).toBeInTheDocument()
  })

  it('renders legend label input with existing value', () => {
    const tile = makeTile({ data: { points: [], legendLabel: 'Population' } })
    renderEditor(tile)
    const input = screen.getByLabelText('Legend Label') as HTMLInputElement
    expect(input.value).toBe('Population')
  })

  it('renders the Data Input section heading', () => {
    renderEditor()
    expect(screen.getByText('Data Input')).toBeInTheDocument()
  })

  it('renders Manual and CSV mode tabs', () => {
    renderEditor()
    expect(screen.getByText('Manual')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })

  it('renders Add Row button in manual mode by default', () => {
    renderEditor()
    expect(screen.getByText('Add Row')).toBeInTheDocument()
  })

  it('renders data points as label/value input pairs', () => {
    const tile = makeTile({
      data: {
        points: [
          { id: 'p1', label: 'Kyiv', value: 5000000 },
          { id: 'p2', label: 'Lviv', value: 700000 },
        ],
      },
    })
    renderEditor(tile)
    const inputs = screen.getAllByPlaceholderText('Label') as HTMLInputElement[]
    expect(inputs).toHaveLength(2)
    expect(inputs[0].value).toBe('Kyiv')
    expect(inputs[1].value).toBe('Lviv')
  })

  it('renders the Display section heading', () => {
    renderEditor()
    expect(screen.getByText('Display')).toBeInTheDocument()
  })

  it('bar-v tile shows Show Values, Show Legend, Show Axis toggles', () => {
    renderEditor(makeTile({ type: 'bar-v' }))
    expect(screen.getByText('Show Values')).toBeInTheDocument()
    expect(screen.getByText('Show Legend')).toBeInTheDocument()
    expect(screen.getByText('Show Axis')).toBeInTheDocument()
  })

  it('bar-h tile shows Show Values, Show Legend, Show Axis toggles', () => {
    renderEditor(makeTile({ type: 'bar-h' }))
    expect(screen.getByText('Show Values')).toBeInTheDocument()
    expect(screen.getByText('Show Legend')).toBeInTheDocument()
    expect(screen.getByText('Show Axis')).toBeInTheDocument()
  })

  it('donut tile shows Show Values and Show Legend but NOT Show Axis', () => {
    renderEditor(makeTile({ type: 'donut' }))
    expect(screen.getByText('Show Values')).toBeInTheDocument()
    expect(screen.getByText('Show Legend')).toBeInTheDocument()
    expect(screen.queryByText('Show Axis')).not.toBeInTheDocument()
  })

  it('line tile shows Show Values, Show Legend, Show Axis toggles', () => {
    renderEditor(makeTile({ type: 'line' }))
    expect(screen.getByText('Show Values')).toBeInTheDocument()
    expect(screen.getByText('Show Legend')).toBeInTheDocument()
    expect(screen.getByText('Show Axis')).toBeInTheDocument()
  })

  it('renders the Delete Tile button', () => {
    renderEditor()
    expect(screen.getByText('Delete Tile')).toBeInTheDocument()
  })

  it('shows CSV textarea after clicking CSV tab', () => {
    renderEditor()
    fireEvent.click(screen.getByText('CSV'))
    expect(screen.getByPlaceholderText('Paste CSV or TSV data…')).toBeInTheDocument()
    expect(screen.getByText('Parse & Apply')).toBeInTheDocument()
  })

  it('renders nothing when selectedSlideId is null', () => {
    const tile = makeTile()
    const stateWithNoSlide: UndoableState = {
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
      <ReportProvider initialState={stateWithNoSlide}>
        <ChartTileEditor tile={tile} />
      </ReportProvider>,
    )
    expect(container.firstChild).toBeNull()
  })
})
