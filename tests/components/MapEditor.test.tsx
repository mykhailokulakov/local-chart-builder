import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MapEditor } from '../../src/components/editors/MapEditor'
import { ReportProvider } from '../../src/store/ReportContext'
import { UKRAINE_REGIONS } from '../../src/components/charts/ChoroplethMap'
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
const TILE_ID = 'tile-map-1'

function makeMapTile(overrides: Partial<TileConfig> = {}): TileConfig {
  return {
    id: TILE_ID,
    type: 'choropleth',
    layout: { x: 0, y: 0, w: 6, h: 4 },
    data: {
      regions: [],
      legendLabel: '',
    },
    options: {},
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

function renderEditor(tile: TileConfig = makeMapTile()) {
  return render(
    <ReportProvider initialState={makeState(tile)}>
      <MapEditor tile={tile} />
    </ReportProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MapEditor', () => {
  it('renders without crashing', () => {
    renderEditor()
    expect(screen.getByText('Tile Editor')).toBeInTheDocument()
  })

  it('renders the tile editor heading', () => {
    renderEditor()
    expect(screen.getByText('Tile Editor')).toBeInTheDocument()
  })

  it('renders the legend label input with label', () => {
    renderEditor()
    expect(screen.getByLabelText('Legend Label')).toBeInTheDocument()
  })

  it('renders existing legend label value in input', () => {
    const tile = makeMapTile({ data: { regions: [], legendLabel: 'Coverage, %' } })
    renderEditor(tile)
    const input = screen.getByLabelText('Legend Label') as HTMLInputElement
    expect(input.value).toBe('Coverage, %')
  })

  it('renders Manual and CSV mode buttons', () => {
    renderEditor()
    expect(screen.getByText('Manual')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })

  it('shows all ukraine regions in manual mode by default', () => {
    renderEditor()
    // Every region should have an input with aria-label = regionId
    UKRAINE_REGIONS.forEach((regionId) => {
      expect(screen.getByLabelText(regionId)).toBeInTheDocument()
    })
  })

  it('shows the oblasts section heading', () => {
    renderEditor()
    expect(screen.getByText('Oblasts')).toBeInTheDocument()
  })

  it('shows existing region values in inputs', () => {
    const kyivOblast = 'Київська область'
    const tile = makeMapTile({
      data: {
        regions: [{ regionId: kyivOblast, label: kyivOblast, value: 75 }],
      },
    })
    renderEditor(tile)
    const input = screen.getByLabelText(kyivOblast) as HTMLInputElement
    expect(input.value).toBe('75')
  })

  it('shows CSV textarea and apply button after clicking CSV tab', () => {
    renderEditor()
    fireEvent.click(screen.getByText('CSV'))
    expect(screen.getByPlaceholderText('Paste CSV or TSV data…')).toBeInTheDocument()
    expect(screen.getByText('Parse & Apply')).toBeInTheDocument()
  })

  it('shows CSV hint text in CSV mode', () => {
    renderEditor()
    fireEvent.click(screen.getByText('CSV'))
    expect(screen.getByText('region,value — one per line')).toBeInTheDocument()
  })

  it('renders the Delete Tile button', () => {
    renderEditor()
    expect(screen.getByText('Delete Tile')).toBeInTheDocument()
  })

  it('returns null when selectedSlideId is null', () => {
    const tile = makeMapTile()
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
        <MapEditor tile={tile} />
      </ReportProvider>,
    )
    expect(container.firstChild).toBeNull()
  })
})
