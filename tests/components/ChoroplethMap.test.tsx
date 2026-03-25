import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChoroplethMap, UKRAINE_REGIONS } from '../../src/components/charts/ChoroplethMap'
import type { ChoroplethRegionData } from '../../src/types/chart'
import type { ThemeColors } from '../../src/types/theme'
import i18n from '../../src/i18n/config'

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const THEME: ThemeColors = {
  background: '#0c1a28',
  surface: '#162435',
  foreground: '#ffffff',
  muted: '#6b7280',
  accent: '#38bdf8',
  accentSecondary: '#0284c7',
  chartColors: ['#38bdf8', '#0284c7'],
  fontFamily: 'e-Ukraine, sans-serif',
}

const VALUE_RANGE = { min: 0, max: 100 }

function makeRegionData(count = 3): ChoroplethRegionData[] {
  return UKRAINE_REGIONS.slice(0, count).map((regionId, i) => ({
    regionId,
    label: regionId,
    value: (i + 1) * 10,
  }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChoroplethMap', () => {
  it('renders without crashing with empty data', () => {
    const { container } = render(<ChoroplethMap data={[]} theme={THEME} valueRange={VALUE_RANGE} />)
    expect(container.firstChild).not.toBeNull()
  })

  it('shows no data message when data array is empty', () => {
    render(<ChoroplethMap data={[]} theme={THEME} valueRange={VALUE_RANGE} />)
    expect(screen.getByText('No data to display')).toBeInTheDocument()
  })

  it('renders SVG element when data is provided', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={VALUE_RANGE} />)
    const svg = document.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('renders oblast path geometry when data is provided', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={VALUE_RANGE} />)
    const paths = document.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(20)
  })

  it('SVG has correct viewBox', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={VALUE_RANGE} />)
    const svg = document.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 800 540')
  })

  it('SVG has aria-label', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={VALUE_RANGE} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Ukraine choropleth map')
  })

  it('SVG has role img', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={VALUE_RANGE} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders Crimea note text in SVG', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={VALUE_RANGE} />)
    expect(screen.getByText('Crimea is Ukraine')).toBeInTheDocument()
  })

  it('renders legend label when provided', () => {
    render(
      <ChoroplethMap
        data={makeRegionData()}
        theme={THEME}
        valueRange={VALUE_RANGE}
        legendLabel="Coverage, %"
      />,
    )
    expect(screen.getByText('Coverage, %')).toBeInTheDocument()
  })

  it('does not render legend label section when not provided', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={VALUE_RANGE} />)
    expect(screen.queryByText('Coverage, %')).toBeNull()
  })

  it('renders value labels for non-Crimea regions with data', () => {
    // Skip index 0 (Crimea — shown with special styling, no numeric label)
    const data = makeRegionData(4).slice(1, 2) // first non-Crimea region
    render(<ChoroplethMap data={data} theme={THEME} valueRange={VALUE_RANGE} />)
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('renders min and max legend values', () => {
    render(<ChoroplethMap data={makeRegionData()} theme={THEME} valueRange={{ min: 5, max: 95 }} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
  })
})

describe('UKRAINE_REGIONS', () => {
  it('contains 26 entries (24 oblasts + Crimea + Sevastopol)', () => {
    expect(UKRAINE_REGIONS).toHaveLength(26)
  })

  it('contains Crimea entry', () => {
    expect(UKRAINE_REGIONS).toContain('Автономна Республіка Крим')
  })

  it('contains Sevastopol entry', () => {
    expect(UKRAINE_REGIONS).toContain('Севастополь')
  })

  it('contains Kyiv oblast entry', () => {
    expect(UKRAINE_REGIONS).toContain('Київська область')
  })

  it('all entries are non-empty strings', () => {
    UKRAINE_REGIONS.forEach((region) => {
      expect(typeof region).toBe('string')
      expect(region.length).toBeGreaterThan(0)
    })
  })
})
